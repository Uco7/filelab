import { Link } from 'react-router-dom'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

export default function ExtractTextPost() {
  return (
    <>
      <SEO
        title="How to Extract Text From an Image (OCR), Step by Step"
        description="Turn a screenshot, scan, or photo into editable text using free OCR, plus tips for getting an accurate result."
        path="/blog/how-to-extract-text-from-image"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'How to extract text from an image (OCR), step by step',
          datePublished: '2026-01-01'
        }}
      />
      <article className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="font-display font-bold text-3xl mb-6">How to extract text from an image (OCR), step by step</h1>

        <p className="text-ink/70 mb-4">
          Optical character recognition (OCR) reads the shapes of letters in a picture and
          turns them into text you can select, copy, and edit. It's the fastest way to pull
          a quote out of a screenshot or retype a scanned page without, well, retyping it.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">1. Start with a clear image</h2>
        <p className="text-ink/70 mb-4">
          OCR accuracy depends almost entirely on image quality. Straight-on photos, good
          lighting, and text that isn't blurry or at an angle will get you a much cleaner
          result than a dim, tilted phone photo of a page.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">2. Run it through an OCR tool</h2>
        <p className="text-ink/70 mb-4">
          FileCraft's <Link to="/tools/image-to-text" className="text-mint-dark underline">image to text tool</Link>{' '}
          reads the image in your browser and hands back plain text in a few seconds — no
          upload, no account.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">3. Check the result</h2>
        <p className="text-ink/70 mb-4">
          OCR isn't perfect, especially with unusual fonts, handwriting, or low-resolution
          scans. Give the output a quick read before you paste it somewhere that matters —
          small mix-ups (like "l" for "1") are the most common slip.
        </p>

        <AdSlot className="my-10" />

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Try it now</h2>
        <p className="text-ink/70 mb-4">
          Upload an image to the <Link to="/tools/image-to-text" className="text-mint-dark underline">OCR tool</Link>{' '}
          and copy the text out in a few seconds.
        </p>
      </article>
    </>
  )
}
