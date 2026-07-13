import { useState } from 'react'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

// Splits pasted text into slides: a blank line starts a new slide.
// Within a slide, the first line is the title and the rest become bullets.
function parseSlides(text) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  return blocks.map((block) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
    return { title: lines[0] || 'Slide', bullets: lines.slice(1) }
  })
}

export default function TextToPPT() {
  const [text, setText] = useState('')
  const [deckTitle, setDeckTitle] = useState('')
  const [busy, setBusy] = useState(false)

  const slides = text.trim() ? parseSlides(text) : []

  async function build() {
    if (!slides.length) return
    setBusy(true)
    try {
      const pptxgen = (await import('pptxgenjs')).default
      const pres = new pptxgen()
      pres.layout = 'LAYOUT_16x9'

      if (deckTitle.trim()) {
        const cover = pres.addSlide()
        cover.addText(deckTitle.trim(), {
          x: 0.5, y: 2, w: 9, h: 1.5,
          fontSize: 36, bold: true, align: 'center', color: '1B1F23'
        })
      }

      slides.forEach(({ title, bullets }) => {
        const slide = pres.addSlide()
        slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.9, fontSize: 28, bold: true, color: '1B1F23' })
        if (bullets.length) {
          slide.addText(
            bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
            { x: 0.6, y: 1.5, w: 8.8, h: 3.5, fontSize: 18, color: '20262E' }
          )
        }
      })

      const blob = await pres.write({ outputType: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(deckTitle.trim() || 'presentation').replace(/[^a-z0-9-_]+/gi, '-')}.pptx`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SEO
        title="Text to PowerPoint — Create a PPTX From Text Free"
        description="Paste text and get a downloadable PowerPoint deck. A blank line starts a new slide, the first line becomes the title. Free, runs in your browser."
        path="/tools/text-to-ppt"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Text to PowerPoint</h1>
        <p className="text-ink/60 mb-2">
          Paste an outline below. Leave a blank line between slides — the first line of each
          block becomes the slide title, the rest become bullet points.
        </p>
        <p className="text-ink/40 text-sm mb-8 font-mono">
          Example:{'\n'}Why this matters{'\n'}Saves time{'\n'}Costs nothing{'\n\n'}Next steps{'\n'}Try it today
        </p>

        <input
          type="text"
          value={deckTitle}
          onChange={(e) => setDeckTitle(e.target.value)}
          placeholder="Deck title (optional cover slide)"
          className="w-full border border-board/20 rounded-lg p-3 mb-4"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder={'Slide 1 title\nBullet one\nBullet two\n\nSlide 2 title\nBullet one'}
          className="w-full border border-board/20 rounded-lg p-4 mb-4 font-mono text-sm"
        />

        {slides.length > 0 && (
          <p className="text-ink/40 text-xs mb-6">{slides.length} slide{slides.length === 1 ? '' : 's'} detected</p>
        )}

        <button onClick={build} disabled={!slides.length || busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
          {busy ? 'Building…' : 'Download .pptx'}
        </button>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
