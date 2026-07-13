import { useState } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { loadPdfJs } from '../../lib/pdfjs.js'

export default function PDFToImages() {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [pages, setPages] = useState([]) // [{ url, blob, index }]
  const [error, setError] = useState('')

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPages([])
    setError('')
  }

  async function convert() {
    if (!file) return
    setBusy(true)
    setError('')
    setPages([])
    try {
      const pdfjsLib = await loadPdfJs()
      const bytes = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
      const results = []
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`Rendering page ${i} of ${pdf.numPages}…`)
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
        results.push({ url: URL.createObjectURL(blob), blob, index: i })
      }
      setPages(results)
    } catch (err) {
      console.error(err)
      setError('That doesn\u2019t look like a valid PDF.')
    } finally {
      setBusy(false)
      setProgress('')
    }
  }

  function downloadOne(p) {
    saveAs(p.blob, `page-${p.index}.png`)
  }

  function downloadAll() {
    pages.forEach((p) => saveAs(p.blob, `page-${p.index}.png`))
  }

  return (
    <>
      <SEO
        title="PDF to Images — Convert PDF Pages to PNG Free"
        description="Turn every page of a PDF into a downloadable PNG image. Free, runs in your browser, no upload."
        path="/tools/pdf-to-images"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">PDF to Images</h1>
        <p className="text-ink/60 mb-8">Renders every page of a PDF as a PNG you can download individually or all at once.</p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" id="pdf2img-upload" />
          <label htmlFor="pdf2img-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            Choose a PDF
          </label>
          {file && <p className="text-sm text-ink/50 mt-3">{file.name}</p>}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="flex items-center gap-4 mb-8">
          <button onClick={convert} disabled={!file || busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
            {busy ? progress || 'Working…' : 'Convert pages'}
          </button>
          {pages.length > 0 && (
            <button onClick={downloadAll} className="bg-mint text-ink font-semibold px-6 py-2.5 rounded-lg">
              Download all
            </button>
          )}
        </div>

        {pages.length > 0 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pages.map((p) => (
              <div key={p.index} className="border border-board/10 rounded-lg overflow-hidden">
                <img src={p.url} alt={`Page ${p.index}`} className="w-full" />
                <button onClick={() => downloadOne(p)} className="w-full text-sm py-2 bg-board/5 hover:bg-board/10">
                  Download page {p.index}
                </button>
              </div>
            ))}
          </div>
        )}

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
