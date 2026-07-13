// Lightweight extractive summarizer.
// Scores sentences by word-frequency and picks the highest-scoring ones,
// then re-orders them the way they originally appeared. No network call,
// no API key, runs entirely in the browser.

const STOPWORDS = new Set(
  'a an the of and or but if then else for to in on at by with from as is are was were be been being this that these those it its it\'s i you he she we they them his her our your their not no do does did have has had can could will would should may might must so than too very just also about into over under again further here there when where why how all each few more most other some such only own same'
    .split(' ')
)

function splitSentences(text) {
  const clean = text.replace(/\s+/g, ' ').trim()
  const matches = clean.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)
  return (matches || []).map((s) => s.trim()).filter(Boolean)
}

function wordFreq(sentences) {
  const freq = {}
  for (const s of sentences) {
    const words = s.toLowerCase().match(/[a-z0-9']+/g) || []
    for (const w of words) {
      if (STOPWORDS.has(w) || w.length < 3) continue
      freq[w] = (freq[w] || 0) + 1
    }
  }
  return freq
}

export function summarize(text, ratio = 0.3) {
  const sentences = splitSentences(text)
  if (sentences.length <= 3) return text.trim()

  const freq = wordFreq(sentences)
  const maxFreq = Math.max(...Object.values(freq), 1)

  const scored = sentences.map((s, i) => {
    const words = s.toLowerCase().match(/[a-z0-9']+/g) || []
    let score = 0
    for (const w of words) {
      if (freq[w]) score += freq[w] / maxFreq
    }
    // slight boost for early sentences (lede bias) and normalize by length
    const lengthNorm = Math.max(words.length, 1)
    score = score / lengthNorm + (i === 0 ? 0.15 : 0)
    return { index: i, sentence: s, score }
  })

  const count = Math.max(2, Math.round(sentences.length * ratio))
  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => a.index - b.index)

  return top.map((t) => t.sentence).join(' ')
}

export function countWords(text) {
  return (text.trim().match(/\S+/g) || []).length
}
