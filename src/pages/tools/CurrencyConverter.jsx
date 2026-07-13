import { useState } from 'react'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { CURRENCIES } from '../../lib/currencies.js'
import { convertCurrency } from '../../lib/exchangeRate.js'

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function convert() {
    const amt = Number(amount)
    if (!amt || amt <= 0) return
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const { value, date } = await convertCurrency(amt, from, to)
      setResult({ value, date })
    } catch (err) {
      console.error(err)
      setError('Couldn\u2019t fetch a live rate right now \u2014 try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  function swap() {
    setFrom(to)
    setTo(from)
    setResult(null)
  }

  return (
    <>
      <SEO
        title="Currency Converter — Live Exchange Rates Free"
        description="Convert between major world currencies using live exchange rates. Free, no sign-up, no ads on the conversion itself."
        path="/tools/currency-converter"
      />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Currency Converter</h1>
        <p className="text-ink/60 mb-8">
          Live exchange rates from the European Central Bank, via the free Frankfurter API. Rates
          update once per weekday and aren't real-time to the second.
        </p>

        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-board/20 rounded-lg px-3 py-2 w-32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="border border-board/20 rounded-lg px-3 py-2">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={swap} aria-label="Swap currencies" className="bg-board/10 hover:bg-board/20 rounded-lg p-2.5 mb-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
          </button>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="border border-board/20 rounded-lg px-3 py-2">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={convert} disabled={busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
            {busy ? 'Converting…' : 'Convert'}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {result && (
          <div className="bg-board-light/10 border border-board/10 rounded-xl p-6">
            <p className="text-2xl font-display font-bold">
              {amount} {from} = {result.value.toLocaleString(undefined, { maximumFractionDigits: 4 })} {to}
            </p>
            <p className="text-ink/40 text-xs mt-2">Rate date: {result.date}</p>
          </div>
        )}

        <p className="text-ink/40 text-xs mt-8">
          For informational purposes only — not financial advice. Rates can lag real-time
          market pricing; check with your bank or provider before an actual transaction.
        </p>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
