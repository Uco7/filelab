import { useState } from 'react'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { loadPdfJs } from '../../lib/pdfjs.js'

export default function PDFToPPT() {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError('')
  }

  async function build() {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const pdfjsLib = await loadPdfJs()
      const pptxgen = (await import('pptxgenjs')).default
      const bytes = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise

      const pres = new pptxgen()
      pres.layout = 'LAYOUT_16x9'
      const SLIDE_W = 10
      const SLIDE_H = 5.63

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`Converting page ${i} of ${pdf.numPages}…`)
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
        const dataUrl = canvas.toDataURL('image/png')

        const imgRatio = viewport.width / viewport.height
        const slideRatio = SLIDE_W / SLIDE_H
        let w, h
        if (imgRatio > slideRatio) {
          w = SLIDE_W
          h = SLIDE_W / imgRatio
        } else {
          h = SLIDE_H
          w = SLIDE_H * imgRatio
        }
        const x = (SLIDE_W - w) / 2
        const y = (SLIDE_H - h) / 2

        const slide = pres.addSlide()
        slide.addImage({ data: dataUrl, x, y, w, h })
      }

      const blob = await pres.write({ outputType: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${file.name.replace(/\.[^.]+$/, '') || 'presentation'}.pptx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setError('That doesn\u2019t look like a valid PDF.')
    } finally {
      setBusy(false)
      setProgress('')
    }
  }

  return (
    <>
      <SEO
        title="PDF to PowerPoint — Convert PDF to PPTX Free"
        description="Turn every page of a PDF into a PowerPoint slide. Free, runs in your browser, no upload."
        path="/tools/pdf-to-ppt"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">PDF to PowerPoint</h1>
        <p className="text-ink/60 mb-2">Turns each page of a PDF into its own slide, as a full-page image.</p>
        <p className="text-ink/40 text-sm mb-8">
          Note: pages become slide images, not editable text boxes — this is the same approach
          most "PDF to PPT" converters use under the hood, since a PDF doesn't store its content
          the way a slide deck does.
        </p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" id="pdf2ppt-upload" />
          <label htmlFor="pdf2ppt-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            Choose a PDF
          </label>
          {file && <p className="text-sm text-ink/50 mt-3">{file.name}</p>}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button onClick={build} disabled={!file || busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
          {busy ? progress || 'Working…' : 'Convert to PPTX'}
        </button>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
