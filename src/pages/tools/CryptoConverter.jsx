import { useState } from 'react'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { CURRENCIES } from '../../lib/currencies.js'
import { CRYPTO_COINS } from '../../lib/cryptoCoins.js'

export default function CryptoConverter() {
  const [amount, setAmount] = useState('1')
  const [coinId, setCoinId] = useState('bitcoin')
  const [useCustomCoin, setUseCustomCoin] = useState(false)
  const [customCoinId, setCustomCoinId] = useState('')
  const [vsCurrency, setVsCurrency] = useState('USD')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function convert() {
    const amt = Number(amount)
    if (!amt || amt <= 0) return
    const id = (useCustomCoin ? customCoinId.trim() : coinId).toLowerCase()
    if (!id) return

    setBusy(true)
    setError('')
    setResult(null)
    try {
      const vs = vsCurrency.toLowerCase()
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=${vs}&include_last_updated_at=true`
      )
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      const entry = data[id]
      if (!entry || entry[vs] === undefined) {
        throw new Error('Unknown coin id or currency')
      }
      setResult({
        rate: entry[vs],
        value: entry[vs] * amt,
        updatedAt: entry.last_updated_at ? new Date(entry.last_updated_at * 1000) : null
      })
    } catch (err) {
      console.error(err)
      setError('Couldn\u2019t find that coin, or the live price service is briefly unavailable \u2014 double-check the coin ID and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SEO
        title="Crypto Converter — Coin Value in Any Currency Free"
        description="Check what a cryptocurrency is worth in USD, EUR, GBP and other currencies, using live prices. Free, no sign-up."
        path="/tools/crypto-converter"
      />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Crypto Converter</h1>
        <p className="text-ink/60 mb-8">
          Live prices from CoinGecko's public API. Check what an amount of any coin is worth
          in your currency of choice.
        </p>

        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-board/20 rounded-lg px-3 py-2 w-32"
            />
          </div>

          {!useCustomCoin ? (
            <div>
              <label className="block text-sm font-medium mb-1">Coin</label>
              <select value={coinId} onChange={(e) => setCoinId(e.target.value)} className="border border-board/20 rounded-lg px-3 py-2">
                {CRYPTO_COINS.map((c) => (
                  <option key={c.id} value={c.id}>{c.symbol} — {c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">CoinGecko coin ID</label>
              <input
                type="text"
                value={customCoinId}
                onChange={(e) => setCustomCoinId(e.target.value)}
                placeholder="e.g. pepe"
                className="border border-board/20 rounded-lg px-3 py-2 w-40"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">In</label>
            <select value={vsCurrency} onChange={(e) => setVsCurrency(e.target.value)} className="border border-board/20 rounded-lg px-3 py-2">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
              <option value="BTC">BTC — Bitcoin</option>
              <option value="ETH">ETH — Ethereum</option>
            </select>
          </div>

          <button onClick={convert} disabled={busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
            {busy ? 'Checking…' : 'Convert'}
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/60 mb-6">
          <input type="checkbox" checked={useCustomCoin} onChange={(e) => setUseCustomCoin(e.target.checked)} />
          My coin isn't in the list — let me type a CoinGecko coin ID
        </label>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {result && (
          <div className="bg-board-light/10 border border-board/10 rounded-xl p-6">
            <p className="text-2xl font-display font-bold">
              {amount} {(useCustomCoin ? customCoinId : CRYPTO_COINS.find((c) => c.id === coinId)?.symbol || coinId).toUpperCase()} ={' '}
              {result.value.toLocaleString(undefined, { maximumFractionDigits: 8 })} {vsCurrency}
            </p>
            {result.updatedAt && (
              <p className="text-ink/40 text-xs mt-2">Price last updated: {result.updatedAt.toLocaleString()}</p>
            )}
          </div>
        )}

        <p className="text-ink/40 text-xs mt-8">
          For informational purposes only — not financial advice. Crypto prices are highly
          volatile; this figure can be stale by the time you act on it.
        </p>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
