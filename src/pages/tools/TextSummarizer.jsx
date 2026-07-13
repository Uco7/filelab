import { useState } from 'react'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { summarize, countWords } from '../../lib/summarizer.js'

export default function TextSummarizer() {
  const [input, setInput] = useState('')
  const [ratio, setRatio] = useState(0.3)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  function run() {
    setOutput(summarize(input, ratio))
  }

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <SEO
        title="Text Summarizer — Summarize Any Text Free"
        description="Paste an article, essay or report and get a shorter summary made of its most important sentences. Free, private, runs in your browser."
        path="/tools/text-summarizer"
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Text Summarizer</h1>
        <p className="text-ink/60 mb-8">
          Paste in a block of text and get back the sentences that carry the most weight.
          Good for a first pass on a long article — not a substitute for actually reading it.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          placeholder="Paste your text here…"
          className="w-full border border-board/20 rounded-lg p-4 mb-4"
        />
        <p className="text-xs text-ink/40 mb-4">{countWords(input)} words</p>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <label className="text-sm font-medium">
            Summary length: {Math.round(ratio * 100)}% of original
          </label>
          <input type="range" min="0.1" max="0.6" step="0.05" value={ratio} onChange={(e) => setRatio(Number(e.target.value))} />
          <button
            onClick={run}
            disabled={!input.trim()}
            className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40"
          >
            Summarize
          </button>
        </div>

        {output && (
          <div>
            <label className="block text-sm font-medium mb-2">Summary ({countWords(output)} words)</label>
            <textarea readOnly value={output} rows={6} className="w-full border border-board/20 rounded-lg p-4" />
            <button onClick={copy} className="mt-3 bg-mint text-ink font-semibold px-5 py-2 rounded-lg text-sm">
              {copied ? 'Copied!' : 'Copy summary'}
            </button>
          </div>
        )}

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
