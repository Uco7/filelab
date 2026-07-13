import { useState } from 'react'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { removeEmojis, countEmojis } from '../../lib/emojiRegex.js'

export default function EmojiRemover() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  function run() {
    setOutput(removeEmojis(input))
  }

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <SEO
        title="Emoji Remover — Strip Emoji From Text Free"
        description="Remove every emoji from a block of text in one click. Free, private, works entirely in your browser."
        path="/tools/emoji-remover"
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Emoji Remover</h1>
        <p className="text-ink/60 mb-8">
          Paste in text with emoji — captions, chat logs, comments — and get a clean, emoji-free version back.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder="Paste text with emoji here 🎉😀🔥…"
          className="w-full border border-board/20 rounded-lg p-4 mb-2"
        />
        <p className="text-xs text-ink/40 mb-4">{countEmojis(input)} emoji detected</p>

        <button
          onClick={run}
          disabled={!input.trim()}
          className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40 mb-6"
        >
          Remove emoji
        </button>

        {output && (
          <div>
            <label className="block text-sm font-medium mb-2">Clean text</label>
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
