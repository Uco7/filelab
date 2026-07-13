import { useRef, useState, useEffect } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

const COLORS = ['#1B1F23', '#1E4FD9', '#0F7A4C', '#8B1E1E']

export default function SignatureMaker() {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const [color, setColor] = useState(COLORS[0])
  const [thickness, setThickness] = useState(3)
  const [hasStrokes, setHasStrokes] = useState(false)
  const [croppedUrl, setCroppedUrl] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const point = e.touches ? e.touches[0] : e
    return { x: point.clientX - rect.left, y: point.clientY - rect.top }
  }

  function start(e) {
    e.preventDefault()
    drawing.current = true
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setCroppedUrl(null)
  }

  function move(e) {
    if (!drawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getPos(e, canvas)
    ctx.strokeStyle = color
    ctx.lineWidth = thickness
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasStrokes(true)
  }

  function end() {
    drawing.current = false
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
    setCroppedUrl(null)
  }

  function trimAndDownload() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    const imageData = ctx.getImageData(0, 0, width, height)
    const { data } = imageData

    let minX = width, minY = height, maxX = 0, maxY = 0
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3]
        if (alpha > 10) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    if (maxX < minX || maxY < minY) return // nothing drawn

    const pad = 12
    minX = Math.max(0, minX - pad)
    minY = Math.max(0, minY - pad)
    maxX = Math.min(width, maxX + pad)
    maxY = Math.min(height, maxY + pad)

    const trimmedCanvas = document.createElement('canvas')
    trimmedCanvas.width = maxX - minX
    trimmedCanvas.height = maxY - minY
    trimmedCanvas
      .getContext('2d')
      .putImageData(ctx.getImageData(minX, minY, maxX - minX, maxY - minY), 0, 0)

    trimmedCanvas.toBlob((blob) => {
      setCroppedUrl(URL.createObjectURL(blob))
    }, 'image/png')
  }

  function download() {
    fetch(croppedUrl)
      .then((r) => r.blob())
      .then((blob) => saveAs(blob, 'signature.png'))
  }

  return (
    <>
      <SEO
        title="Signature Maker — Draw & Download a Signature"
        description="Draw your signature with your mouse or finger, trim the empty space automatically, and download it as a transparent PNG — free, no sign-up."
        path="/tools/signature-maker"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to create a digital signature online',
          step: [
            { '@type': 'HowToStep', text: 'Draw your signature in the box using a mouse, trackpad or finger.' },
            { '@type': 'HowToStep', text: 'Click Trim & prepare to crop the empty space away.' },
            { '@type': 'HowToStep', text: 'Download it as a transparent PNG to paste into any document.' }
          ]
        }}
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Signature Maker</h1>
        <p className="text-ink/60 mb-8">
          Draw your signature below, then trim the blank space and download it as a
          transparent PNG you can drop into a Word doc, PDF or email.
        </p>

        <div
          className="rounded-xl border-2 border-board/20 bg-[repeating-conic-gradient(#f0f0f0_0%_25%,white_0%_50%)] bg-[length:16px_16px] mb-4"
          style={{ height: 260 }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full touch-none cursor-crosshair"
            onMouseDown={start}
            onMouseMove={move}
            onMouseUp={end}
            onMouseLeave={end}
            onTouchStart={start}
            onTouchMove={move}
            onTouchEnd={end}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Ink</span>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-amber' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Thickness</span>
            <input type="range" min="1" max="8" value={thickness} onChange={(e) => setThickness(Number(e.target.value))} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button onClick={clearCanvas} className="bg-board/10 text-ink font-semibold px-5 py-2.5 rounded-lg">
            Clear
          </button>
          <button
            onClick={trimAndDownload}
            disabled={!hasStrokes}
            className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40"
          >
            Trim & prepare
          </button>
          {croppedUrl && (
            <button onClick={download} className="bg-mint text-ink font-semibold px-6 py-2.5 rounded-lg">
              Download PNG
            </button>
          )}
        </div>

        {croppedUrl && (
          <div className="mb-8">
            <p className="text-sm font-medium mb-2">Preview</p>
            <div className="inline-block bg-[repeating-conic-gradient(#f0f0f0_0%_25%,white_0%_50%)] bg-[length:16px_16px] rounded-lg border border-board/10 p-4">
              <img src={croppedUrl} alt="Trimmed signature preview" style={{ maxHeight: 100 }} />
            </div>
          </div>
        )}

        <AdSlot className="mt-4" />
      </div>
    </>
  )
}
