import { useState, useRef } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

export default function BackgroundRemover() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [cutoutUrl, setCutoutUrl] = useState(null) // the transparent-background result from the AI model
  const [finalUrl, setFinalUrl] = useState(null) // cutout composited onto the chosen background
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  const [bgMode, setBgMode] = useState('transparent') // 'transparent' | 'color' | 'image'
  const [bgColor, setBgColor] = useState('#F6F3EC')
  const [bgImageUrl, setBgImageUrl] = useState(null)

  const canvasRef = useRef(null)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setCutoutUrl(null)
    setFinalUrl(null)
    setError('')
    setPreviewUrl(URL.createObjectURL(f))
  }

  function handleBgImage(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setBgImageUrl(URL.createObjectURL(f))
    setBgMode('image')
  }

  async function removeBg() {
    if (!file) return
    setBusy(true)
    setError('')
    setFinalUrl(null)
    setProgress('Loading the model (first time only, ~10–20s)…')
    try {
      const { removeBackground } = await import('@imgly/background-removal')
      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          if (total) setProgress(`Processing… ${Math.round((current / total) * 100)}%`)
        }
      })
      setCutoutUrl(URL.createObjectURL(blob))
    } catch (err) {
      console.error(err)
      setError('Something went wrong processing that image. Try a smaller file or a different photo.')
    } finally {
      setBusy(false)
      setProgress('')
    }
  }

  async function composite() {
    if (!cutoutUrl) return
    setBusy(true)
    try {
      const cutout = new Image()
      await new Promise((resolve, reject) => {
        cutout.onload = resolve
        cutout.onerror = reject
        cutout.src = cutoutUrl
      })

      const canvas = canvasRef.current
      canvas.width = cutout.naturalWidth
      canvas.height = cutout.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (bgMode === 'color') {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else if (bgMode === 'image' && bgImageUrl) {
        const bgImg = new Image()
        await new Promise((resolve, reject) => {
          bgImg.onload = resolve
          bgImg.onerror = reject
          bgImg.src = bgImageUrl
        })
        // cover-fit the background image behind the subject
        const scale = Math.max(canvas.width / bgImg.naturalWidth, canvas.height / bgImg.naturalHeight)
        const w = bgImg.naturalWidth * scale
        const h = bgImg.naturalHeight * scale
        ctx.drawImage(bgImg, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
      }
      // 'transparent' mode: leave the canvas background empty

      ctx.drawImage(cutout, 0, 0)
      canvas.toBlob((blob) => {
        setFinalUrl(URL.createObjectURL(blob))
        setBusy(false)
      }, 'image/png')
    } catch (err) {
      console.error(err)
      setError('Couldn\u2019t apply that background \u2014 try a different background image.')
      setBusy(false)
    }
  }

  function download() {
    const url = finalUrl || cutoutUrl
    fetch(url)
      .then((r) => r.blob())
      .then((blob) => saveAs(blob, `${file?.name?.replace(/\.[^.]+$/, '') || 'image'}-no-bg.png`))
  }

  return (
    <>
      <SEO
        title="Background Remover — Remove or Replace an Image Background Free"
        description="Remove the background from any photo for free, then optionally replace it with a solid color or your own image. Works entirely in your browser — no upload, no account, no watermark."
        path="/tools/background-remover"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to remove or replace a background from a photo online',
          step: [
            { '@type': 'HowToStep', text: 'Upload a photo.' },
            { '@type': 'HowToStep', text: 'Click Remove background and wait a few seconds.' },
            { '@type': 'HowToStep', text: 'Optionally pick a new background color or image.' },
            { '@type': 'HowToStep', text: 'Download the result.' }
          ]
        }}
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Background Remover</h1>
        <p className="text-ink/60 mb-8">
          Cuts the subject out of a photo, then lets you keep it transparent, drop in a solid
          color, or place it on a background image you upload. Runs a small AI model right in
          your browser tab — your photo is never sent to a server.
        </p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="bg-upload" />
          <label htmlFor="bg-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            Choose a photo
          </label>
          {file && <p className="text-sm text-ink/50 mt-3">{file.name}</p>}
        </div>

        {previewUrl && !cutoutUrl && (
          <img src={previewUrl} alt="Original upload preview" className="rounded-lg border border-board/10 max-h-80 mb-6" />
        )}

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button
            onClick={removeBg}
            disabled={!file || busy}
            className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40"
          >
            {busy && !cutoutUrl ? 'Working…' : 'Remove background'}
          </button>
          {progress && <span className="text-sm text-ink/50">{progress}</span>}
        </div>

        {cutoutUrl && (
          <>
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Choose a new background</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setBgMode('transparent')} className={`text-sm px-4 py-2 rounded-lg ${bgMode === 'transparent' ? 'bg-amber text-ink' : 'bg-board/10'}`}>Transparent</button>
                <button onClick={() => setBgMode('color')} className={`text-sm px-4 py-2 rounded-lg ${bgMode === 'color' ? 'bg-amber text-ink' : 'bg-board/10'}`}>Solid color</button>
                <button onClick={() => document.getElementById('bg-image-upload').click()} className={`text-sm px-4 py-2 rounded-lg ${bgMode === 'image' ? 'bg-amber text-ink' : 'bg-board/10'}`}>
                  Upload background image
                </button>
                <input type="file" accept="image/*" onChange={handleBgImage} className="hidden" id="bg-image-upload" />
              </div>

              {bgMode === 'color' && (
                <div className="flex items-center gap-3 mb-4">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10" />
                  <span className="text-sm text-ink/50">{bgColor}</span>
                </div>
              )}
              {bgMode === 'image' && bgImageUrl && (
                <img src={bgImageUrl} alt="Chosen background preview" className="h-16 rounded border border-board/10 mb-4" />
              )}

              <button onClick={composite} disabled={busy} className="bg-mint text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
                {busy && cutoutUrl ? 'Applying…' : 'Apply background'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm font-medium mb-2">Original</p>
                <img src={previewUrl} alt="Original upload preview" className="rounded-lg border border-board/10 w-full" />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Result</p>
                <div className="rounded-lg border border-board/10 w-full bg-[repeating-conic-gradient(#e5e5e5_0%_25%,white_0%_50%)] bg-[length:16px_16px]">
                  <img src={finalUrl || cutoutUrl} alt="Background removed or replaced result" className="w-full" />
                </div>
              </div>
            </div>

            <button onClick={download} className="bg-board text-paper font-semibold px-6 py-2.5 rounded-lg">
              Download PNG
            </button>
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />
        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
