import { useState } from 'react'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { loadPdfJs } from '../../lib/pdfjs.js'

export default function PDFTextExtractor() {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setText('')
    setError('')
  }

  async function extract() {
    if (!file) return
    setBusy(true)
    setError('')
    setText('')
    try {
      const pdfjsLib = await loadPdfJs()
      const bytes = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
      let full = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`Reading page ${i} of ${pdf.numPages}…`)
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        full += content.items.map((it) => it.str).join(' ') + '\n\n'
      }
      setText(full.trim())
    } catch (err) {
      console.error(err)
      setError('That doesn\u2019t look like a valid PDF, or it\u2019s a scanned image with no embedded text — try the Image to Text tool instead for scans.')
    } finally {
      setBusy(false)
      setProgress('')
    }
  }

  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function download() {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extracted-text.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <SEO
        title="PDF Text Extractor — Get Text From a PDF Free"
        description="Pull the text out of any PDF that has real, embedded text (not a scan) for free, right in your browser."
        path="/tools/pdf-text-extractor"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">PDF Text Extractor</h1>
        <p className="text-ink/60 mb-8">
          Pulls the text layer straight out of a PDF. Works on regular, text-based PDFs — for a
          scanned photo of a page, use <a href="/tools/image-to-text" className="text-mint-dark underline">Image to Text</a> instead.
        </p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" id="pdftext-upload" />
          <label htmlFor="pdftext-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            Choose a PDF
          </label>
          {file && <p className="text-sm text-ink/50 mt-3">{file.name}</p>}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button onClick={extract} disabled={!file || busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40 mb-6">
          {busy ? progress || 'Reading…' : 'Extract text'}
        </button>

        {text && (
          <div>
            <label className="block text-sm font-medium mb-2">Extracted text</label>
            <textarea readOnly value={text} rows={12} className="w-full border border-board/20 rounded-lg p-4 font-mono text-sm" />
            <div className="flex gap-3 mt-3">
              <button onClick={copy} className="bg-mint text-ink font-semibold px-5 py-2 rounded-lg text-sm">
                {copied ? 'Copied!' : 'Copy text'}
              </button>
              <button onClick={download} className="bg-board text-paper font-semibold px-5 py-2 rounded-lg text-sm">
                Download .txt
              </button>
            </div>
          </div>
        )}

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
