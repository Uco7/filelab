import { NavLink } from 'react-router-dom'

// One flat, ordered list drives the strip — grouped visually with small
// unclickable labels, but scrollable as a single row so it works the same
// on mobile (swipe) and desktop (scroll/drag).
const GROUPS = [
  {
    label: 'Images & Text',
    tools: [
      { to: '/tools/image-converter', label: 'Image Converter' },
      { to: '/tools/background-remover', label: 'Background Remover' },
      { to: '/tools/image-to-text', label: 'Image to Text' },
      { to: '/tools/signature-maker', label: 'Signature Maker' },
      { to: '/tools/signature-extractor', label: 'Signature Extractor' },
      { to: '/tools/sign-document', label: 'Sign a Document' },
      { to: '/tools/text-summarizer', label: 'Text Summarizer' },
      { to: '/tools/text-rephraser', label: 'Text Rephraser' },
      { to: '/tools/emoji-remover', label: 'Emoji Remover' },
      { to: '/tools/image-compressor', label: 'Image Compressor' }
    ]
  },
  {
    label: 'Documents',
    tools: [
      { to: '/tools/document-converter', label: 'Document Converter' },
      { to: '/tools/images-to-pdf', label: 'Images to PDF' },
      { to: '/tools/merge-pdf', label: 'Merge PDF' },
      { to: '/tools/split-pdf', label: 'Split PDF' },
      { to: '/tools/pdf-to-images', label: 'PDF to Images' },
      { to: '/tools/pdf-text-extractor', label: 'PDF Text Extractor' },
      { to: '/tools/text-to-word', label: 'Text to Word' },
      { to: '/tools/text-to-pdf', label: 'Text to PDF' },
      { to: '/tools/text-to-ppt', label: 'Text to PowerPoint' },
      { to: '/tools/images-to-ppt', label: 'Images to PowerPoint' },
      { to: '/tools/pdf-to-ppt', label: 'PDF to PowerPoint' }
    ]
  },
  {
    label: 'Publishing',
    tools: [
      { to: '/tools/kdp-print-formatter', label: 'KDP Print Formatter' },
      { to: '/tools/kdp-ebook-formatter', label: 'KDP eBook Formatter' }
    ]
  },
  {
    label: 'Markets',
    tools: [
      { to: '/tools/currency-converter', label: 'Currency Converter' },
      { to: '/tools/crypto-converter', label: 'Crypto Converter' },
      { to: '/tools/stock-checker', label: 'Stock Checker' }
    ]
  }
]

export default function ToolStrip() {
  return (
    <div className="sticky top-16 z-30 bg-paper/95 backdrop-blur border-b border-board/10">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 px-4 py-2 max-w-6xl mx-auto whitespace-nowrap w-max sm:w-full">
          {GROUPS.map((group, gi) => (
            <span key={group.label} className="flex items-center gap-2">
              {gi > 0 && <span className="w-px h-4 bg-board/15 mx-1" aria-hidden="true" />}
              <span className="text-ink/30 text-[11px] uppercase tracking-wide font-mono px-1 select-none">
                {group.label}
              </span>
              {group.tools.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  className={({ isActive }) =>
                    `text-sm px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-amber text-ink border-amber font-medium'
                        : 'bg-board/5 text-ink/70 border-board/10 hover:bg-board/10 hover:text-ink'
                    }`
                  }
                >
                  {t.label}
                </NavLink>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
