import { useState } from 'react'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'

function fileToDataUrlWithSize(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve({ dataUrl: reader.result, width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ImagesToPPT() {
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)

  function handleFiles(e) {
    const newFiles = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  function moveFile(index, dir) {
    setFiles((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function build() {
    if (!files.length) return
    setBusy(true)
    try {
      const pptxgen = (await import('pptxgenjs')).default
      const pres = new pptxgen()
      pres.layout = 'LAYOUT_16x9'
      const SLIDE_W = 10
      const SLIDE_H = 5.63

      for (const file of files) {
        const { dataUrl, width, height } = await fileToDataUrlWithSize(file)
        const slide = pres.addSlide()
        // fit the image inside the slide, preserving aspect ratio, centered
        const imgRatio = width / height
        const slideRatio = SLIDE_W / SLIDE_H
        let w, h
        if (imgRatio > slideRatio) {
          w = SLIDE_W
          h = SLIDE_W / imgRatio
        } else {
          h = SLIDE_H
          w = SLIDE_H * imgRatio
        }
        const x = (SLIDE_W - w) / 2
        const y = (SLIDE_H - h) / 2
        slide.addImage({ data: dataUrl, x, y, w, h })
      }

      const blob = await pres.write({ outputType: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'slides.pptx'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SEO
        title="Images to PowerPoint — Photos to PPTX Free"
        description="Turn one or more images into a PowerPoint deck, one image per slide, in the order you choose. Free, runs in your browser, no upload."
        path="/tools/images-to-ppt"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Images to PowerPoint</h1>
        <p className="text-ink/60 mb-8">Pick one or more images and get a PowerPoint deck back, one full-slide image per photo.</p>

        <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" id="i2ppt-upload" />
          <label htmlFor="i2ppt-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
            {files.length ? 'Add more images' : 'Choose images'}
          </label>
        </div>

        {files.length > 0 && (
          <ul className="mb-6 divide-y divide-board/10 border border-board/10 rounded-lg">
            {files.map((f, i) => (
              <li key={f.name + i} className="flex items-center justify-between px-4 py-2 text-sm">
                <span>{i + 1}. {f.name}</span>
                <span className="flex gap-2">
                  <button onClick={() => moveFile(i, -1)} className="text-ink/50 hover:text-ink" aria-label="Move up">↑</button>
                  <button onClick={() => moveFile(i, 1)} className="text-ink/50 hover:text-ink" aria-label="Move down">↓</button>
                  <button onClick={() => removeFile(i)} className="text-red-600 hover:text-red-700" aria-label="Remove">✕</button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <button onClick={build} disabled={!files.length || busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
          {busy ? 'Building…' : 'Download .pptx'}
        </button>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
