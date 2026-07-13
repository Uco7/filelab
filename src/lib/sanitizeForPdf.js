// jsPDF's built-in fonts (helvetica/times/courier) only support the
// WinAnsi/Latin-1 character set. Text copied from Word or Google Docs is
// full of "smart" punctuation outside that set — curly quotes, em/en
// dashes, ellipsis characters, non-breaking spaces — which render as
// missing or garbled glyphs if passed straight through. This normalizes
// the common cases to their plain-ASCII equivalents before rendering.
export function sanitizeForPdf(text) {
  return String(text)
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/\u2022/g, '-')
}
