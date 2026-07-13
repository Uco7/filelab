import { useState, useRef } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

const FORMATS = [
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { value: 'image/webp', label: 'WEBP', ext: 'webp' }
]

export default function ImageConverter() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [format, setFormat] = useState('image/png')
  const [quality, setQuality] = useState(0.92)
  const [outputUrl, setOutputUrl] = useState(null)
  const [busy, setBusy] = useState(false)
  const canvasRef = useRef(null)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setOutputUrl(null)
    setPreviewUrl(URL.createObjectURL(f))
  }

  function convert() {
    if (!file || !previewUrl) return
    setBusy(true)
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (format === 'image/jpeg') {
        // JPG has no transparency — fill white behind it first
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          setOutputUrl(URL.createObjectURL(blob))
          setBusy(false)
        },
        format,
        quality
      )
    }
    img.src = previewUrl
  }

  function download() {
    const ext = FORMATS.find((f) => f.value === format)?.ext || 'png'
    const name = file?.name?.replace(/\.[^.]+$/, '') || 'converted'
    fetch(outputUrl)
      .then((r) => r.blob())
      .then((blob) => saveAs(blob, `${name}.${ext}`))
  }

  return (
    <>
      <SEO
        title="Image Converter — Convert JPG, PNG, WEBP Free"
        description="Convert images between JPG, PNG and WEBP for free, right in your browser. No upload, no watermark, no sign-up."
        path="/tools/image-converter"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to convert an image format online',
          step: [
            { '@type': 'HowToStep', text: 'Upload your image.' },
            { '@type': 'HowToStep', text: 'Choose the output format (PNG, JPG or WEBP).' },
            { '@type': 'HowToStep', text: 'Click Convert, then download the result.' }
          ]
        }}
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Image Converter</h1>
        <p className="text-ink/60 mb-8">Convert between JPG, PNG and WEBP. Everything happens on your device — the image is never uploaded anywhere.</p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="img-upload" />
          <label htmlFor="img-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            Choose an image
          </label>
          {file && <p className="text-sm text-ink/50 mt-3">{file.name}</p>}
        </div>

        {previewUrl && (
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-medium mb-2">Original</p>
              <img src={previewUrl} alt="Original upload preview" className="rounded-lg border border-board/10 w-full" />
            </div>
            {outputUrl && (
              <div>
                <p className="text-sm font-medium mb-2">Converted</p>
                <img src={outputUrl} alt="Converted result preview" className="rounded-lg border border-board/10 w-full" />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Output format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="border border-board/20 rounded-lg px-3 py-2"
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {format !== 'image/png' && (
            <div>
              <label className="block text-sm font-medium mb-1">Quality ({Math.round(quality * 100)}%)</label>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.01"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
            </div>
          )}

          <button
            onClick={convert}
            disabled={!file || busy}
            className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40"
          >
            {busy ? 'Converting…' : 'Convert'}
          </button>

          {outputUrl && (
            <button onClick={download} className="bg-mint text-ink font-semibold px-6 py-2.5 rounded-lg">
              Download
            </button>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
