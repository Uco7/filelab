import { useState, useRef } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function ImageCompressor() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [quality, setQuality] = useState(0.7)
  const [maxWidth, setMaxWidth] = useState(1600)
  const [result, setResult] = useState(null) // { url, size }
  const canvasRef = useRef(null)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setPreviewUrl(URL.createObjectURL(f))
  }

  function compress() {
    if (!file || !previewUrl) return
    const img = new Image()
    img.onload = () => {
      let { naturalWidth: w, naturalHeight: h } = img
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w)
        w = maxWidth
      }
      const canvas = canvasRef.current
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => setResult({ url: URL.createObjectURL(blob), size: blob.size, blob }),
        'image/jpeg',
        quality
      )
    }
    img.src = previewUrl
  }

  function download() {
    if (!result) return
    saveAs(result.blob, `${file?.name?.replace(/\.[^.]+$/, '') || 'image'}-compressed.jpg`)
  }

  return (
    <>
      <SEO
        title="Image Compressor — Shrink Photo File Size Free"
        description="Reduce an image's file size for email or upload limits without a big drop in quality. Free, runs in your browser, no upload."
        path="/tools/image-compressor"
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Image Compressor</h1>
        <p className="text-ink/60 mb-8">Shrink a photo's file size for an email attachment or upload limit, while keeping it sharp.</p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="cmp-upload" />
          <label htmlFor="cmp-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            Choose an image
          </label>
          {file && <p className="text-sm text-ink/50 mt-3">{file.name} — {formatBytes(file.size)}</p>}
        </div>

        <div className="flex flex-wrap items-end gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Quality ({Math.round(quality * 100)}%)</label>
            <input type="range" min="0.2" max="0.95" step="0.01" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max width (px)</label>
            <input
              type="number"
              min="200"
              max="6000"
              step="100"
              value={maxWidth}
              onChange={(e) => setMaxWidth(Number(e.target.value))}
              className="border border-board/20 rounded-lg px-3 py-2 w-28"
            />
          </div>
          <button onClick={compress} disabled={!file} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
            Compress
          </button>
        </div>

        {result && (
          <div className="mb-6">
            <p className="text-sm mb-3">
              New size: <strong>{formatBytes(result.size)}</strong>
              {file && <> ({Math.round((1 - result.size / file.size) * 100)}% smaller)</>}
            </p>
            <img src={result.url} alt="Compressed result preview" className="rounded-lg border border-board/10 max-h-80" />
            <div className="mt-3">
              <button onClick={download} className="bg-mint text-ink font-semibold px-6 py-2.5 rounded-lg">
                Download JPG
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
