import { useState, useEffect } from 'react'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { CURRENCIES } from '../../lib/currencies.js'
import { convertCurrency } from '../../lib/exchangeRate.js'

const KEY_STORAGE = 'filecraft:twelvedata-key'

export default function StockChecker() {
  const [apiKey, setApiKey] = useState('')
  const [symbol, setSymbol] = useState('AAPL')
  const [convertTo, setConvertTo] = useState('')
  const [quote, setQuote] = useState(null)
  const [converted, setConverted] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY_STORAGE)
    if (saved) setApiKey(saved)
  }, [])

  function saveKey(value) {
    setApiKey(value)
    if (value.trim()) {
      window.localStorage.setItem(KEY_STORAGE, value.trim())
    } else {
      window.localStorage.removeItem(KEY_STORAGE)
    }
  }

  async function lookup() {
    if (!apiKey.trim() || !symbol.trim()) return
    setBusy(true)
    setError('')
    setQuote(null)
    setConverted(null)
    try {
      const res = await fetch(
        `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol.trim())}&apikey=${encodeURIComponent(apiKey.trim())}`
      )
      const data = await res.json()
      if (data.status === 'error' || data.code) {
        throw new Error(data.message || 'Lookup failed')
      }
      setQuote(data)

      if (convertTo && data.currency && convertTo !== data.currency) {
        try {
          const { value } = await convertCurrency(data.close, data.currency, convertTo)
          setConverted({ value, currency: convertTo })
        } catch {
          // conversion is a bonus, ignore failures quietly
        }
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Couldn\u2019t look up that symbol \u2014 check the ticker and your API key.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SEO
        title="Stock Price Checker — Live Quotes in Any Currency"
        description="Look up a live stock price and see it converted into another currency. Free — uses your own free Twelve Data API key, stored only in your browser."
        path="/tools/stock-checker"
      />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Stock Price Checker</h1>
        <p className="text-ink/60 mb-6">
          Look up a live stock quote and see what it's worth in another currency. Unlike our
          other tools, this one needs a free API key — there's no reliable stock data source
          that works without one.
        </p>

        <div className="bg-board-light/10 border border-board/10 rounded-xl p-5 mb-6">
          <label className="block text-sm font-medium mb-1">Your free Twelve Data API key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => saveKey(e.target.value)}
            placeholder="Paste your API key here"
            className="w-full border border-board/20 rounded-lg px-3 py-2 mb-2"
          />
          <p className="text-ink/50 text-xs">
            Free, no credit card — grab one at{' '}
            <a href="https://twelvedata.com/apikey" target="_blank" rel="noreferrer" className="underline text-mint-dark">
              twelvedata.com/apikey
            </a>{' '}
            (800 requests/day on the free plan). Your key is saved only in your own browser's
            local storage — it's never sent anywhere but Twelve Data's API.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Ticker symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              className="border border-board/20 rounded-lg px-3 py-2 w-32 uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Convert to (optional)</label>
            <select value={convertTo} onChange={(e) => setConvertTo(e.target.value)} className="border border-board/20 rounded-lg px-3 py-2">
              <option value="">Don't convert</option>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={lookup} disabled={!apiKey.trim() || !symbol.trim() || busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
            {busy ? 'Looking up…' : 'Get quote'}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {quote && (
          <div className="bg-board-light/10 border border-board/10 rounded-xl p-6">
            <p className="text-lg font-display font-bold">{quote.name} ({quote.symbol})</p>
            <p className="text-2xl font-display font-bold mt-1">
              {Number(quote.close).toLocaleString(undefined, { maximumFractionDigits: 2 })} {quote.currency}
            </p>
            {quote.percent_change && (
              <p className={`text-sm mt-1 ${Number(quote.percent_change) >= 0 ? 'text-mint-dark' : 'text-red-600'}`}>
                {Number(quote.percent_change) >= 0 ? '+' : ''}{quote.percent_change}% today
              </p>
            )}
            {converted && (
              <p className="text-ink/70 text-sm mt-3">
                ≈ {converted.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} {converted.currency}
              </p>
            )}
            <p className="text-ink/40 text-xs mt-3">{quote.exchange} · {quote.is_market_open ? 'Market open' : 'Market closed'}</p>
          </div>
        )}

        <p className="text-ink/40 text-xs mt-8">
          For informational purposes only — not financial advice. Quotes may be delayed
          depending on the exchange and your API plan; verify with your broker before trading.
        </p>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
