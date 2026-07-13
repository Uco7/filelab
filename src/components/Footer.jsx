import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-board text-paper/70 mt-24">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="font-display font-bold text-paper mb-3">FileCraft</p>
          <p>Free browser-based tools for everyday file and image work. Nothing you upload leaves your device unless a tool says otherwise.</p>
        </div>
        <div>
          <p className="font-semibold text-paper mb-3">Tools</p>
          <ul className="space-y-2">
            <li><Link to="/tools/image-converter" className="hover:text-amber">Image converter</Link></li>
            <li><Link to="/tools/background-remover" className="hover:text-amber">Background remover</Link></li>
            <li><Link to="/tools/image-to-text" className="hover:text-amber">Image to text (OCR)</Link></li>
            <li><Link to="/tools/signature-maker" className="hover:text-amber">Signature maker</Link></li>
            <li><Link to="/tools/signature-extractor" className="hover:text-amber">Signature extractor</Link></li>
            <li><Link to="/tools/sign-document" className="hover:text-amber">Sign a document</Link></li>
            <li><Link to="/tools/text-summarizer" className="hover:text-amber">Text summarizer</Link></li>
            <li><Link to="/tools/text-rephraser" className="hover:text-amber">Text rephraser</Link></li>
            <li><Link to="/tools/emoji-remover" className="hover:text-amber">Emoji remover</Link></li>
            <li><Link to="/tools/image-compressor" className="hover:text-amber">Image compressor</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-paper mb-3">Document tools</p>
          <ul className="space-y-2">
            <li><Link to="/tools/document-converter" className="hover:text-amber">Document converter</Link></li>
            <li><Link to="/tools/images-to-pdf" className="hover:text-amber">Images to PDF</Link></li>
            <li><Link to="/tools/merge-pdf" className="hover:text-amber">Merge PDF</Link></li>
            <li><Link to="/tools/split-pdf" className="hover:text-amber">Split PDF</Link></li>
            <li><Link to="/tools/pdf-to-images" className="hover:text-amber">PDF to images</Link></li>
            <li><Link to="/tools/pdf-text-extractor" className="hover:text-amber">PDF text extractor</Link></li>
            <li><Link to="/tools/text-to-word" className="hover:text-amber">Text to Word</Link></li>
            <li><Link to="/tools/text-to-pdf" className="hover:text-amber">Text to PDF</Link></li>
            <li><Link to="/tools/text-to-ppt" className="hover:text-amber">Text to PowerPoint</Link></li>
            <li><Link to="/tools/images-to-ppt" className="hover:text-amber">Images to PowerPoint</Link></li>
            <li><Link to="/tools/pdf-to-ppt" className="hover:text-amber">PDF to PowerPoint</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-paper mb-3">Publishing (KDP)</p>
          <ul className="space-y-2">
            <li><Link to="/tools/kdp-print-formatter" className="hover:text-amber">Print formatter</Link></li>
            <li><Link to="/tools/kdp-ebook-formatter" className="hover:text-amber">eBook formatter</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-paper mb-3">Markets</p>
          <ul className="space-y-2">
            <li><Link to="/tools/currency-converter" className="hover:text-amber">Currency converter</Link></li>
            <li><Link to="/tools/crypto-converter" className="hover:text-amber">Crypto converter</Link></li>
            <li><Link to="/tools/stock-checker" className="hover:text-amber">Stock price checker</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-paper mb-3">Learn</p>
          <ul className="space-y-2">
            <li><Link to="/blog" className="hover:text-amber">Blog</Link></li>
            <li><Link to="/about" className="hover:text-amber">About</Link></li>
            <li><Link to="/contact" className="hover:text-amber">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-paper mb-3">Legal</p>
          <ul className="space-y-2">
            <li><Link to="/privacy" className="hover:text-amber">Privacy policy</Link></li>
            <li><Link to="/terms" className="hover:text-amber">Terms of use</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-board-light text-center text-xs py-4">
        © {new Date().getFullYear()} FileCraft. All processing runs in your browser.
      </div>
    </footer>
  )
}
