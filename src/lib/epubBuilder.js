// Builds a minimal, valid EPUB 2.0.1 file entirely client-side using JSZip.
// This is the same structure Kindle Direct Publishing (KDP) expects for a
// Kindle eBook upload: a container pointing at an OPF package file, a
// chapter per XHTML file, and an NCX table of contents.

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function randomId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function buildEpub({ title, author, language = 'en', chapters }) {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  // Must be the first entry, stored uncompressed, per the EPUB spec.
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })

  zip.folder('META-INF').file(
    'container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  )

  const oebps = zip.folder('OEBPS')
  oebps.folder('styles').file(
    'stylesheet.css',
    `body { font-family: serif; line-height: 1.5; margin: 1em; }
h1 { text-align: center; margin-bottom: 1.2em; }
p { text-indent: 1.5em; margin: 0 0 0.6em 0; }`
  )

  const textFolder = oebps.folder('text')
  const manifestItems = []
  const spineItems = []
  const navPoints = []

  chapters.forEach((chapter, i) => {
    const id = `chapter${i + 1}`
    const filename = `${id}.xhtml`
    const bodyHtml = chapter.paragraphs.map((p) => `  <p>${escapeXml(p)}</p>`).join('\n')
    const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXml(chapter.title)}</title>
  <link rel="stylesheet" type="text/css" href="../styles/stylesheet.css"/>
</head>
<body>
  <h1>${escapeXml(chapter.title)}</h1>
${bodyHtml}
</body>
</html>`
    textFolder.file(filename, xhtml)
    manifestItems.push(`<item id="${id}" href="text/${filename}" media-type="application/xhtml+xml"/>`)
    spineItems.push(`<itemref idref="${id}"/>`)
    navPoints.push(
      `<navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(chapter.title)}</text></navLabel>
      <content src="text/${filename}"/>
    </navPoint>`
    )
  })

  const uuid = `urn:uuid:${randomId()}`

  oebps.file(
    'content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator opf:role="aut">${escapeXml(author)}</dc:creator>
    <dc:language>${language}</dc:language>
    <dc:identifier id="BookId">${uuid}</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="css" href="styles/stylesheet.css" media-type="text/css"/>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine toc="ncx">
    ${spineItems.join('\n    ')}
  </spine>
</package>`
  )

  oebps.file(
    'toc.ncx',
    `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uuid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(title)}</text></docTitle>
  <navMap>
    ${navPoints.join('\n    ')}
  </navMap>
</ncx>`
  )

  return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' })
}
