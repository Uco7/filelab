import { useState } from 'react'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { rephrase } from '../../lib/synonyms.js'

export default function TextRephraser() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  function run() {
    setOutput(rephrase(input))
  }

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <SEO
        title="Text Rephraser — Reword Sentences Free"
        description="Reword a sentence or paragraph while keeping its meaning. A quick, free, rule-based rephraser that runs entirely in your browser."
        path="/tools/text-rephraser"
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Text Rephraser</h1>
        <p className="text-ink/60 mb-8">
          Swaps common words for close synonyms so a sentence reads differently while
          keeping the same meaning. It's rule-based and quick — good for a rough
          first pass, not a replacement for a careful edit.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder="Paste a sentence or paragraph…"
          className="w-full border border-board/20 rounded-lg p-4 mb-4"
        />

        <button
          onClick={run}
          disabled={!input.trim()}
          className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40 mb-6"
        >
          Rephrase
        </button>

        {output && (
          <div>
            <label className="block text-sm font-medium mb-2">Rephrased</label>
            <textarea readOnly value={output} rows={8} className="w-full border border-board/20 rounded-lg p-4" />
            <button onClick={copy} className="mt-3 bg-mint text-ink font-semibold px-5 py-2 rounded-lg text-sm">
              {copied ? 'Copied!' : 'Copy text'}
            </button>
          </div>
        )}

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
