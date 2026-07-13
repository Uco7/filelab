import { useState } from 'react'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { sanitizeForPdf } from '../../lib/sanitizeForPdf.js'

export default function TextToPDF() {
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  async function build() {
    if (!text.trim()) return
    setBusy(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const margin = 48
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const maxWidth = pageWidth - margin * 2
      let y = margin

      if (title.trim()) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        doc.text(sanitizeForPdf(title.trim()), margin, y)
        y += 28
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      const lineHeight = 16

      const paragraphs = sanitizeForPdf(text).split('\n')
      for (const para of paragraphs) {
        const lines = doc.splitTextToSize(para || ' ', maxWidth)
        for (const line of lines) {
          if (y > pageHeight - margin) {
            doc.addPage()
            y = margin
          }
          doc.text(line, margin, y)
          y += lineHeight
        }
      }

      doc.save(`${(title.trim() || 'document').replace(/[^a-z0-9-_]+/gi, '-')}.pdf`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SEO
        title="Text to PDF — Create a PDF From Text Free"
        description="Turn plain text into a downloadable, paginated PDF. Free, runs in your browser, no upload."
        path="/tools/text-to-pdf"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Text to PDF</h1>
        <p className="text-ink/60 mb-8">Type or paste text below and download it as a clean, paginated PDF.</p>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title (optional)"
          className="w-full border border-board/20 rounded-lg p-3 mb-4"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Paste or type your document text here…"
          className="w-full border border-board/20 rounded-lg p-4 mb-6"
        />

        <button onClick={build} disabled={!text.trim() || busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
          {busy ? 'Building…' : 'Download PDF'}
        </button>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
