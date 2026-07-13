// FileCraft conversion server
// ---------------------------
// There is no single engine that does "any format -> any format" for office
// documents. This server chains several specialized tools and falls back
// through a PDF "bridge" when a direct conversion isn't possible:
//
//   - soffice (LibreOffice headless): best for same-family conversions
//     (docx<->odt/rtf/txt, pptx<->odp, xlsx<->xls/ods/csv) and ANY format -> pdf.
//   - pdf2docx (Python): pdf -> docx, with real paragraph/table reconstruction.
//   - pdftoppm (poppler): pdf -> page images (base for pdf -> pptx).
//   - python-pptx + Pillow (Python): builds a pptx from page images
//     (one image per slide -- visually faithful, but NOT editable text).
//   - pdftotext -layout (poppler): pdf -> column-aware text, parsed into CSV
//     as a best-effort table extraction, then handed to soffice for xlsx/ods.
//
// Required installs on the host machine:
//   - LibreOffice            (soffice on PATH, or set SOFFICE_PATH)
//   - Python 3               (on PATH, or set PYTHON_PATH)
//       pip install pdf2docx python-pptx Pillow
//   - Poppler utils          (pdftoppm + pdftotext on PATH, or set POPPLER_BIN_DIR
//     to the folder containing them, e.g. on Windows the poppler "bin" folder)

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import crypto from 'crypto'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
})

const app = express()
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*'
app.use(cors({ origin: allowedOrigin }))

app.get('/health', (req, res) => res.json({ ok: true }))

const SUPPORTED_FORMATS = new Set([
  'pdf', 'docx', 'doc', 'odt', 'rtf', 'txt',
  'pptx', 'ppt', 'odp',
  'xlsx', 'xls', 'ods', 'csv'
])

const WRITER_FAMILY = new Set(['docx', 'doc', 'odt', 'rtf', 'txt'])
const IMPRESS_FAMILY = new Set(['pptx', 'ppt', 'odp'])
const CALC_FAMILY = new Set(['xlsx', 'xls', 'ods', 'csv'])

const SOFFICE_BIN = process.env.SOFFICE_PATH || 'soffice'
const PYTHON_BIN = process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3')
const POPPLER_BIN_DIR = process.env.POPPLER_BIN_DIR || '' // e.g. "C:\\poppler\\bin" (not needed on Linux if installed via apt)

// Legacy binary Office formats are ambiguous by extension alone in soffice's
// filter resolution and can silently fail with just "--convert-to ppt".
// Naming the exact export filter fixes it.
const SOFFICE_FILTER_NAMES = {
  ppt: 'MS PowerPoint 97',
  doc: 'MS Word 97',
  xls: 'MS Excel 97'
}

function convertToArg(targetFormat) {
  const filterName = SOFFICE_FILTER_NAMES[targetFormat]
  return filterName ? `${targetFormat}:${filterName}` : targetFormat
}

function bin(name) {
  return POPPLER_BIN_DIR ? path.join(POPPLER_BIN_DIR, name) : name
}

function runProcess(binPath, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const proc = spawn(binPath, args, { env })
    let stderr = ''
    let stdout = ''
    proc.stdout.on('data', d => (stdout += d.toString()))
    proc.stderr.on('data', d => (stderr += d.toString()))
    proc.on('error', (err) => reject(new Error(`Failed to launch ${binPath}: ${err.message}`)))
    proc.on('close', (code) => resolve({ code, stdout, stderr }))
  })
}

async function withTempDir(fn) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'filecraft-'))
  try {
    return await fn(dir)
  } finally {
    fs.rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

// ---------- soffice: direct conversion within/into a compatible format ----------
async function convertWithSoffice(inputBuffer, inputExt, targetFormat) {
  return withTempDir(async (workDir) => {
    const inputName = `source-${crypto.randomBytes(4).toString('hex')}.${inputExt}`
    const inputPath = path.join(workDir, inputName)
    await fs.writeFile(inputPath, inputBuffer)

    // Strip PYTHONHOME/PYTHONPATH so soffice's bundled Python doesn't
    // collide with a system Python install (causes
    // "Could not find platform independent libraries <prefix>")
    const cleanEnv = { ...process.env }
    delete cleanEnv.PYTHONHOME
    delete cleanEnv.PYTHONPATH

    const args = [
      '--headless', '--norestore',
      // Each request gets its own LibreOffice profile dir. Without this,
      // concurrent requests share one profile and soffice throws lock
      // errors / fails to start under real (multi-request) traffic.
      `-env:UserInstallation=file://${workDir.replace(/\\/g, '/')}/lo_profile`,
      '--convert-to', convertToArg(targetFormat), '--outdir', workDir, inputPath
    ]
    const { code, stdout, stderr } = await runProcess(SOFFICE_BIN, args, cleanEnv)

    const expectedName = inputName.replace(/\.[^.]+$/, `.${targetFormat}`)
    const outputPath = path.join(workDir, expectedName)
    const exists = await fs.access(outputPath).then(() => true).catch(() => false)
    if (!exists) {
      throw new Error(`soffice: no output (exit ${code}). stderr: ${stderr.trim() || '(none)'} stdout: ${stdout.trim() || '(none)'}`)
    }
    return fs.readFile(outputPath)
  })
}

// ---------- pdf -> docx (real reconstruction) ----------
async function convertPdfToDocx(inputBuffer) {
  return withTempDir(async (workDir) => {
    const inputPath = path.join(workDir, 'source.pdf')
    const outputPath = path.join(workDir, 'output.docx')
    await fs.writeFile(inputPath, inputBuffer)

    const script = `
from pdf2docx import Converter
cv = Converter(r"${inputPath}")
cv.convert(r"${outputPath}")
cv.close()
`
    const { code, stdout, stderr } = await runProcess(PYTHON_BIN, ['-c', script])
    const exists = await fs.access(outputPath).then(() => true).catch(() => false)
    if (!exists) {
      throw new Error(`pdf2docx: no output (exit ${code}). stderr: ${stderr.trim() || '(none)'} stdout: ${stdout.trim() || '(none)'}. Is pdf2docx installed? (pip install pdf2docx)`)
    }
    return fs.readFile(outputPath)
  })
}

// ---------- pdf -> page images (pdftoppm) ----------
async function pdfToPageImages(inputBuffer, workDir) {
  const inputPath = path.join(workDir, 'source.pdf')
  await fs.writeFile(inputPath, inputBuffer)
  const outPrefix = path.join(workDir, 'page')

  const { code, stderr } = await runProcess(bin('pdftoppm'), ['-png', '-r', '150', inputPath, outPrefix])
  const files = (await fs.readdir(workDir)).filter(f => f.startsWith('page') && f.endsWith('.png')).sort()
  if (code !== 0 || files.length === 0) {
    throw new Error(`pdftoppm: failed to rasterize pages (exit ${code}). stderr: ${stderr.trim() || '(none)'}. Is poppler installed and on PATH? (set POPPLER_BIN_DIR if needed)`)
  }
  return files.map(f => path.join(workDir, f))
}

// ---------- pdf -> pptx (image-per-slide, visually faithful, not editable text) ----------
async function convertPdfToPptx(inputBuffer) {
  return withTempDir(async (workDir) => {
    const imagePaths = await pdfToPageImages(inputBuffer, workDir)
    const outputPath = path.join(workDir, 'output.pptx')

    const imageListPy = imagePaths.map(p => `r"${p}"`).join(', ')
    const script = `
from pptx import Presentation
from pptx.util import Emu
from PIL import Image

images = [${imageListPy}]
prs = Presentation()
prs.slide_width = Emu(12192000)   # 16:9 widescreen, 13.33in
prs.slide_height = Emu(6858000)
blank_layout = prs.slide_layouts[6]

for img_path in images:
    slide = prs.slides.add_slide(blank_layout)
    with Image.open(img_path) as im:
        iw, ih = im.size
    slide_ratio = prs.slide_width / prs.slide_height
    img_ratio = iw / ih
    if img_ratio > slide_ratio:
        w = prs.slide_width
        h = int(w / img_ratio)
    else:
        h = prs.slide_height
        w = int(h * img_ratio)
    left = int((prs.slide_width - w) / 2)
    top = int((prs.slide_height - h) / 2)
    slide.shapes.add_picture(img_path, left, top, width=w, height=h)

prs.save(r"${outputPath}")
`
    const { code, stdout, stderr } = await runProcess(PYTHON_BIN, ['-c', script])
    const exists = await fs.access(outputPath).then(() => true).catch(() => false)
    if (!exists) {
      throw new Error(`python-pptx build failed (exit ${code}). stderr: ${stderr.trim() || '(none)'} stdout: ${stdout.trim() || '(none)'}. Is python-pptx/Pillow installed? (pip install python-pptx Pillow)`)
    }
    return fs.readFile(outputPath)
  })
}

// ---------- pdf -> csv (best-effort table extraction via pdftotext -layout) ----------
async function convertPdfToCsv(inputBuffer) {
  return withTempDir(async (workDir) => {
    const inputPath = path.join(workDir, 'source.pdf')
    await fs.writeFile(inputPath, inputBuffer)

    const { code, stdout, stderr } = await runProcess(bin('pdftotext'), ['-layout', inputPath, '-'])
    if (code !== 0) {
      throw new Error(`pdftotext failed (exit ${code}). stderr: ${stderr.trim() || '(none)'}. Is poppler installed? (set POPPLER_BIN_DIR if needed)`)
    }

    // Best-effort: split each line into "columns" on runs of 2+ spaces.
    // This is a heuristic, not real table detection -- works reasonably
    // for simple tabular PDFs, not for complex multi-column layouts.
    const rows = stdout
      .split(/\r?\n/)
      .filter(line => line.trim().length > 0)
      .map(line => line.trim().split(/\s{2,}/))

    const csv = rows
      .map(cols => cols.map(c => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\r\n')

    return Buffer.from(csv, 'utf-8')
  })
}

// ---------- master router ----------
async function convertFile(inputBuffer, sourceExt, targetFormat, depth = 0) {
  if (depth > 2) throw new Error('Conversion chain too deep — this pair is not supported.')

  // 1. Anything -> pdf: soffice handles this directly and well.
  if (targetFormat === 'pdf') {
    return convertWithSoffice(inputBuffer, sourceExt, 'pdf')
  }

  // 2. Source is already pdf.
  if (sourceExt === 'pdf') {
    if (targetFormat === 'docx') {
      return convertPdfToDocx(inputBuffer)
    }
    if (WRITER_FAMILY.has(targetFormat)) {
      // pdf -> docx first, then soffice docx -> target (odt/rtf/txt/doc)
      const docxBuffer = await convertPdfToDocx(inputBuffer)
      return convertWithSoffice(docxBuffer, 'docx', targetFormat)
    }
    if (targetFormat === 'pptx') {
      return convertPdfToPptx(inputBuffer)
    }
    if (IMPRESS_FAMILY.has(targetFormat)) {
      // pdf -> pptx first, then soffice pptx -> target (ppt/odp)
      const pptxBuffer = await convertPdfToPptx(inputBuffer)
      return convertWithSoffice(pptxBuffer, 'pptx', targetFormat)
    }
    if (targetFormat === 'csv') {
      return convertPdfToCsv(inputBuffer)
    }
    if (CALC_FAMILY.has(targetFormat)) {
      // pdf -> csv (best-effort table extraction), then soffice csv -> target
      const csvBuffer = await convertPdfToCsv(inputBuffer)
      return convertWithSoffice(csvBuffer, 'csv', targetFormat)
    }
    throw new Error(`No conversion path from pdf to ${targetFormat}.`)
  }

  // 3. Same-family conversions: soffice handles these directly and well.
  const sameFamily =
    (WRITER_FAMILY.has(sourceExt) && WRITER_FAMILY.has(targetFormat)) ||
    (IMPRESS_FAMILY.has(sourceExt) && IMPRESS_FAMILY.has(targetFormat)) ||
    (CALC_FAMILY.has(sourceExt) && CALC_FAMILY.has(targetFormat))

  if (sameFamily) {
    return convertWithSoffice(inputBuffer, sourceExt, targetFormat)
  }

  // 4. Cross-family, non-pdf source and target (e.g. pptx -> docx, xlsx -> pptx):
  //    bridge through pdf. Quality depends on how well the pdf-side handler
  //    reconstructs the target format (see notes above).
  const pdfBuffer = await convertWithSoffice(inputBuffer, sourceExt, 'pdf')
  return convertFile(pdfBuffer, 'pdf', targetFormat, depth + 1)
}

app.post('/convert', upload.single('file'), async (req, res) => {
  try {
    const targetFormat = String(req.body.format || '').replace(/^\./, '').toLowerCase()
    const originalExt = (req.file?.originalname.match(/\.([^.]+)$/)?.[1] || '').toLowerCase()

    console.log(`Received request to convert file "${req.file?.originalname}" (${originalExt}) to format "${targetFormat}"`)

    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded.' })
    }
    if (!SUPPORTED_FORMATS.has(targetFormat)) {
      return res.status(400).json({ error: `Unsupported target format: ${targetFormat || '(none given)'}` })
    }
    if (!SUPPORTED_FORMATS.has(originalExt)) {
      return res.status(400).json({ error: `Unsupported source format: ${originalExt || '(none detected)'}` })
    }

    const outputBuffer = await convertFile(req.file.buffer, originalExt, targetFormat)

    console.log(`Conversion successful: ${req.file.originalname} -> ${targetFormat}, size: ${outputBuffer.length} bytes`)
    const originalName = req.file.originalname.replace(/\.[^.]+$/, '') || 'document'

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${originalName}.${targetFormat}"`
    })
    res.send(outputBuffer)
  } catch (err) {
    console.error('Conversion failed:', err)
    res.status(500).json({
      error: 'Conversion failed. The source file may be corrupted, password-protected, or in an unsupported format.',
      detail: err.message
    })
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`FileCraft conversion server listening on port ${PORT}`)
})