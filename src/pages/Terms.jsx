import SEO from '../components/SEO.jsx'

export default function Terms() {
  return (
    <>
      <SEO title="Terms of Use" description="Terms for using FileCraft's free file and image tools." path="/terms" />
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="font-display font-bold text-3xl mb-6">Terms of Use</h1>
        <p className="text-ink/70 mb-4">
          FileCraft's tools are provided free of charge, as-is, without warranty of any kind.
          We do our best to keep every tool accurate and reliable, but you're responsible for
          checking important output — a legal signature, an OCR transcript used in a filing,
          a summary you plan to publish — before relying on it.
        </p>
        <p className="text-ink/70 mb-4">
          Don't use FileCraft to process content you don't have the right to process, or to
          create signatures or documents intended to deceive or defraud someone.
        </p>
        <p className="text-ink/70">
          We may change or discontinue a tool at any time. These terms may be updated
          periodically; continued use of the site means you accept the current version.
        </p>
      </div>
    </>
  )
}
