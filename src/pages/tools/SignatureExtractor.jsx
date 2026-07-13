import { useState, useRef, useEffect } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { loadPdfJs } from '../../lib/pdfjs.js'

export default function SignatureExtractor() {
  const [sourceUrl, setSourceUrl] = useState(null) // image or rendered PDF page, as a data/object URL
  const [fileName, setFileName] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pdfFile, setPdfFile] = useState(null)
  const [selection, setSelection] = useState(null) // { x, y, w, h } in displayed (CSS) pixels
  const [threshold, setThreshold] = useState(190)
  const [inkColor, setInkColor] = useState('#141420')
  const [resultUrl, setResultUrl] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const imgRef = useRef(null)
  const containerRef = useRef(null)
  const dragStart = useRef(null)

  async function renderPdfPage(file, n) {
    const pdfjsLib = await loadPdfJs()
    const bytes = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
    setPageCount(pdf.numPages)
    const page = await pdf.getPage(n)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    return canvas.toDataURL('image/png')
  }

  async function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFileName(f.name)
    setSelection(null)
    setResultUrl(null)
    setError('')
    if (f.type === 'application/pdf') {
      setPdfFile(f)
      setBusy(true)
      try {
        const dataUrl = await renderPdfPage(f, 1)
        setPageNum(1)
        setSourceUrl(dataUrl)
      } catch (err) {
        console.error(err)
        setError('Couldn\u2019t read that PDF.')
      } finally {
        setBusy(false)
      }
    } else {
      setPdfFile(null)
      setPageCount(0)
      setSourceUrl(URL.createObjectURL(f))
    }
  }

  async function changePage(n) {
    if (!pdfFile || n < 1 || n > pageCount) return
    setBusy(true)
    setSelection(null)
    setResultUrl(null)
    try {
      const dataUrl = await renderPdfPage(pdfFile, n)
      setPageNum(n)
      setSourceUrl(dataUrl)
    } finally {
      setBusy(false)
    }
  }

  function getRelativePos(e) {
    const rect = containerRef.current.getBoundingClientRect()
    const point = e.touches ? e.touches[0] : e
    return {
      x: Math.min(Math.max(point.clientX - rect.left, 0), rect.width),
      y: Math.min(Math.max(point.clientY - rect.top, 0), rect.height)
    }
  }

  function startDrag(e) {
    e.preventDefault()
    const pos = getRelativePos(e)
    dragStart.current = pos
    setSelection({ x: pos.x, y: pos.y, w: 0, h: 0 })
    setResultUrl(null)
  }

  function duringDrag(e) {
    if (!dragStart.current) return
    e.preventDefault()
    const pos = getRelativePos(e)
    const start = dragStart.current
    setSelection({
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      w: Math.abs(pos.x - start.x),
      h: Math.abs(pos.y - start.y)
    })
  }

  function endDrag() {
    dragStart.current = null
  }

  function extract() {
    if (!selection || selection.w < 4 || selection.h < 4 || !imgRef.current) return
    setBusy(true)
    setError('')
    try {
      const img = imgRef.current
      const scaleX = img.naturalWidth / img.clientWidth
      const scaleY = img.naturalHeight / img.clientHeight

      const sx = selection.x * scaleX
      const sy = selection.y * scaleY
      const sw = selection.w * scaleX
      const sh = selection.h * scaleY

      const canvas = document.createElement('canvas')
      canvas.width = sw
      canvas.height = sh
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)

      const imageData = ctx.getImageData(0, 0, sw, sh)
      const { data } = imageData
      const inkR = parseInt(inkColor.slice(1, 3), 16)
      const inkG = parseInt(inkColor.slice(3, 5), 16)
      const inkB = parseInt(inkColor.slice(5, 7), 16)
      for (let i = 0; i < data.length; i += 4) {
        const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        if (luminance > threshold) {
          data[i + 3] = 0 // fully transparent — this pixel was background
        } else {
          // recolor remaining ink to the chosen signature color
          data[i] = inkR
          data[i + 1] = inkG
          data[i + 2] = inkB
        }
      }
      ctx.putImageData(imageData, 0, 0)
      canvas.toBlob((blob) => {
        setResultUrl(URL.createObjectURL(blob))
        setBusy(false)
      }, 'image/png')
    } catch (err) {
      console.error(err)
      setError('Couldn\u2019t extract that selection \u2014 try a slightly smaller region.')
      setBusy(false)
    }
  }

  function download() {
    fetch(resultUrl).then((r) => r.blob()).then((blob) => saveAs(blob, 'extracted-signature.png'))
  }

  return (
    <>
      <SEO
        title="Signature Extractor — Pull a Signature Out of a Scan Free"
        description="Crop a signature out of a scanned document or photo and remove the background, leaving a clean transparent PNG. Free, runs in your browser."
        path="/tools/signature-extractor"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Signature Extractor</h1>
        <p className="text-ink/60 mb-8">
          Upload a scan, photo, or PDF that has a signature on it, drag a box around just the
          signature, and download it as a clean, transparent PNG — the background paper is
          removed automatically.
        </p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" id="sig-extract-upload" />
          <label htmlFor="sig-extract-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            Choose an image or PDF
          </label>
          {fileName && <p className="text-sm text-ink/50 mt-3">Uploaded: {fileName}</p>}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {fileName && !sourceUrl && !error && <p className="text-ink/40 text-sm mb-4">Loading preview…</p>}

        {pdfFile && pageCount > 1 && (
          <div className="flex items-center gap-3 mb-4 text-sm">
            <button onClick={() => changePage(pageNum - 1)} disabled={pageNum <= 1} className="px-3 py-1 rounded-lg bg-board/10 disabled:opacity-30">Prev</button>
            <span>Page {pageNum} of {pageCount}</span>
            <button onClick={() => changePage(pageNum + 1)} disabled={pageNum >= pageCount} className="px-3 py-1 rounded-lg bg-board/10 disabled:opacity-30">Next</button>
          </div>
        )}

        {sourceUrl && (
          <div>
            <p className="text-sm text-ink/50 mb-2">Drag a box around the signature:</p>
            <div
              ref={containerRef}
              className="relative inline-block select-none border border-board/20 rounded-lg overflow-hidden mb-6 cursor-crosshair"
              onMouseDown={startDrag}
              onMouseMove={duringDrag}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={startDrag}
              onTouchMove={duringDrag}
              onTouchEnd={endDrag}
            >
              <img
                ref={imgRef}
                src={sourceUrl}
                alt="Uploaded document"
                className="max-w-full max-h-[500px] block"
                draggable={false}
                onError={() => setError('That file uploaded, but couldn\u2019t be displayed for preview \u2014 try a different image or PDF.')}
              />
              {selection && (
                <div
                  className="absolute border-2 border-amber bg-amber/20 pointer-events-none"
                  style={{ left: selection.x, top: selection.y, width: selection.w, height: selection.h }}
                />
              )}
            </div>
          </div>
        )}

        {sourceUrl && (
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Background sensitivity ({threshold})</label>
              <input type="range" min="120" max="240" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Signature color</label>
              <input type="color" value={inkColor} onChange={(e) => setInkColor(e.target.value)} className="w-10 h-10" />
            </div>
            <button
              onClick={extract}
              disabled={!selection || selection.w < 4 || busy}
              className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40"
            >
              {busy ? 'Working…' : 'Extract signature'}
            </button>
          </div>
        )}

        {resultUrl && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Result</p>
            <div className="inline-block bg-[repeating-conic-gradient(#f0f0f0_0%_25%,white_0%_50%)] bg-[length:16px_16px] rounded-lg border border-board/10 p-4">
              <img src={resultUrl} alt="Extracted signature preview" style={{ maxHeight: 140 }} />
            </div>
            <div className="mt-3">
              <button onClick={download} className="bg-mint text-ink font-semibold px-6 py-2.5 rounded-lg">
                Download PNG
              </button>
            </div>
          </div>
        )}

        <p className="text-ink/40 text-xs mt-6">
          Works best when the signature is dark ink on a plain, light background. If the edges
          look rough, try nudging the sensitivity slider up or down and extracting again.
        </p>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
