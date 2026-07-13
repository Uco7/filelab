import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://filecraft.onrender.com'

export default function SEO({ title, description, path = '/', jsonLd }) {
  const fullTitle = title ? `${title} | FileCraft` : 'FileCraft — Free Online File & Image Tools'
  const url = `${SITE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}
