// Tries Frankfurter first (ECB rates, well-tested, no key needed). If that
// fails for any reason — a network hiccup, an ad blocker flagging the
// request, a transient outage — it falls back to open.er-api.com, a
// separate free, no-key provider with broader currency coverage. Having
// two independent sources means one provider being briefly unreachable
// doesn't take the whole tool down.
export async function convertCurrency(amount, from, to) {
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`)
    if (res.ok) {
      const data = await res.json()
      const rate = data.rates?.[to]
      if (rate !== undefined) {
        return { value: rate, date: data.date, source: 'Frankfurter (ECB)' }
      }
    }
  } catch {
    // fall through to the backup source below
  }

  const res2 = await fetch(`https://open.er-api.com/v6/latest/${from}`)
  if (!res2.ok) throw new Error('Both exchange rate sources are unavailable right now.')
  const data2 = await res2.json()
  if (data2.result !== 'success') throw new Error('The exchange rate service returned an error.')
  const perUnit = data2.rates?.[to]
  if (perUnit === undefined) throw new Error(`No rate available for ${to}.`)
  return {
    value: perUnit * amount,
    date: data2.time_last_update_utc ? data2.time_last_update_utc.slice(0, 16) : 'recently',
    source: 'open.er-api.com'
  }
}
