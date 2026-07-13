import { useState } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

// Any browser-decodable image (jpg, png, webp, gif...) is first normalized
// to a PNG on a canvas, then embedded page-by-page into a new PDF.
function fileToPngBytes(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d').drawImage(img, 0, 0)
      canvas.toBlob(async (blob) => {
        URL.revokeObjectURL(url)
        resolve({ bytes: new Uint8Array(await blob.arrayBuffer()), width: img.naturalWidth, height: img.naturalHeight })
      }, 'image/png')
    }
    img.onerror = reject
    img.src = url
  })
}

export default function ImagesToPDF() {
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [resultUrl, setResultUrl] = useState(null)

  function handleFiles(e) {
    const newFiles = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...newFiles])
    setResultUrl(null)
    e.target.value = ''
  }

  function moveFile(index, dir) {
    setFiles((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function build() {
    if (!files.length) return
    setBusy(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const pdfDoc = await PDFDocument.create()
      for (const file of files) {
        const { bytes, width, height } = await fileToPngBytes(file)
        const png = await pdfDoc.embedPng(bytes)
        const page = pdfDoc.addPage([width, height])
        page.drawImage(png, { x: 0, y: 0, width, height })
      }
      const pdfBytes = await pdfDoc.save()
      setResultUrl(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })))
    } finally {
      setBusy(false)
    }
  }

  function download() {
    fetch(resultUrl).then((r) => r.blob()).then((blob) => saveAs(blob, 'images.pdf'))
  }

  return (
    <>
      <SEO
        title="Images to PDF — Combine Photos Into One PDF Free"
        description="Turn one or more images into a single PDF, in the order you choose. Free, runs in your browser, no upload."
        path="/tools/images-to-pdf"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Images to PDF</h1>
        <p className="text-ink/60 mb-8">Pick one or more images and combine them into a single PDF, one image per page.</p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" id="i2p-upload" />
          <label htmlFor="i2p-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            {files.length ? 'Add more images' : 'Choose images'}
          </label>
        </div>

        {files.length > 0 && (
          <ul className="mb-6 divide-y divide-board/10 border border-board/10 rounded-lg">
            {files.map((f, i) => (
              <li key={f.name + i} className="flex items-center justify-between px-4 py-2 text-sm">
                <span>{i + 1}. {f.name}</span>
                <span className="flex gap-2">
                  <button onClick={() => moveFile(i, -1)} className="text-ink/50 hover:text-ink" aria-label="Move up">↑</button>
                  <button onClick={() => moveFile(i, 1)} className="text-ink/50 hover:text-ink" aria-label="Move down">↓</button>
                  <button onClick={() => removeFile(i)} className="text-red-600 hover:text-red-700" aria-label="Remove">✕</button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-4">
          <button onClick={build} disabled={!files.length || busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
            {busy ? 'Building PDF…' : 'Build PDF'}
          </button>
          {resultUrl && (
            <button onClick={download} className="bg-mint text-ink font-semibold px-6 py-2.5 rounded-lg">
              Download PDF
            </button>
          )}
        </div>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
