import { useState } from 'react'
import { saveAs } from 'file-saver'
import SEO from '../../components/SEO.jsx'
import AdSlot from '../../components/AdSlot.jsx'
import { API_BASE_URL } from '../../lib/config.js'

const FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'Word (.docx)' },
  { value: 'odt', label: 'OpenDocument Text (.odt)' },
  { value: 'rtf', label: 'Rich Text (.rtf)' },
  { value: 'txt', label: 'Plain Text (.txt)' },
  { value: 'pptx', label: 'PowerPoint (.pptx)' },
  { value: 'odp', label: 'OpenDocument Presentation (.odp)' },
  { value: 'xlsx', label: 'Excel (.xlsx)' },
  { value: 'ods', label: 'OpenDocument Spreadsheet (.ods)' },
  { value: 'csv', label: 'CSV (.csv)' }
]

const ACCEPT =
  '.pdf,.doc,.docx,.odt,.rtf,.txt,.ppt,.pptx,.odp,.xls,.xlsx,.ods,.csv,' +
  'application/pdf,application/msword,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
  'application/vnd.oasis.opendocument.text,application/rtf,text/plain,' +
  'application/vnd.ms-powerpoint,' +
  'application/vnd.openxmlformats-officedocument.presentationml.presentation,' +
  'application/vnd.oasis.opendocument.presentation,application/vnd.ms-excel,' +
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
  'application/vnd.oasis.opendocument.spreadsheet,text/csv'

export default function DocumentConverter() {
  const [file, setFile] = useState(null)
  const [format, setFormat] = useState('pdf')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const configured = Boolean(API_BASE_URL)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError('')
  }

  async function convert() {
    if (!file || !configured) return
    setBusy(true)
    setError('')
    setStatus('Uploading…')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('format', format)

      // A free backend instance can be asleep; let the person know instead
      // of the request just looking stuck.
      const wakeTimer = setTimeout(() => setStatus('Waking up the converter (free tier can take up to a minute)…'), 4000)

      const res = await fetch(`${API_BASE_URL}/convert`, { method: 'POST', body })
      clearTimeout(wakeTimer)

      if (!res.ok) {
        let message = 'Conversion failed.'
        try {
          const data = await res.json()
          if (data.error) message = data.error
        } catch {
          // response wasn't JSON — keep the generic message
        }
        throw new Error(message)
      }

      setStatus('Downloading…')
      const blob = await res.blob()
      const originalName = file.name.replace(/\.[^.]+$/, '')
      saveAs(blob, `${originalName}.${format}`)
      setStatus('Done.')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong reaching the conversion server.')
      setStatus('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SEO
        title="Document Converter — PDF, Word, PowerPoint & Excel"
        description="Convert between PDF, Word, PowerPoint, Excel, and OpenDocument formats while keeping the original layout, using a real document engine."
        path="/tools/document-converter"
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-2">Document Converter</h1>
        <p className="text-ink/60 mb-8">
          Converts between PDF, Word, PowerPoint, Excel, and OpenDocument formats using a real
          document engine, so layout and formatting carry over — not just a rebuild from plain
          text like our other document tools.
        </p>

        {!configured ? (
          <div className="bg-board-light/10 border border-board/10 rounded-xl p-6">
            <p className="font-medium mb-2">This tool isn't switched on for this deployment.</p>
            <p className="text-ink/60 text-sm">
              Unlike every other tool on this site, true Word/PowerPoint/Excel ⇄ PDF conversion
              needs a small backend running a real document engine — it can't be done in a
              browser alone. If you're the site owner, see{' '}
              <code className="bg-board/10 px-1 rounded">server/README.md</code> in the project
              for how to deploy it (it's a separate, optional piece).
            </p>
          </div>
        ) : (
          <>
            <div className="border-2 border-dashed border-board/20 rounded-xl p-8 text-center mb-6">
              <input type="file" accept={ACCEPT} onChange={handleFile} className="hidden" id="doc-convert-upload" />
              <label htmlFor="doc-convert-upload" className="cursor-pointer inline-block bg-board text-paper px-5 py-2.5 rounded-lg font-medium hover:bg-board-light">
                Choose a document
              </label>
              {file && <p className="text-sm text-ink/50 mt-3">{file.name}</p>}
            </div>

            <div className="flex flex-wrap items-end gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Convert to</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} className="border border-board/20 rounded-lg px-3 py-2">
                  {FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <button onClick={convert} disabled={!file || busy} className="bg-amber text-ink font-semibold px-6 py-2.5 rounded-lg disabled:opacity-40">
                {busy ? status || 'Converting…' : 'Convert & download'}
              </button>
            </div>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            {!busy && status === 'Done.' && <p className="text-mint-dark text-sm mb-4">Done — check your downloads.</p>}
          </>
        )}

        <p className="text-ink/40 text-xs mt-6">
          Your file is sent to the conversion backend to do the actual conversion (that part
          can't happen in your browser) and isn't stored afterward.
        </p>

        <AdSlot className="mt-10" />
      </div>
    </>
  )
}
