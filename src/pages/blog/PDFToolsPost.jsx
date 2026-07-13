import { Link } from 'react-router-dom'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

export default function PDFToolsPost() {
  return (
    <>
      <SEO
        title="How to Merge, Split, and Convert PDFs for Free"
        description="A practical guide to combining images into a PDF, merging or splitting PDF files, and pulling text out of a PDF — all for free, no account needed."
        path="/blog/free-pdf-tools-guide"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'How to merge, split, and convert PDFs for free',
          datePublished: '2026-01-01'
        }}
      />
      <article className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="font-display font-bold text-3xl mb-6">How to merge, split, and convert PDFs for free</h1>

        <p className="text-ink/70 mb-4">
          PDFs are the one file format almost everyone ends up needing to reshape somehow —
          combining a few into one, pulling out a couple of pages, or turning a stack of photos
          into a single document to send. None of it requires installing software.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Turning photos into a PDF</h2>
        <p className="text-ink/70 mb-4">
          If you've got a few photos of receipts, forms, or pages that need to go out as one
          document, <Link to="/tools/images-to-pdf" className="text-mint-dark underline">Images to PDF</Link>{' '}
          stacks them in whatever order you choose and outputs a single file.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Combining PDFs you already have</h2>
        <p className="text-ink/70 mb-4">
          For files that are already PDFs — a cover letter and a resume, or a few scanned
          contracts — <Link to="/tools/merge-pdf" className="text-mint-dark underline">Merge PDF</Link>{' '}
          stitches them together in order, keeping every page intact.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Pulling pages back out</h2>
        <p className="text-ink/70 mb-4">
          Only need pages 3 through 5 of a much longer PDF? <Link to="/tools/split-pdf" className="text-mint-dark underline">Split PDF</Link>{' '}
          extracts just the range you set into its own file.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Getting text or images back out</h2>
        <p className="text-ink/70 mb-4">
          For a text-based PDF — a report, an ebook, an exported document — the{' '}
          <Link to="/tools/pdf-text-extractor" className="text-mint-dark underline">PDF text extractor</Link>{' '}
          pulls the embedded text straight out, ready to copy. If you'd rather have each page
          as its own image, <Link to="/tools/pdf-to-images" className="text-mint-dark underline">PDF to Images</Link>{' '}
          renders every page as a downloadable PNG.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">A quick honesty note</h2>
        <p className="text-ink/70 mb-4">
          These tools build new PDFs or reshape existing ones — they don't convert an existing
          Word document or PowerPoint file into a PDF while preserving its original formatting.
          That's a genuinely different (and heavier) job that needs a real office-document
          engine running on a server, which is on our roadmap but isn't free to run.
        </p>

        <AdSlot className="my-10" />

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Try it now</h2>
        <p className="text-ink/70 mb-4">
          All of these live on the <Link to="/" className="text-mint-dark underline">tools page</Link> — pick the one you need and download the result in seconds.
        </p>
      </article>
    </>
  )
}
