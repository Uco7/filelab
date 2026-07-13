import { useState, useRef, useEffect, useCallback } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { loadPdfJs } from '../../lib/pdfjs.js'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function fileToPngDataUrl(file) {
  return loadImage(URL.createObjectURL(file)).then((img) => {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    canvas.getContext('2d').drawImage(img, 0, 0)
    return { dataUrl: canvas.toDataURL('image/png'), width: img.naturalWidth, height: img.naturalHeight }
  })
}

function hexToRgb01(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255
  }
}

export default function SignDocument() {
  const [docFile, setDocFile] = useState(null)
  const [docKind, setDocKind] = useState(null) // 'pdf' | 'image'
  const [previewUrl, setPreviewUrl] = useState(null) // always a flat raster image, either the upload itself or a rendered PDF page
  const [previewError, setPreviewError] = useState(false)
  const [pageCount, setPageCount] = useState(1)
  const [pageNum, setPageNum] = useState(1)

  const [sigMode, setSigMode] = useState('draw') // 'draw' | 'upload'
  const [uploadedSig, setUploadedSig] = useState(null)
  const [drawnSig, setDrawnSig] = useState(null)
  const [color, setColor] = useState('#1B1F23')

  // New-signature placement, as percentages of the page/image
  const [x, setX] = useState(60)
  const [y, setY] = useState(75)
  const [width, setWidth] = useState(25)

  // Eraser mode, for removing an existing signature before placing a new one
  const [tool, setTool] = useState('place') // 'place' | 'erase'
  const [eraseRect, setEraseRect] = useState(null) // { x, y, w, h } in % of the page/image
  const [eraseColor, setEraseColor] = useState('#FFFFFF')

  // Document color adjustment (image documents only)
  const [brightness, setBrightness] = useState(100)
  const [grayscale, setGrayscale] = useState(false)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const drawPadRef = useRef(null)
  const drawing = useRef(false)

  const previewCanvasRef = useRef(null)
  const baseImgRef = useRef(null)
  const sigImgRef = useRef(null)
  const [, forceTick] = useState(0)
  const rerender = () => forceTick((t) => t + 1)

  const dragState = useRef(null) // { kind: 'move'|'erase', ... }

  const activeSig = sigMode === 'draw' ? drawnSig : uploadedSig

  // --- Load the base document image whenever previewUrl changes ---
  useEffect(() => {
    if (!previewUrl) return
    setPreviewError(false)
    let cancelled = false
    loadImage(previewUrl)
      .then((img) => {
        if (cancelled) return
        baseImgRef.current = img
        rerender()
      })
      .catch(() => {
        if (!cancelled) setPreviewError(true)
      })
    return () => {
      cancelled = true
    }
  }, [previewUrl])

  // --- Load the signature image whenever it changes ---
  useEffect(() => {
    if (!activeSig) {
      sigImgRef.current = null
      rerender()
      return
    }
    let cancelled = false
    loadImage(activeSig.dataUrl).then((img) => {
      if (!cancelled) {
        sigImgRef.current = img
        rerender()
      }
    })
    return () => {
      cancelled = true
    }
  }, [activeSig])

  // --- Draw the live preview canvas (this is the single source of truth —
  // the exported file is built the same way, at full resolution, so what
  // you see here is exactly what you'll get) ---
  const draw = useCallback(
    (ctx, w, h) => {
      const baseImg = baseImgRef.current
      if (!baseImg) return

      const filters = []
      if (docKind === 'image') {
        if (brightness !== 100) filters.push(`brightness(${brightness}%)`)
        if (grayscale) filters.push('grayscale(1)')
      }
      ctx.filter = filters.length ? filters.join(' ') : 'none'
      ctx.drawImage(baseImg, 0, 0, w, h)
      ctx.filter = 'none'

      if (eraseRect && eraseRect.w > 0.3 && eraseRect.h > 0.3) {
        ctx.fillStyle = eraseColor
        ctx.fillRect((eraseRect.x / 100) * w, (eraseRect.y / 100) * h, (eraseRect.w / 100) * w, (eraseRect.h / 100) * h)
      }

      const sigImg = sigImgRef.current
      if (sigImg && activeSig) {
        const sigW = (width / 100) * w
        const sigH = sigW * (activeSig.height / activeSig.width)
        const sigX = (x / 100) * w
        const sigY = (y / 100) * h
        ctx.drawImage(sigImg, sigX, sigY, sigW, sigH)
        if (tool === 'place') {
          ctx.save()
          ctx.strokeStyle = '#F2A93B'
          ctx.lineWidth = Math.max(1.5, w / 400)
          ctx.setLineDash([6, 4])
          ctx.strokeRect(sigX, sigY, sigW, sigH)
          ctx.restore()
        }
      }
    },
    [docKind, brightness, grayscale, eraseRect, eraseColor, activeSig, x, y, width, tool]
  )

  // Redraw the on-screen preview canvas whenever anything relevant changes
  useEffect(() => {
    const canvas = previewCanvasRef.current
    const baseImg = baseImgRef.current
    if (!canvas || !baseImg) return
    const dpr = window.devicePixelRatio || 1
    const displayW = canvas.clientWidth || 600
    const displayH = displayW * (baseImg.naturalHeight / baseImg.naturalWidth)
    canvas.width = displayW * dpr
    canvas.height = displayH * dpr
    canvas.style.height = `${displayH}px`
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, displayW, displayH)
    draw(ctx, displayW, displayH)
  })

  async function handleDocFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setError('')
    setDocFile(f)
    setEraseRect(null)
    baseImgRef.current = null
    if (f.type === 'application/pdf') {
      setDocKind('pdf')
      setBusy(true)
      try {
        const pdfjsLib = await loadPdfJs()
        const bytes = await f.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
        setPageCount(pdf.numPages)
        setPageNum(1)
        await renderPdfPreview(pdf, 1)
      } catch (err) {
        console.error(err)
        setError('Couldn\u2019t read that PDF.')
      } finally {
        setBusy(false)
      }
    } else {
      setDocKind('image')
      setPageCount(1)
      setPreviewUrl(URL.createObjectURL(f))
    }
  }

  async function renderPdfPreview(pdf, n) {
    const page = await pdf.getPage(n)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    setPreviewUrl(canvas.toDataURL('image/png'))
  }

  async function changePage(n) {
    if (!docFile || n < 1 || n > pageCount) return
    setBusy(true)
    try {
      const pdfjsLib = await loadPdfJs()
      const bytes = await docFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
      await renderPdfPreview(pdf, n)
      setPageNum(n)
      setEraseRect(null)
    } finally {
      setBusy(false)
    }
  }

  async function handleSigUpload(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setUploadedSig(await fileToPngDataUrl(f))
  }

  // --- Signature drawing pad (unrelated canvas — just for freehand drawing) ---
  function getPadPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const point = e.touches ? e.touches[0] : e
    return { x: point.clientX - rect.left, y: point.clientY - rect.top }
  }

  useEffect(() => {
    const canvas = drawPadRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [sigMode])

  function startPad(e) {
    e.preventDefault()
    drawing.current = true
    const canvas = drawPadRef.current
    const ctx = canvas.getContext('2d')
    const { x: px, y: py } = getPadPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(px, py)
  }
  function movePad(e) {
    if (!drawing.current) return
    e.preventDefault()
    const canvas = drawPadRef.current
    const ctx = canvas.getContext('2d')
    const { x: px, y: py } = getPadPos(e, canvas)
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.lineTo(px, py)
    ctx.stroke()
  }
  function endPad() {
    drawing.current = false
  }
  function clearPad() {
    const canvas = drawPadRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setDrawnSig(null)
  }
  function usePadDrawing() {
    const canvas = drawPadRef.current
    const ctx = canvas.getContext('2d')
    const { width: w, height: h } = canvas
    const imageData = ctx.getImageData(0, 0, w, h)
    const { data } = imageData
    let minX = w, minY = h, maxX = 0, maxY = 0
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        if (data[(yy * w + xx) * 4 + 3] > 10) {
          if (xx < minX) minX = xx
          if (xx > maxX) maxX = xx
          if (yy < minY) minY = yy
          if (yy > maxY) maxY = yy
        }
      }
    }
    if (maxX < minX || maxY < minY) return
    const pad = 8
    minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad)
    maxX = Math.min(w, maxX + pad); maxY = Math.min(h, maxY + pad)
    const trimmed = document.createElement('canvas')
    trimmed.width = maxX - minX
    trimmed.height = maxY - minY
    trimmed.getContext('2d').putImageData(ctx.getImageData(minX, minY, maxX - minX, maxY - minY), 0, 0)
    setDrawnSig({ dataUrl: trimmed.toDataURL('image/png'), width: trimmed.width, height: trimmed.height })
  }

  // --- Interaction on the live preview canvas: drag to move the signature,
  // or drag to select an area to erase, depending on the active tool ---
  function canvasRelativePct(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const point = e.touches ? e.touches[0] : e
    const px = Math.min(Math.max(point.clientX - rect.left, 0), rect.width)
    const py = Math.min(Math.max(point.clientY - rect.top, 0), rect.height)
    return { xPct: (px / rect.width) * 100, yPct: (py / rect.height) * 100 }
  }

  function isInsideSig(xPct, yPct) {
    if (!activeSig) return false
    const sigW = width
    const sigH = width * (activeSig.height / activeSig.width)
    return xPct >= x && xPct <= x + sigW && yPct >= y && yPct <= y + sigH
  }

  function onCanvasDown(e) {
    if (!baseImgRef.current) return
    const canvas = previewCanvasRef.current
    const { xPct, yPct } = canvasRelativePct(e, canvas)

    if (tool === 'erase') {
      e.preventDefault()
      dragState.current = { kind: 'erase', startX: xPct, startY: yPct }
      setEraseRect({ x: xPct, y: yPct, w: 0, h: 0 })
      return
    }

    if (tool === 'place' && activeSig && isInsideSig(xPct, yPct)) {
      e.preventDefault()
      dragState.current = { kind: 'move', offsetX: xPct - x, offsetY: yPct - y }
    }
  }

  function onCanvasMove(e) {
    const d = dragState.current
    if (!d) return
    e.preventDefault()
    const canvas = previewCanvasRef.current
    const { xPct, yPct } = canvasRelativePct(e, canvas)

    if (d.kind === 'erase') {
      setEraseRect({
        x: Math.min(d.startX, xPct),
        y: Math.min(d.startY, yPct),
        w: Math.abs(xPct - d.startX),
        h: Math.abs(yPct - d.startY)
      })
    } else if (d.kind === 'move') {
      setX(Math.min(95, Math.max(0, xPct - d.offsetX)))
      setY(Math.min(95, Math.max(0, yPct - d.offsetY)))
    }
  }

  function onCanvasUp() {
    dragState.current = null
  }

  // --- Apply everything and export, at full resolution, using the exact
  // same drawing logic as the live preview ---
  async function applyAndDownload() {
    if (!docFile || !activeSig) return
    setBusy(true)
    setError('')
    try {
      if (docKind === 'pdf') {
        const { PDFDocument, rgb } = await import('pdf-lib')
        const bytes = await docFile.arrayBuffer()
        const pdfDoc = await PDFDocument.load(bytes)
        const page = pdfDoc.getPages()[pageNum - 1]
        const { width: pw, height: ph } = page.getSize()

        if (eraseRect && eraseRect.w > 0.3 && eraseRect.h > 0.3) {
          const { r, g, b } = hexToRgb01(eraseColor)
          const ex = (eraseRect.x / 100) * pw
          const eyTop = (eraseRect.y / 100) * ph
          const ew = (eraseRect.w / 100) * pw
          const eh = (eraseRect.h / 100) * ph
          page.drawRectangle({ x: ex, y: ph - eyTop - eh, width: ew, height: eh, color: rgb(r, g, b) })
        }

        const sigBytes = await (await fetch(activeSig.dataUrl)).arrayBuffer()
        const pngImage = await pdfDoc.embedPng(new Uint8Array(sigBytes))
        const sigWidthPts = (width / 100) * pw
        const sigHeightPts = sigWidthPts * (activeSig.height / activeSig.width)
        const xPts = (x / 100) * pw
        const yPts = ph - (y / 100) * ph - sigHeightPts

        page.drawImage(pngImage, { x: xPts, y: yPts, width: sigWidthPts, height: sigHeightPts })
        const outBytes = await pdfDoc.save()
        saveAs(new Blob([outBytes], { type: 'application/pdf' }), `${docFile.name.replace(/\.[^.]+$/, '')}-signed.pdf`)
      } else {
        const baseImg = baseImgRef.current
        const canvas = document.createElement('canvas')
        canvas.width = baseImg.naturalWidth
        canvas.height = baseImg.naturalHeight
        const ctx = canvas.getContext('2d')
        // Same draw() function the live preview uses, at full resolution —
        // guarantees the download matches what you saw on screen.
        draw(ctx, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          saveAs(blob, `${docFile.name.replace(/\.[^.]+$/, '')}-signed.png`)
        }, 'image/png')
      }
    } catch (err) {
      console.error(err)
      setError('Something went wrong applying the signature. Try a smaller signature image or a different page.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SEO
        title="Sign a Document — Add, Move, or Replace a Signature on a PDF or Image"
        description="Draw or upload a signature, drag it into place, erase an old signature first if needed, and download the signed PDF or image. Free, runs in your browser."
        path="/tools/sign-document"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Sign a Document</h1>
        <p className="text-ink/60 mb-8">
          Upload a PDF or image, draw or upload a signature, drag it directly into place, and
          download the signed file. You can also erase an existing signature first if you're
          replacing one — the preview below updates live, so you can see exactly what you're
          about to download before you download it.
        </p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="image/*,application/pdf" onChange={handleDocFile} className="hidden" id="sign-doc-upload" />
          <label htmlFor="sign-doc-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            Choose a PDF or image to sign
          </label>
          {docFile && <p className="text-sm text-ink/50 mt-3">Uploaded: {docFile.name}</p>}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {previewError && (
          <p className="text-red-600 text-sm mb-4">
            That file uploaded, but couldn't be rendered for preview — try a different PDF or image.
          </p>
        )}
        {docFile && !previewUrl && !previewError && (
          <p className="text-ink/40 text-sm mb-4">Loading preview…</p>
        )}

        {docKind === 'pdf' && pageCount > 1 && (
          <div className="flex items-center gap-3 mb-4 text-sm">
            <button onClick={() => changePage(pageNum - 1)} disabled={pageNum <= 1} className="px-3 py-1 rounded-lg bg-board/10 disabled:opacity-30">Prev</button>
            <span>Page {pageNum} of {pageCount}</span>
            <button onClick={() => changePage(pageNum + 1)} disabled={pageNum >= pageCount} className="px-3 py-1 rounded-lg bg-board/10 disabled:opacity-30">Next</button>
          </div>
        )}

        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            <button onClick={() => setSigMode('draw')} className={`text-sm px-4 py-2 rounded-lg ${sigMode === 'draw' ? 'bg-amber text-ink' : 'bg-board/10'}`}>Draw signature</button>
            <button onClick={() => setSigMode('upload')} className={`text-sm px-4 py-2 rounded-lg ${sigMode === 'upload' ? 'bg-amber text-ink' : 'bg-board/10'}`}>Upload signature image</button>
          </div>

          {sigMode === 'draw' ? (
            <div>
              <div className="rounded-lg border-2 border-board/20 bg-[repeating-conic-gradient(#f0f0f0_0%_25%,white_0%_50%)] bg-[length:16px_16px] mb-3" style={{ height: 160 }}>
                <canvas
                  ref={drawPadRef}
                  className="w-full h-full touch-none cursor-crosshair"
                  onMouseDown={startPad}
                  onMouseMove={movePad}
                  onMouseUp={endPad}
                  onMouseLeave={endPad}
                  onTouchStart={startPad}
                  onTouchMove={movePad}
                  onTouchEnd={endPad}
                />
              </div>
              <div className="flex items-center gap-3">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8" />
                <button onClick={clearPad} className="text-sm bg-board/10 px-4 py-2 rounded-lg">Clear</button>
                <button onClick={usePadDrawing} className="text-sm bg-mint text-ink font-medium px-4 py-2 rounded-lg">Use this drawing</button>
                {drawnSig && <span className="text-xs text-ink/40">Signature ready ✓</span>}
              </div>
            </div>
          ) : (
            <div>
              <input type="file" accept="image/*" onChange={handleSigUpload} className="hidden" id="sig-file-upload" />
              <label htmlFor="sig-file-upload" className="cursor-pointer inline-block bg-board/10 px-4 py-2 rounded-lg text-sm">
                Choose signature image
              </label>
              {uploadedSig && <span className="text-xs text-ink/40 ml-3">Signature ready ✓</span>}
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="mb-4">
            <div className="flex gap-2 mb-3">
              <button onClick={() => setTool('place')} className={`text-sm px-4 py-2 rounded-lg ${tool === 'place' ? 'bg-amber text-ink' : 'bg-board/10'}`}>
                Position new signature
              </button>
              <button onClick={() => setTool('erase')} className={`text-sm px-4 py-2 rounded-lg ${tool === 'erase' ? 'bg-amber text-ink' : 'bg-board/10'}`}>
                Remove an old signature first
              </button>
            </div>
            {tool === 'erase' ? (
              <div className="flex items-center gap-3 mb-3 text-sm text-ink/60">
                <span>Drag a box over the old signature — it's painted over immediately below:</span>
                <input type="color" value={eraseColor} onChange={(e) => setEraseColor(e.target.value)} className="w-8 h-8" />
              </div>
            ) : (
              activeSig && <p className="text-sm text-ink/60 mb-3">Drag the signature (outlined in amber) directly on the preview, or use the sliders below.</p>
            )}
          </div>
        )}

        {previewUrl && (
          <div className="mb-6">
            <canvas
              ref={previewCanvasRef}
              className="w-full border border-board/20 rounded-lg block"
              style={{ cursor: tool === 'erase' ? 'crosshair' : activeSig ? 'move' : 'default', touchAction: 'none' }}
              onMouseDown={onCanvasDown}
              onMouseMove={onCanvasMove}
              onMouseUp={onCanvasUp}
              onMouseLeave={onCanvasUp}
              onTouchStart={onCanvasDown}
              onTouchMove={onCanvasMove}
              onTouchEnd={onCanvasUp}
            />
          </div>
        )}

        {previewUrl && activeSig && tool === 'place' && (
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1">Horizontal position ({Math.round(x)}%)</label>
              <input type="range" min="0" max="95" value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vertical position ({Math.round(y)}%)</label>
              <input type="range" min="0" max="95" value={y} onChange={(e) => setY(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Signature width ({width}%)</label>
              <input type="range" min="5" max="60" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full" />
            </div>
          </div>
        )}

        {docKind === 'image' && previewUrl && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8 bg-board-light/10 border border-board/10 rounded-xl p-4">
            <div>
              <label className="block text-sm font-medium mb-1">Document brightness ({brightness}%)</label>
              <input type="range" min="40" max="160" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full" />
            </div>
            <label className="flex items-center gap-2 text-sm mt-6">
              <input type="checkbox" checked={grayscale} onChange={(e) => setGrayscale(e.target.checked)} />
              Convert document to grayscale
            </label>
          </div>
        )}
        {docKind === 'pdf' && previewUrl && (
          <p className="text-ink/40 text-xs mb-8">
            Brightness/grayscale adjustment currently works on image documents only — a PDF
            page's original content stays as-is apart from the signature (and erased area, if used).
          </p>
        )}

        <button
          onClick={applyAndDownload}
          disabled={!docFile || !activeSig || busy}
          className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40"
        >
          {busy ? 'Applying…' : 'Download signed file'}
        </button>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
