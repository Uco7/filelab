import { Link } from 'react-router-dom'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

export default function KDPFormattingPost() {
  return (
    <>
      <SEO
        title="How to Format Your Manuscript for Amazon KDP, Free"
        description="A practical walkthrough of formatting a manuscript for KDP print and Kindle eBook — trim sizes, gutter margins, and EPUB structure — without paying for formatting software."
        path="/blog/format-manuscript-for-kdp"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'How to format your manuscript for Amazon KDP, free',
          datePublished: '2026-01-01'
        }}
      />
      <article className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="font-display font-bold text-3xl mb-6">How to format your manuscript for Amazon KDP, free</h1>

        <p className="text-ink/70 mb-4">
          KDP formatting means two genuinely different jobs: a print book needs an exact
          page size with margins that account for the spine, while a Kindle eBook needs a
          structured file (EPUB) rather than a fixed page layout at all. Getting either wrong
          is one of the most common reasons a manuscript bounces back from KDP's review.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Formatting for print</h2>
        <p className="text-ink/70 mb-4">
          Print books need an exact trim size (6" × 9" is the most common for novels), and a
          wider "gutter" margin on the inside edge near the spine — how wide depends on your
          total page count, since more pages mean more curvature into the spine when the book
          is bound. KDP publishes minimum gutter widths for each page-count range, and the{' '}
          <Link to="/tools/kdp-print-formatter" className="text-mint-dark underline">KDP Print Formatter</Link>{' '}
          calculates this automatically: it lays the manuscript out once to count pages, then
          rebuilds it with the correct gutter for that count.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Formatting for Kindle</h2>
        <p className="text-ink/70 mb-4">
          A Kindle eBook doesn't use fixed pages at all — text reflows to fit whatever screen
          size and font a reader has chosen. What KDP actually wants is a well-structured EPUB
          file: real chapter breaks, a working table of contents, and clean paragraph markup.
          The <Link to="/tools/kdp-ebook-formatter" className="text-mint-dark underline">KDP eBook Formatter</Link>{' '}
          builds exactly that from a plain-text manuscript.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Marking chapters</h2>
        <p className="text-ink/70 mb-4">
          Both tools use the same simple convention: start a chapter with a line beginning in{' '}
          <code className="bg-board/10 px-1 rounded">#</code>, or a line starting with the word
          "Chapter." Leave a blank line between paragraphs. If your manuscript is currently a
          PDF, both tools can pull the text out of it directly, so you're not stuck retyping
          anything.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">A quick honesty note</h2>
        <p className="text-ink/70 mb-4">
          These tools build a fresh, correctly-structured file from your manuscript text —
          they don't take an existing, already-designed Word document and reformat it for KDP
          while keeping custom fonts, drop caps, or image placement. For a text-first
          manuscript (which covers most fiction and a lot of nonfiction), that's not a
          limitation you'll usually notice.
        </p>

        <AdSlot className="my-10" />

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Try it now</h2>
        <p className="text-ink/70 mb-4">
          Format your print edition with the{' '}
          <Link to="/tools/kdp-print-formatter" className="text-mint-dark underline">Print Formatter</Link>, or
          your Kindle edition with the{' '}
          <Link to="/tools/kdp-ebook-formatter" className="text-mint-dark underline">eBook Formatter</Link>.
        </p>
      </article>
    </>
  )
}
