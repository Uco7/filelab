import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'

export default function NotFound() {
  return (
    <>
      <SEO title="Page not found" description="This page doesn't exist." path="/404" />
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display font-bold text-4xl mb-4">Nothing hung here.</h1>
        <p className="text-ink/60 mb-8">The page you're looking for isn't on the pegboard.</p>
        <Link to="/" className="bg-amber text-ink font-semibold px-6 py-3 rounded-lg">Back to the tools</Link>
      </div>
    </>
  )
}
