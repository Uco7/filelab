import { useState } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { parseChapters } from '../../lib/manuscript.js'
import { buildEpub } from '../../lib/epubBuilder.js'
import { extractTextFromFile, IMPORT_ACCEPT } from '../../lib/importText.js'

export default function KDPEbookFormatter() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')

  const chapters = text.trim() ? parseChapters(text) : []

  async function importDoc(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setImporting(true)
    setError('')
    try {
      setText(await extractTextFromFile(f))
    } catch (err) {
      console.error(err)
      setError(err.message || 'Couldn\u2019t read that file.')
    } finally {
      setImporting(false)
    }
  }

  async function build() {
    if (!chapters.length) return
    setBusy(true)
    try {
      const blob = await buildEpub({
        title: title.trim() || 'Untitled',
        author: author.trim() || 'Unknown',
        chapters
      })
      saveAs(blob, `${(title.trim() || 'manuscript').replace(/[^a-z0-9-_]+/gi, '-')}.epub`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SEO
        title="KDP eBook Formatter — Manuscript to EPUB Free"
        description="Turn a manuscript into a clean, validly-structured EPUB with a working table of contents, ready for Amazon KDP. Free, runs in your browser."
        path="/tools/kdp-ebook-formatter"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to format a manuscript for Kindle (KDP eBook)',
          step: [
            { '@type': 'HowToStep', text: 'Paste your manuscript, marking each chapter with a line starting with #.' },
            { '@type': 'HowToStep', text: 'Add a title and author name.' },
            { '@type': 'HowToStep', text: 'Download the generated .epub and upload it to KDP.' }
          ]
        }}
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">KDP eBook Formatter</h1>
        <p className="text-ink/60 mb-2">
          Turns a plain-text manuscript into a clean, correctly-structured EPUB \u2014 the file
          format KDP expects for a Kindle eBook \u2014 complete with a working table of contents.
        </p>
        <p className="text-ink/40 text-sm mb-8">
          Chapters are detected automatically: a line starting with{' '}
          <code className="bg-board/10 px-1 rounded">#</code>, the word "Chapter," or a short
          ALL-CAPS line (like a heading extracted from a PDF — "DECLARATION," "ABSTRACT,"
          "CHAPTER ONE," even with a leading page-numbering marker like "ii" or "1.") all count
          as a new chapter. Everything else becomes body text, with a blank line between
          paragraphs.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" className="border border-board/20 rounded-lg p-3" />
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" className="border border-board/20 rounded-lg p-3" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <input type="file" accept={IMPORT_ACCEPT} onChange={importDoc} className="hidden" id="kdp-epub-import" />
          <label htmlFor="kdp-epub-import" className="cursor-pointer text-sm bg-board/10 hover:bg-board/20 px-4 py-2 rounded-lg">
            {importing ? 'Reading file…' : 'Import text from a PDF or Word document instead'}
          </label>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder={'# Chapter One\nIt was a dark and stormy night.\n\nShe opened the door.\n\n# Chapter Two\n…'}
          className="w-full border border-board/20 rounded-lg p-4 mb-2 font-mono text-sm"
        />
        {chapters.length > 0 && (
          <p className="text-ink/40 text-xs mb-6">{chapters.length} chapter{chapters.length === 1 ? '' : 's'} detected</p>
        )}

        <button onClick={build} disabled={!chapters.length || busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
          {busy ? 'Building…' : 'Download .epub'}
        </button>

        <p className="text-ink/40 text-xs mt-6">
          After downloading, it's worth opening the file in a free reader like Calibre or Apple
          Books to spot-check chapter breaks before uploading to KDP \u2014 KDP also runs its own
          conversion and formatting check once you upload.
        </p>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
