import { useState } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

export default function MergePDF() {
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [resultUrl, setResultUrl] = useState(null)
  const [error, setError] = useState('')

  function handleFiles(e) {
    const newFiles = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...newFiles])
    setResultUrl(null)
    setError('')
    e.target.value = '' // allow re-selecting the same file(s) later
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

  async function merge() {
    if (files.length < 2) return
    setBusy(true)
    setError('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const merged = await PDFDocument.create()
      for (const file of files) {
        const bytes = await file.arrayBuffer()
        const donor = await PDFDocument.load(bytes)
        const pages = await merged.copyPages(donor, donor.getPageIndices())
        pages.forEach((p) => merged.addPage(p))
      }
      const mergedBytes = await merged.save()
      setResultUrl(URL.createObjectURL(new Blob([mergedBytes], { type: 'application/pdf' })))
    } catch (err) {
      console.error(err)
      setError('One of those files doesn\u2019t look like a valid PDF.')
    } finally {
      setBusy(false)
    }
  }

  function download() {
    fetch(resultUrl).then((r) => r.blob()).then((blob) => saveAs(blob, 'merged.pdf'))
  }

  return (
    <>
      <SEO
        title="Merge PDF — Combine Multiple PDFs Free"
        description="Combine two or more PDF files into one, in the order you choose. Free, runs in your browser, no upload."
        path="/tools/merge-pdf"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Merge PDF</h1>
        <p className="text-ink/60 mb-8">Combine two or more PDFs into a single file, in whatever order you set below.</p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="application/pdf" multiple onChange={handleFiles} className="hidden" id="merge-upload" />
          <label htmlFor="merge-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            {files.length ? 'Add more PDFs' : 'Choose PDFs'}
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

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="flex items-center gap-4">
          <button onClick={merge} disabled={files.length < 2 || busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
            {busy ? 'Merging…' : 'Merge PDFs'}
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
