import { Link } from 'react-router-dom'
import SEO from '../../components/SEO.jsx'

const posts = [
  {
    to: '/blog/how-to-remove-image-background-free',
    title: 'How to remove a background from a photo for free',
    blurb: 'Three ways to get a clean cutout, and when the free browser-based option is enough.'
  },
  {
    to: '/blog/how-to-extract-text-from-image',
    title: 'How to extract text from an image (OCR), step by step',
    blurb: 'Turn a screenshot, scan, or photo of a page into text you can actually edit.'
  },
  {
    to: '/blog/how-to-create-online-signature',
    title: 'How to create a signature you can drop into any document',
    blurb: 'Drawing, trimming, and exporting a signature that looks right at any size.'
  },
  {
    to: '/blog/free-pdf-tools-guide',
    title: 'How to merge, split, and convert PDFs for free',
    blurb: 'Combine images into a PDF, merge or split files, and pull text or images back out — no software to install.'
  },
  {
    to: '/blog/format-manuscript-for-kdp',
    title: 'How to format your manuscript for Amazon KDP, free',
    blurb: 'Print trim sizes and gutter margins, EPUB structure for Kindle, and how to mark chapters correctly.'
  }
]

export default function BlogIndex() {
  return (
    <>
      <SEO title="Blog" description="Guides on converting files, removing image backgrounds, extracting text with OCR, and more." path="/blog" />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display font-bold text-3xl mb-8">Guides</h1>
        <div className="space-y-8">
          {posts.map((p) => (
            <Link to={p.to} key={p.to} className="block border-b border-board/10 pb-8 group">
              <h2 className="font-display font-semibold text-xl group-hover:text-amber-dark">{p.title}</h2>
              <p className="text-ink/60 mt-2">{p.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
