import { Link } from 'react-router-dom'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

export default function SignaturePost() {
  return (
    <>
      <SEO
        title="How to Create a Signature You Can Drop Into Any Document"
        description="Draw, trim, and export a signature as a transparent PNG so it looks right in a Word doc, PDF, or email — for free."
        path="/blog/how-to-create-online-signature"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'How to create a signature you can drop into any document',
          datePublished: '2026-01-01'
        }}
      />
      <article className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="font-display font-bold text-3xl mb-6">How to create a signature you can drop into any document</h1>

        <p className="text-ink/70 mb-4">
          A digital signature image is just a small transparent PNG of your signature —
          once you have one saved, you can paste it into a Word document, stamp it onto a
          PDF, or attach it to an email in seconds.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">1. Draw it</h2>
        <p className="text-ink/70 mb-4">
          Using a trackpad or mouse gives a rougher line than a finger on a touchscreen, but
          either works. FileCraft's{' '}
          <Link to="/tools/signature-maker" className="text-mint-dark underline">signature maker</Link>{' '}
          lets you pick ink color and stroke thickness before you draw.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">2. Trim the empty space</h2>
        <p className="text-ink/70 mb-4">
          A signature surrounded by a lot of blank canvas is awkward to resize and place.
          Trimming crops the image down to just the signature (with a small margin), so it
          drops into a document at whatever size you need.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">3. Export as a transparent PNG</h2>
        <p className="text-ink/70 mb-4">
          PNG keeps the background transparent, so the signature sits directly on the page
          underneath it instead of covering it with a white box — the difference between
          looking pasted-on and looking like it belongs there.
        </p>

        <AdSlot className="my-10" />

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Try it now</h2>
        <p className="text-ink/70 mb-4">
          Draw and download yours with the <Link to="/tools/signature-maker" className="text-mint-dark underline">signature maker</Link>.
        </p>
      </article>
    </>
  )
}
