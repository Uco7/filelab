// Shared manuscript parsing for the KDP formatting tools.
//
// A line counts as a chapter heading if it:
//   - starts with "# " (explicit Markdown-style marker), or
//   - starts with the word "Chapter", or
//   - is short and, once a leading list marker like "1.", "ii.", "iii)" is
//     stripped off, is ALL CAPS — this is what real extracted documents
//     usually look like ("DECLARATION", "ABSTRACT", "CHAPTER ONE", each
//     often prefixed with a roman-numeral or number from the original
//     page's own numbering).
// Blank lines separate paragraphs within a chapter.
function stripLeadingMarker(line) {
  return line
    .replace(/^[ivxlcdm]{1,6}[\s.):-]+/i, '')
    .replace(/^\d{1,3}[\s.):-]+/, '')
    .trim()
}

function detectHeading(rawLine) {
  const line = rawLine.trim()
  if (!line) return null

  if (/^#\s+/.test(line)) {
    return line.replace(/^#\s+/, '').trim()
  }
  if (/^chapter\b/i.test(line)) {
    return line
  }

  const stripped = stripLeadingMarker(line)
  if (stripped.length < 3 || stripped.length > 80) return null
  const letters = stripped.replace(/[^A-Za-z]/g, '')
  if (letters.length < 3) return null
  const isAllCaps = letters === letters.toUpperCase()
  return isAllCaps ? stripped : null
}

export function parseChapters(text) {
  const lines = text.split('\n')
  const chapters = []
  let current = null
  let paraBuffer = []

  function flushPara() {
    const joined = paraBuffer.join(' ').trim()
    if (joined && current) current.paragraphs.push(joined)
    paraBuffer = []
  }

  for (const raw of lines) {
    const line = raw.trim()
    const headingTitle = detectHeading(line)
    if (headingTitle !== null) {
      flushPara()
      current = { title: headingTitle, paragraphs: [] }
      chapters.push(current)
    } else if (line === '') {
      flushPara()
    } else {
      if (!current) {
        current = { title: 'Manuscript', paragraphs: [] }
        chapters.push(current)
      }
      paraBuffer.push(line)
    }
  }
  flushPara()
  return chapters.filter((c) => c.paragraphs.length > 0)
}
