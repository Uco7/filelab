import SEO from '../components/SEO.jsx'
import ToolCard from '../components/ToolCard.jsx'
import AdSlot from '../components/AdSlot.jsx'
import { Link } from 'react-router-dom'

const icons = {
  convert: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h9l7 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13 4v7h7"/></svg>
  ),
  scissors: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path strokeLinecap="round" d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/></svg>
  ),
  scan: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/><path strokeLinecap="round" d="M3 12h18"/></svg>
  ),
  pen: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 20s3-1 5-3l10-10a2.1 2.1 0 00-3-3L5 14c-2 2-3 5-3 5z"/><path strokeLinecap="round" d="M13 6l3 3"/></svg>
  ),
  summarize: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 6h16M4 12h10M4 18h7"/></svg>
  ),
  rephrase: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 2l4 4-4 4M3 12v-2a4 4 0 014-4h14M7 22l-4-4 4-4M21 12v2a4 4 0 01-4 4H3"/></svg>
  ),
  smile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
  ),
  compress: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 3v4a1 1 0 01-1 1H3M16 3v4a1 1 0 001 1h4M8 21v-4a1 1 0 00-1-1H3M16 21v-4a1 1 0 011-1h4"/></svg>
  ),
  stack: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l9 5-9 5-9-5 9-5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9 5 9-5M3 17l9 5 9-5"/></svg>
  ),
  merge: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 3v6a2 2 0 002 2h4a2 2 0 002-2V3M12 21v-8"/></svg>
  ),
  split: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v8M12 11L6 21M12 11l6 10"/></svg>
  ),
  images: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="14" rx="2"/><circle cx="8" cy="9" r="1.5"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5-9 9"/></svg>
  ),
  fileText: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M9 13h6M9 17h6"/></svg>
  ),
  word: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M8 13l1.5 5L11 14l1.5 4L14 13"/></svg>
  ),
  pdf: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6"/><path strokeLinecap="round" d="M8 17v-4h1.5a1.5 1.5 0 010 3H8M13 17v-4h1a1 1 0 011 1v2a1 1 0 01-1 1h-1M17.5 13H19M17.5 15H19"/></svg>
  ),
  ppt: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path strokeLinecap="round" d="M8 20h8M12 16v4"/></svg>
  ),
  book: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
  ),
  kindle: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path strokeLinecap="round" d="M9 6h6M9 10h6M9 14h4"/></svg>
  ),
  currency: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
  ),
  crypto: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8.5h3a1.75 1.75 0 010 3.5h-3m0 0h3.5a1.75 1.75 0 010 3.5h-3.5m0-7V7m0 10v-1.5m2.5-8.5V7m0 10v-1.5"/></svg>
  ),
  stock: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8M21 7v5M21 7h-5"/></svg>
  ),
  crop: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 2v14a2 2 0 002 2h14M18 22V8a2 2 0 00-2-2H2"/></svg>
  ),
  stamp: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6l1 6H8l1-6z"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 21h12M7 21v-4a5 5 0 0110 0v4"/></svg>
  ),
  swap: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h9l7 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13 4v7h7M9 13l6 6m0-6l-6 6"/></svg>
  )
}

const tools = [
  { to: '/tools/image-converter', title: 'Image Converter', description: 'Turn JPG, PNG, WEBP and more into the format you actually need.', icon: icons.convert },
  { to: '/tools/background-remover', title: 'Background Remover', description: 'Cut a subject out of any photo and download it with a transparent background.', icon: icons.scissors },
  { to: '/tools/image-to-text', title: 'Image to Text (OCR)', description: 'Pull editable, copyable text out of a screenshot, scan or photo.', icon: icons.scan },
  { to: '/tools/signature-maker', title: 'Signature Maker', description: 'Draw your signature, trim the empty space, and download it as a transparent PNG.', icon: icons.pen },
  { to: '/tools/signature-extractor', title: 'Signature Extractor', description: 'Crop a signature out of a scan or photo and remove the background automatically.', icon: icons.crop },
  { to: '/tools/sign-document', title: 'Sign a Document', description: 'Draw or upload a signature and place it onto a PDF or image before downloading.', icon: icons.stamp },
  { to: '/tools/text-summarizer', title: 'Text Summarizer', description: 'Paste a long article or document and get the key sentences in seconds.', icon: icons.summarize },
  { to: '/tools/text-rephraser', title: 'Text Rephraser', description: 'Reword a sentence or paragraph while keeping its meaning intact.', icon: icons.rephrase },
  { to: '/tools/emoji-remover', title: 'Emoji Remover', description: 'Strip emoji out of any block of text in one click, ready to paste back in.', icon: icons.smile },
  { to: '/tools/image-compressor', title: 'Image Compressor', description: 'Shrink a photo\u2019s file size for email or upload limits without a visible quality drop.', icon: icons.compress }
]

const documentTools = [
  { to: '/tools/document-converter', title: 'Document Converter', description: 'True Word, PowerPoint, Excel, and PDF conversion, preserving the original layout.', icon: icons.swap },
  { to: '/tools/images-to-pdf', title: 'Images to PDF', description: 'Combine one or more photos into a single PDF, in the order you choose.', icon: icons.images },
  { to: '/tools/merge-pdf', title: 'Merge PDF', description: 'Combine two or more PDF files into one document.', icon: icons.merge },
  { to: '/tools/split-pdf', title: 'Split PDF', description: 'Pull a page range out of a PDF into its own file.', icon: icons.split },
  { to: '/tools/pdf-to-images', title: 'PDF to Images', description: 'Render every page of a PDF as a downloadable PNG.', icon: icons.stack },
  { to: '/tools/pdf-text-extractor', title: 'PDF Text Extractor', description: 'Pull the text layer out of a text-based PDF.', icon: icons.pdf },
  { to: '/tools/text-to-word', title: 'Text to Word', description: 'Turn plain text into a downloadable .docx file.', icon: icons.word },
  { to: '/tools/text-to-pdf', title: 'Text to PDF', description: 'Turn plain text into a clean, paginated PDF.', icon: icons.fileText },
  { to: '/tools/text-to-ppt', title: 'Text to PowerPoint', description: 'Turn an outline into a downloadable slide deck.', icon: icons.ppt },
  { to: '/tools/images-to-ppt', title: 'Images to PowerPoint', description: 'Turn a set of photos into a slide deck, one image per slide.', icon: icons.ppt },
  { to: '/tools/pdf-to-ppt', title: 'PDF to PowerPoint', description: 'Turn each page of a PDF into its own slide.', icon: icons.ppt }
]

const publishingTools = [
  { to: '/tools/kdp-print-formatter', title: 'KDP Print Formatter', description: 'Format a manuscript into a print-ready PDF at an exact KDP trim size, with auto-calculated gutter margins.', icon: icons.book },
  { to: '/tools/kdp-ebook-formatter', title: 'KDP eBook Formatter', description: 'Turn a manuscript into a clean, valid EPUB with a working table of contents, ready for Kindle.', icon: icons.kindle }
]

const marketTools = [
  { to: '/tools/currency-converter', title: 'Currency Converter', description: 'Convert between major world currencies using live exchange rates.', icon: icons.currency },
  { to: '/tools/crypto-converter', title: 'Crypto Converter', description: 'Check what any cryptocurrency is worth in USD, EUR, and other currencies right now.', icon: icons.crypto },
  { to: '/tools/stock-checker', title: 'Stock Price Checker', description: 'Look up a live stock quote and see it converted into another currency.', icon: icons.stock }
]

export default function Home() {
  return (
    <>
      <SEO
        title="Free Online File & Image Tools"
        description="Convert images, remove backgrounds, extract text from images, summarize and rephrase text, and create a downloadable signature — free, fast, and processed right in your browser."
        path="/"
      />

      <section className="bg-pegboard-texture pt-20 pb-16 px-4 border-b border-board-light">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-amber font-mono text-xs tracking-widest uppercase mb-4">
            Your files never leave your device
          </span>
          <h1 className="font-display font-bold text-paper text-4xl sm:text-5xl leading-tight mb-5">
            Every tool you reach for<br className="hidden sm:block" /> when a file needs fixing.
          </h1>
          <p className="text-paper/70 text-lg max-w-2xl mx-auto mb-8">
            Convert an image, cut out a background, read text off a photo, sign a PDF,
            or shorten a wall of text — free, no sign-up, no upload to some server you've
            never heard of. It all happens right here in your browser.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/tools/background-remover" className="bg-amber text-ink font-semibold px-6 py-3 rounded-lg hover:bg-amber-dark transition-colors">
              Remove a background
            </Link>
            <Link to="/tools/image-to-text" className="bg-paper/10 text-paper font-semibold px-6 py-3 rounded-lg hover:bg-paper/20 transition-colors border border-paper/20">
              Extract text from an image
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-board-dark pb-20">
        <div className="max-w-6xl mx-auto px-4 pt-14">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display font-bold text-paper text-2xl">The pegboard</h2>
            <span className="text-paper/40 text-sm font-mono">8 tools, 0 uploads required*</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tools.map((t) => (
              <ToolCard key={t.to} {...t} />
            ))}
          </div>
          <p className="text-paper/30 text-xs mt-6 font-mono">
            *Background removal and OCR download a small one-time AI model to your browser on first use, then run fully offline.
          </p>
        </div>
      </section>

      <section className="bg-board pb-20 border-t border-board-light">
        <div className="max-w-6xl mx-auto px-4 pt-14">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display font-bold text-paper text-2xl">Document tools</h2>
            <span className="text-paper/40 text-sm font-mono">Combine, split, and convert PDFs & slides</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {documentTools.map((t) => (
              <ToolCard key={t.to} {...t} />
            ))}
          </div>
          <p className="text-paper/30 text-xs mt-6 font-mono">
            Need to preserve a Word doc or PowerPoint's exact layout while converting it? Use the{' '}
            <a href="/tools/document-converter" className="underline">Document Converter</a> above — the other tools in
            this row build a fresh file from scratch instead, which is faster but doesn't read an existing file's design.
          </p>
        </div>
      </section>

      <section className="bg-board-dark pb-20 border-t border-board-light">
        <div className="max-w-6xl mx-auto px-4 pt-14">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display font-bold text-paper text-2xl">Publishing tools</h2>
            <span className="text-paper/40 text-sm font-mono">Format a manuscript for Amazon KDP</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">
            {publishingTools.map((t) => (
              <ToolCard key={t.to} {...t} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-board pb-20 border-t border-board-light">
        <div className="max-w-6xl mx-auto px-4 pt-14">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display font-bold text-paper text-2xl">Markets</h2>
            <span className="text-paper/40 text-sm font-mono">Live currency, crypto, and stock data</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {marketTools.map((t) => (
              <ToolCard key={t.to} {...t} />
            ))}
          </div>
          <p className="text-paper/30 text-xs mt-6 font-mono">
            These three pull live data from third-party APIs (Frankfurter, CoinGecko, Twelve Data) — the only
            tools on this site that aren't fully offline. For information only, not financial advice.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <AdSlot label="Advertisement" className="mb-16" />

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">Nothing to install</h3>
            <p className="text-ink/60 text-sm">Every tool runs in this tab. Close it, and nothing you processed stays anywhere but your downloads folder.</p>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">Nothing to pay for</h3>
            <p className="text-ink/60 text-sm">No account, no watermark, no monthly plan. Use a tool once or a hundred times.</p>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">Nothing held hostage</h3>
            <p className="text-ink/60 text-sm">Your photos and documents are yours. We don't store them, because we never receive them in the first place.</p>
          </div>
        </div>
      </section>
    </>
  )
}
