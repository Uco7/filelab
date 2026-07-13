import SEO from '../components/SEO.jsx'

export default function Privacy() {
  return (
    <>
      <SEO title="Privacy Policy" description="How FileCraft handles your files and data." path="/privacy" />
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="font-display font-bold text-3xl mb-6">Privacy Policy</h1>
        <p className="text-ink/60 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Your files</h2>
        <p className="text-ink/70 mb-4">
          Every file-based tool on FileCraft processes your images and text locally, inside your
          browser tab, using JavaScript and (for background removal and OCR) an on-device AI
          model downloaded once and cached by your browser. Your files are not uploaded to, or
          stored on, any server we operate.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">The Document Converter tool</h2>
        <p className="text-ink/70 mb-4">
          This is the one file-based tool that isn't fully local: converting an existing Word,
          PowerPoint, Excel, or PDF file into another one of those formats while keeping its
          layout needs a real document engine, so this tool sends your file to our own backend
          server to do that conversion. The file is processed in memory, the converted result
          is sent back to your browser, and nothing is written to disk or kept afterward. If
          that backend isn't running for a given deployment, the tool says so rather than
          silently failing.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">The currency, crypto, and stock tools</h2>
        <p className="text-ink/70 mb-4">
          These three tools are the exception to "nothing leaves your browser": to show a live
          price, your browser sends a request directly to a third-party data provider —{' '}
          <a href="https://frankfurter.app" target="_blank" rel="noreferrer" className="text-mint-dark underline">Frankfurter</a> for
          currency rates, <a href="https://www.coingecko.com" target="_blank" rel="noreferrer" className="text-mint-dark underline">CoinGecko</a> for
          crypto prices, and (only if you choose to use the stock tool){' '}
          <a href="https://twelvedata.com" target="_blank" rel="noreferrer" className="text-mint-dark underline">Twelve Data</a> for
          stock quotes. That request contains only what you typed (an amount, a currency code,
          a coin, or a ticker symbol) — never a file. If you use the stock tool, your Twelve
          Data API key is stored in your browser's local storage and sent only to Twelve Data,
          not to us.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Cookies and advertising</h2>
        <p className="text-ink/70 mb-4">
          This site may show ads served by Google AdSense and its partners. Google and its
          partners may use cookies to serve ads based on your prior visits to this or other
          websites. You can opt out of personalized advertising by visiting{' '}
          <a className="text-mint-dark underline" href="https://adssettings.google.com" target="_blank" rel="noreferrer">
            Google's Ads Settings
          </a>.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Analytics</h2>
        <p className="text-ink/70 mb-4">
          We may use privacy-respecting analytics to understand which tools are useful and which
          pages need work. Analytics data is aggregated and not tied to the content of any file
          you process.
        </p>

        <h2 className="font-display font-semibold text-xl mt-8 mb-3">Contact</h2>
        <p className="text-ink/70">
          Questions about this policy can be sent through the <a href="/contact" className="text-mint-dark underline">contact page</a>.
        </p>
      </div>
    </>
  )
}
