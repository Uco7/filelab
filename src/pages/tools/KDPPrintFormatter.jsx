import { useState } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { parseChapters } from '../../lib/manuscript.js'
import { extractTextFromFile, IMPORT_ACCEPT } from '../../lib/importText.js'
import { sanitizeForPdf } from '../../lib/sanitizeForPdf.js'
import { loadPdfJs } from '../../lib/pdfjs.js'

const TRIM_SIZES = [
  { label: '5 × 8 in', w: 5, h: 8 },
  { label: '5.25 × 8 in', w: 5.25, h: 8 },
  { label: '5.5 × 8.5 in', w: 5.5, h: 8.5 },
  { label: '6 × 9 in (most common for novels)', w: 6, h: 9 },
  { label: '7 × 10 in', w: 7, h: 10 },
  { label: '8.5 × 11 in (workbooks, large text)', w: 8.5, h: 11 }
]

// KDP's minimum inside (gutter) margin scales with total page count.
function gutterForPageCount(count) {
  if (count <= 150) return 0.375
  if (count <= 300) return 0.75
  if (count <= 500) return 0.875
  if (count <= 700) return 1.0
  return 1.125
}

const INDENT = 0.28 // inches, first-line paragraph indent

async function renderManuscript({ JsPDFClass, chapters, trim, margins, meta, startChapterOnRecto }) {
  const doc = new JsPDFClass({ unit: 'in', format: [trim.w, trim.h] })
  const pageW = trim.w
  const pageH = trim.h
  const { top, bottom, outside, gutter } = margins
  const fontSize = 11.5
  const lineHeight = 0.2
  let physicalPage = 0
  let printedPage = 0

  const isOdd = (n) => n % 2 === 1

  function addPhysicalPage() {
    if (physicalPage > 0) doc.addPage([pageW, pageH])
    physicalPage += 1
    return physicalPage
  }

  function marginsForPage(n) {
    const odd = isOdd(n)
    const left = odd ? gutter : outside
    const right = odd ? outside : gutter
    return { left, right, maxWidth: pageW - left - right }
  }

  function drawPageNumber(n) {
    doc.setFont('times', 'normal')
    doc.setFontSize(9.5)
    doc.text(String(n), pageW / 2, pageH - bottom * 0.5, { align: 'center' })
  }

  // --- Title page ---
  addPhysicalPage()
  doc.setFont('times', 'bold')
  doc.setFontSize(26)
  doc.text(sanitizeForPdf(meta.title || 'Untitled'), pageW / 2, pageH / 2 - 0.3, { align: 'center' })
  if (meta.author) {
    doc.setFont('times', 'normal')
    doc.setFontSize(14)
    doc.text(sanitizeForPdf(meta.author), pageW / 2, pageH / 2 + 0.3, { align: 'center' })
  }

  // --- Copyright page ---
  addPhysicalPage()
  doc.setFont('times', 'normal')
  doc.setFontSize(9.5)
  const { left: cLeft, maxWidth: cWidth } = marginsForPage(physicalPage)
  const copyrightText = sanitizeForPdf(
    (meta.copyright && meta.copyright.trim()) ||
      `Copyright \u00A9 ${meta.year || new Date().getFullYear()} ${meta.author || ''}\nAll rights reserved. No part of this book may be reproduced in any form without written permission from the author, except for brief quotations used in reviews.`
  )
  let cy = pageH - bottom - 1.3
  copyrightText.split('\n').forEach((paraLine) => {
    const wrapped = doc.splitTextToSize(paraLine, cWidth)
    wrapped.forEach((l) => {
      doc.text(l, cLeft, cy)
      cy += 0.16
    })
  })

  // --- Body: chapters ---
  for (const chapter of chapters) {
    let n = addPhysicalPage()
    if (startChapterOnRecto && !isOdd(n)) {
      n = addPhysicalPage()
    }
    let { left, maxWidth } = marginsForPage(n)
    let y = top + 0.9

    doc.setFont('times', 'bold')
    doc.setFontSize(17)
    const titleLines = doc.splitTextToSize(sanitizeForPdf(chapter.title), maxWidth)
    titleLines.forEach((l) => {
      doc.text(l, left + maxWidth / 2, y, { align: 'center' })
      y += 0.28
    })
    y += 0.35

    doc.setFont('times', 'normal')
    doc.setFontSize(fontSize)
    printedPage += 1
    drawPageNumber(printedPage)

    for (const rawPara of chapter.paragraphs) {
      const para = sanitizeForPdf(rawPara)
      // Wrap at a slightly narrower width so the indented first line never
      // overflows the right margin, instead of relying on leading spaces
      // (which splitTextToSize can silently strip).
      const lines = doc.splitTextToSize(para, maxWidth - INDENT)
      lines.forEach((line, i) => {
        if (y > pageH - bottom) {
          n = addPhysicalPage()
          ;({ left, maxWidth } = marginsForPage(n))
          y = top
          printedPage += 1
          drawPageNumber(printedPage)
          doc.setFont('times', 'normal')
          doc.setFontSize(fontSize)
        }
        const x = i === 0 ? left + INDENT : left
        doc.text(line, x, y, { align: 'justify', maxWidth: maxWidth - INDENT })
        y += lineHeight
      })
      y += lineHeight * 0.6
    }
  }

  return { doc, totalPrintedPages: printedPage }
}

export default function KDPPrintFormatter() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [copyright, setCopyright] = useState('')
  const [text, setText] = useState('')
  const [trimIndex, setTrimIndex] = useState(3) // 6x9 default
  const [outside, setOutside] = useState(0.5)
  const [top, setTop] = useState(0.75)
  const [bottom, setBottom] = useState(0.75)
  const [startRecto, setStartRecto] = useState(true)
  const [busy, setBusy] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [pdfBlob, setPdfBlob] = useState(null)

  const chapters = text.trim() ? parseChapters(text) : []
  const trim = TRIM_SIZES[trimIndex]

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
    setError('')
    setPreviewUrl(null)
    setPdfBlob(null)
    setSummary(null)
    try {
      const { jsPDF } = await import('jspdf')
      const meta = { title, author, copyright, year: new Date().getFullYear() }

      // Pass 1: render with a placeholder gutter just to count pages.
      const pass1 = await renderManuscript({
        JsPDFClass: jsPDF,
        chapters,
        trim,
        margins: { top, bottom, outside, gutter: 0.5 },
        meta,
        startChapterOnRecto: startRecto
      })
      const gutter = gutterForPageCount(pass1.totalPrintedPages)

      // Pass 2: final render using the correct KDP-recommended gutter.
      const pass2 = await renderManuscript({
        JsPDFClass: jsPDF,
        chapters,
        trim,
        margins: { top, bottom, outside, gutter },
        meta,
        startChapterOnRecto: startRecto
      })

      const blob = pass2.doc.output('blob')
      setPdfBlob(blob)
      setSummary({ pages: pass2.totalPrintedPages, gutter })

      // Render page 3 (the first body/chapter page, after title + copyright)
      // as a preview image so you can sanity-check the layout before downloading.
      const pdfjsLib = await loadPdfJs()
      const bytes = await blob.arrayBuffer()
      const pdfForPreview = await pdfjsLib.getDocument({ data: bytes }).promise
      const previewPageNum = Math.min(3, pdfForPreview.numPages)
      const page = await pdfForPreview.getPage(previewPageNum)
      const viewport = page.getViewport({ scale: 1.6 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
      setPreviewUrl(canvas.toDataURL('image/png'))
    } catch (err) {
      console.error(err)
      setError('Something went wrong building that PDF. Try shortening the manuscript or simplifying the chapter markers.')
    } finally {
      setBusy(false)
    }
  }

  function download() {
    if (!pdfBlob) return
    saveAs(pdfBlob, `${(title.trim() || 'manuscript').replace(/[^a-z0-9-_]+/gi, '-')}.pdf`)
  }

  return (
    <>
      <SEO
        title="KDP Print Formatter — Manuscript to Print-Ready PDF Free"
        description="Format a manuscript into a print-ready PDF at an exact Amazon KDP trim size, with correctly calculated gutter margins, chapter breaks, and page numbers. Free, runs in your browser."
        path="/tools/kdp-print-formatter"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to format a manuscript for KDP print (paperback)',
          step: [
            { '@type': 'HowToStep', text: 'Paste your manuscript, marking each chapter with a line starting with #.' },
            { '@type': 'HowToStep', text: 'Choose your KDP trim size.' },
            { '@type': 'HowToStep', text: 'Preview the layout, then download the print-ready PDF.' }
          ]
        }}
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">KDP Print Formatter</h1>
        <p className="text-ink/60 mb-2">
          Formats a manuscript into a print-ready PDF at an exact KDP trim size — with the
          inside (gutter) margin auto-calculated from your page count, chapters starting on
          their own page, and page numbers in place.
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

        <textarea
          value={copyright}
          onChange={(e) => setCopyright(e.target.value)}
          rows={2}
          placeholder="Custom copyright page text (optional — a standard line is used if left blank)"
          className="w-full border border-board/20 rounded-lg p-3 mb-4 text-sm"
        />

        <div className="flex items-center gap-3 mb-6">
          <input type="file" accept={IMPORT_ACCEPT} onChange={importDoc} className="hidden" id="kdp-print-import" />
          <label htmlFor="kdp-print-import" className="cursor-pointer text-sm bg-board/10 hover:bg-board/20 px-4 py-2 rounded-lg">
            {importing ? 'Reading file…' : 'Import text from a PDF or Word document instead'}
          </label>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder={'# Chapter One\nIt was a dark and stormy night.\n\nShe opened the door.\n\n# Chapter Two\n…'}
          className="w-full border border-board/20 rounded-lg p-4 mb-2 font-mono text-sm"
        />
        {chapters.length > 0 && (
          <p className="text-ink/40 text-xs mb-6">{chapters.length} chapter{chapters.length === 1 ? '' : 's'} detected</p>
        )}

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Trim size</label>
            <select value={trimIndex} onChange={(e) => setTrimIndex(Number(e.target.value))} className="border border-board/20 rounded-lg px-3 py-2 w-full">
              {TRIM_SIZES.map((t, i) => (
                <option key={t.label} value={i}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input type="checkbox" id="recto" checked={startRecto} onChange={(e) => setStartRecto(e.target.checked)} />
            <label htmlFor="recto" className="text-sm">Start each chapter on a right-hand page</label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium mb-1">Outside margin (in)</label>
            <input type="number" step="0.05" min="0.25" value={outside} onChange={(e) => setOutside(Number(e.target.value))} className="border border-board/20 rounded-lg px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Top margin (in)</label>
            <input type="number" step="0.05" min="0.25" value={top} onChange={(e) => setTop(Number(e.target.value))} className="border border-board/20 rounded-lg px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bottom margin (in)</label>
            <input type="number" step="0.05" min="0.25" value={bottom} onChange={(e) => setBottom(Number(e.target.value))} className="border border-board/20 rounded-lg px-3 py-2 w-full" />
          </div>
        </div>
        <p className="text-ink/40 text-xs mb-8">
          The inside (gutter) margin isn't set here — it's calculated automatically from your
          final page count, per KDP's own margin table.
        </p>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button onClick={build} disabled={!chapters.length || busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
          {busy ? 'Formatting (runs twice to size the gutter)…' : 'Build & preview'}
        </button>

        {summary && (
          <p className="text-ink/60 text-sm mt-4">
            {summary.pages} numbered pages at {trim.label}, with a {summary.gutter}"
            inside margin (auto-calculated for that page count).
          </p>
        )}

        {previewUrl && (
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Preview — first chapter page</p>
            <img src={previewUrl} alt="Preview of the formatted first chapter page" className="border border-board/20 rounded-lg max-w-full" style={{ maxHeight: 500 }} />
            <p className="text-ink/40 text-xs mt-2 mb-4">
              Check the indent, justification, and margins look right before downloading.
            </p>
            <button onClick={download} className="bg-mint text-ink font-semibold px-6 py-2.5 rounded-lg">
              Download PDF
            </button>
          </div>
        )}

        <p className="text-ink/40 text-xs mt-6">
          KDP's own online previewer is still worth a final check before you publish — this
          gets you a compliant starting point, not a guarantee against every edge case in a long
          manuscript.
        </p>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
