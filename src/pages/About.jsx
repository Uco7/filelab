import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'

export default function About() {
  return (
    <>
      <SEO title="About" description="FileCraft is a free set of browser-based file and image tools. Learn how it works and why nothing you process ever leaves your device." path="/about" />
      <div className="max-w-2xl mx-auto px-4 py-16 prose-like">
        <h1 className="font-display font-bold text-3xl mb-6">About FileCraft</h1>
        <p className="text-ink/70 mb-4">
          FileCraft is a small toolbox of everyday file and image utilities: converting formats,
          removing a background, reading text off a photo, drawing a signature, summarizing a
          document, and a few more. Every tool runs directly in your browser tab using
          JavaScript and, for the heavier tools, a small on-device AI model — nothing you
          upload is sent to a server we control.
        </p>
        <p className="text-ink/70 mb-4">
          The idea is simple: the things people reach for ten times a day — "turn this PNG
          into a JPG," "get the background out of this photo," "what does this scanned page
          say" — shouldn't need an account, a subscription, or a five-megabyte app install.
        </p>
        <h2 className="font-display font-semibold text-xl mt-8 mb-3">About the publishing (KDP) tools</h2>
        <p className="text-ink/70 mb-4">
          If you're self-publishing on Amazon KDP, formatting is one of the fussier parts of the
          process: print books need an exact trim size with a spine-side margin that scales with
          page count, and Kindle eBooks need a properly structured EPUB rather than a fixed page
          layout. The <Link to="/tools/kdp-print-formatter" className="text-mint-dark underline">Print Formatter</Link>{' '}
          and <Link to="/tools/kdp-ebook-formatter" className="text-mint-dark underline">eBook Formatter</Link>{' '}
          build both of those directly from your manuscript text, entirely in your browser.
        </p>
        <h2 className="font-display font-semibold text-xl mt-8 mb-3">About the document tools</h2>
        <p className="text-ink/70 mb-4">
          Combining images into a PDF or PowerPoint, merging or splitting PDFs, pulling text
          out of a PDF, turning plain text into a PDF, Word file, or slide deck, and turning a
          PDF's pages into slides — all of that runs entirely in your browser, no server
          involved.
        </p>
        <p className="text-ink/70 mb-4">
          The <Link to="/tools/document-converter" className="text-mint-dark underline">Document Converter</Link>{' '}
          is the exception, and it's built differently on purpose: converting an *existing*
          Word document or PowerPoint file into a PDF (or the reverse) while keeping its
          original fonts and layout genuinely requires a real office-document engine, which a
          browser can't provide on its own. That tool sends your file to a small backend
          running headless LibreOffice, gets back the converted file, and doesn't keep a copy.
          If that backend isn't running for this deployment, the tool says so rather than
          pretending to work.
        </p>
        <p className="text-ink/70">
          FileCraft is free to use and supported by ads. If a tool breaks or you'd like to
          see something new added to the pegboard, use the <a href="/contact" className="text-mint-dark underline">contact page</a>.
        </p>
      </div>
    </>
  )
}
