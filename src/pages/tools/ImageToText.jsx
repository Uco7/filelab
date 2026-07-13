import { useState } from 'react'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

export default function ImageToText() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setText('')
    setPreviewUrl(URL.createObjectURL(f))
  }

  async function extract() {
    if (!file) return
    setBusy(true)
    setProgress(0)
    setText('')
    try {
      const Tesseract = await import('tesseract.js')
      const { data } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        }
      })
      setText(data.text.trim())
    } catch (err) {
      console.error(err)
      setText('')
    } finally {
      setBusy(false)
    }
  }

  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function download() {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extracted-text.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <SEO
        title="Image to Text — Free OCR Online"
        description="Extract editable text from any photo, screenshot or scan. Free OCR that runs in your browser — no upload, no sign-up."
        path="/tools/image-to-text"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to extract text from an image online',
          step: [
            { '@type': 'HowToStep', text: 'Upload a photo, screenshot or scan.' },
            { '@type': 'HowToStep', text: 'Click Extract text and wait for OCR to finish.' },
            { '@type': 'HowToStep', text: 'Copy the text or download it as a .txt file.' }
          ]
        }}
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Image to Text (OCR)</h1>
        <p className="text-ink/60 mb-8">Pulls readable, copyable text out of a photo, screenshot or scanned page. Best with clear, well-lit, upright text.</p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="ocr-upload" />
          <label htmlFor="ocr-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            Choose an image
          </label>
          {file && <p className="text-sm text-ink/50 mt-3">{file.name}</p>}
        </div>

        {previewUrl && (
          <img src={previewUrl} alt="Uploaded preview for text extraction" className="rounded-lg border border-board/10 max-h-80 mx-auto mb-6" />
        )}

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={extract}
            disabled={!file || busy}
            className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40"
          >
            {busy ? `Reading… ${progress}%` : 'Extract text'}
          </button>
        </div>

        {text && (
          <div>
            <label className="block text-sm font-medium mb-2">Extracted text</label>
            <textarea
              readOnly
              value={text}
              rows={10}
              className="w-full border border-board/20 rounded-lg p-4 font-mono text-sm"
            />
            <div className="flex gap-3 mt-3">
              <button onClick={copy} className="bg-mint text-ink font-semibold px-5 py-2 rounded-lg text-sm">
                {copied ? 'Copied!' : 'Copy text'}
              </button>
              <button onClick={download} className="bg-board text-paper font-semibold px-5 py-2 rounded-lg text-sm">
                Download .txt
              </button>
            </div>
          </div>
        )}

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
