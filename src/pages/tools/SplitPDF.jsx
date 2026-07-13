import { useState } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

export default function SplitPDF() {
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [from, setFrom] = useState(1)
  const [to, setTo] = useState(1)
  const [busy, setBusy] = useState(false)
  const [resultUrl, setResultUrl] = useState(null)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    setError('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const bytes = await f.arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const count = doc.getPageCount()
      setPageCount(count)
      setFrom(1)
      setTo(count)
    } catch {
      setError('That doesn\u2019t look like a valid PDF.')
    }
  }

  async function extract() {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const bytes = await file.arrayBuffer()
      const donor = await PDFDocument.load(bytes)
      const startIdx = Math.max(0, Math.min(from, to) - 1)
      const endIdx = Math.min(pageCount, Math.max(from, to)) - 1
      const indices = []
      for (let i = startIdx; i <= endIdx; i++) indices.push(i)

      const out = await PDFDocument.create()
      const pages = await out.copyPages(donor, indices)
      pages.forEach((p) => out.addPage(p))
      const outBytes = await out.save()
      setResultUrl(URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })))
    } catch (err) {
      console.error(err)
      setError('Something went wrong splitting that PDF.')
    } finally {
      setBusy(false)
    }
  }

  function download() {
    fetch(resultUrl).then((r) => r.blob()).then((blob) => saveAs(blob, `pages-${from}-${to}.pdf`))
  }

  return (
    <>
      <SEO
        title="Split PDF — Extract Pages Free"
        description="Pull a page range out of a PDF into its own file. Free, runs in your browser, no upload."
        path="/tools/split-pdf"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Split PDF</h1>
        <p className="text-ink/60 mb-8">Pull a page range out of a PDF into its own file.</p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" id="split-upload" />
          <label htmlFor="split-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            Choose a PDF
          </label>
          {file && pageCount > 0 && <p className="text-sm text-ink/50 mt-3">{file.name} — {pageCount} pages</p>}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {pageCount > 0 && (
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">From page</label>
              <input type="number" min="1" max={pageCount} value={from} onChange={(e) => setFrom(Number(e.target.value))} className="border border-board/20 rounded-lg px-3 py-2 w-24" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To page</label>
              <input type="number" min="1" max={pageCount} value={to} onChange={(e) => setTo(Number(e.target.value))} className="border border-board/20 rounded-lg px-3 py-2 w-24" />
            </div>
            <button onClick={extract} disabled={busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
              {busy ? 'Extracting…' : 'Extract pages'}
            </button>
            {resultUrl && (
              <button onClick={download} className="bg-mint text-ink font-semibold px-6 py-2.5 rounded-lg">
                Download PDF
              </button>
            )}
          </div>
        )}

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
