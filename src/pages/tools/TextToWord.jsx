import { useState } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

export default function TextToWord() {
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  async function build() {
    if (!text.trim()) return
    setBusy(true)
    try {
      const { Document, Packer, Paragraph, HeadingLevel } = await import('docx')
      const children = []
      if (title.trim()) {
        children.push(new Paragraph({ text: title.trim(), heading: HeadingLevel.TITLE }))
      }
      text.split('\n').forEach((line) => {
        children.push(new Paragraph({ text: line }))
      })
      const doc = new Document({ sections: [{ children }] })
      const blob = await Packer.toBlob(doc)
      saveAs(blob, `${(title.trim() || 'document').replace(/[^a-z0-9-_]+/gi, '-')}.docx`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SEO
        title="Text to Word — Create a .docx File Free"
        description="Turn plain text into a downloadable Word (.docx) document. Free, runs in your browser, no upload."
        path="/tools/text-to-word"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Text to Word</h1>
        <p className="text-ink/60 mb-8">Type or paste text below and download it as a real .docx file, ready to open in Word or Google Docs.</p>

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
          {busy ? 'Building…' : 'Download .docx'}
        </button>

        <p className="text-ink/40 text-xs mt-6">
          This creates a new Word document from plain text. It doesn't preserve rich formatting
          from another file — if you need an existing PDF or Word doc converted while keeping
          its original layout, that's a heavier job we don't do free client-side yet (see the
          note in our <a href="/about" className="underline">about page</a>).
        </p>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
