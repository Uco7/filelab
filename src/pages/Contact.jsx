import SEO from '../components/SEO.jsx'

export default function Contact() {
  return (
    <>
      <SEO title="Contact" description="Get in touch with the FileCraft team." path="/contact" />
      <div className="max-w-xl mx-auto px-4 py-16">
        <h1 className="font-display font-bold text-3xl mb-6">Contact</h1>
        <p className="text-ink/70 mb-6">
          Found a bug, or want a tool that isn't on the pegboard yet? Send a note.
        </p>
        <a
          href="mailto:hello@filecraft.example.com?subject=FileCraft%20feedback"
          className="inline-block bg-amber text-ink font-semibold px-6 py-3 rounded-lg"
        >
          Email hello@filecraft.example.com
        </a>
        <p className="text-ink/40 text-xs mt-6">
          Replace this address with your own, or swap this button for an embedded form
          from a free service like Formspree or Web3Forms — no backend server required.
        </p>
      </div>
    </>
  )
}
