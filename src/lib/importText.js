import { loadPdfJs } from './pdfjs.js'

// Detects the kind of document by extension (more reliable than MIME type,
// since browsers are inconsistent about what type they report for .docx
// and similar formats) and extracts plain text accordingly.
export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    const pdfjsLib = await loadPdfJs()
    const bytes = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
    let full = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      full += content.items.map((it) => it.str).join(' ') + '\n\n'
    }
    return full.trim()
  }

  if (name.endsWith('.docx')) {
    const mammoth = await import('mammoth')
    const bytes = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: bytes })
    return result.value.trim()
  }

  if (name.endsWith('.doc')) {
    throw new Error(
      'Older .doc files aren\u2019t supported \u2014 open it in Word or Google Docs and save it as .docx first, then try again.'
    )
  }

  if (name.endsWith('.txt') || file.type.startsWith('text/')) {
    return (await file.text()).trim()
  }

  throw new Error('Unsupported file type \u2014 try a .pdf, .docx, or .txt file.')
}

export const IMPORT_ACCEPT =
  '.pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain'
