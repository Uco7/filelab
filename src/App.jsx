import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'

import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import NotFound from './pages/NotFound.jsx'

import BlogIndex from './pages/blog/BlogIndex.jsx'
import RemoveBackgroundPost from './pages/blog/RemoveBackgroundPost.jsx'
import ExtractTextPost from './pages/blog/ExtractTextPost.jsx'
import SignaturePost from './pages/blog/SignaturePost.jsx'
import PDFToolsPost from './pages/blog/PDFToolsPost.jsx'
import KDPFormattingPost from './pages/blog/KDPFormattingPost.jsx'

import ImageConverter from './pages/tools/ImageConverter.jsx'
import BackgroundRemover from './pages/tools/BackgroundRemover.jsx'
import ImageToText from './pages/tools/ImageToText.jsx'
import SignatureMaker from './pages/tools/SignatureMaker.jsx'
import SignatureExtractor from './pages/tools/SignatureExtractor.jsx'
import SignDocument from './pages/tools/SignDocument.jsx'
import DocumentConverter from './pages/tools/DocumentConverter.jsx'
import TextSummarizer from './pages/tools/TextSummarizer.jsx'
import TextRephraser from './pages/tools/TextRephraser.jsx'
import EmojiRemover from './pages/tools/EmojiRemover.jsx'
import ImageCompressor from './pages/tools/ImageCompressor.jsx'
import ImagesToPDF from './pages/tools/ImagesToPDF.jsx'
import MergePDF from './pages/tools/MergePDF.jsx'
import SplitPDF from './pages/tools/SplitPDF.jsx'
import PDFToImages from './pages/tools/PDFToImages.jsx'
import PDFTextExtractor from './pages/tools/PDFTextExtractor.jsx'
import TextToWord from './pages/tools/TextToWord.jsx'
import TextToPDF from './pages/tools/TextToPDF.jsx'
import TextToPPT from './pages/tools/TextToPPT.jsx'
import ImagesToPPT from './pages/tools/ImagesToPPT.jsx'
import PDFToPPT from './pages/tools/PDFToPPT.jsx'
import KDPPrintFormatter from './pages/tools/KDPPrintFormatter.jsx'
import KDPEbookFormatter from './pages/tools/KDPEbookFormatter.jsx'
import CurrencyConverter from './pages/tools/CurrencyConverter.jsx'
import CryptoConverter from './pages/tools/CryptoConverter.jsx'
import StockChecker from './pages/tools/StockChecker.jsx'
import  PrivacyPolicy from './pages/PrivacyPolicy.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/tools/image-converter" element={<ImageConverter />} />
        <Route path="/tools/background-remover" element={<BackgroundRemover />} />
        <Route path="/tools/image-to-text" element={<ImageToText />} />
        <Route path="/tools/signature-maker" element={<SignatureMaker />} />
        <Route path="/tools/signature-extractor" element={<SignatureExtractor />} />
        <Route path="/tools/sign-document" element={<SignDocument />} />
        <Route path="/tools/document-converter" element={<DocumentConverter />} />
        <Route path="/tools/text-summarizer" element={<TextSummarizer />} />
        <Route path="/tools/text-rephraser" element={<TextRephraser />} />
        <Route path="/tools/emoji-remover" element={<EmojiRemover />} />
        <Route path="/tools/image-compressor" element={<ImageCompressor />} />
        <Route path="/tools/images-to-pdf" element={<ImagesToPDF />} />
        <Route path="/tools/merge-pdf" element={<MergePDF />} />
        <Route path="/tools/split-pdf" element={<SplitPDF />} />
        <Route path="/tools/pdf-to-images" element={<PDFToImages />} />
        <Route path="/tools/pdf-text-extractor" element={<PDFTextExtractor />} />
        <Route path="/tools/text-to-word" element={<TextToWord />} />
        <Route path="/tools/text-to-pdf" element={<TextToPDF />} />
        <Route path="/tools/text-to-ppt" element={<TextToPPT />} />
        <Route path="/tools/images-to-ppt" element={<ImagesToPPT />} />
        <Route path="/tools/pdf-to-ppt" element={<PDFToPPT />} />
        <Route path="/tools/kdp-print-formatter" element={<KDPPrintFormatter />} />
        <Route path="/tools/kdp-ebook-formatter" element={<KDPEbookFormatter />} />
        <Route path="/tools/currency-converter" element={<CurrencyConverter />} />
        <Route path="/tools/crypto-converter" element={<CryptoConverter />} />
        <Route path="/tools/stock-checker" element={<StockChecker />} />

        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/how-to-remove-image-background-free" element={<RemoveBackgroundPost />} />
        <Route path="/blog/how-to-extract-text-from-image" element={<ExtractTextPost />} />
        <Route path="/blog/how-to-create-online-signature" element={<SignaturePost />} />
        <Route path="/blog/free-pdf-tools-guide" element={<PDFToolsPost />} />
        <Route path="/blog/format-manuscript-for-kdp" element={<KDPFormattingPost />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/bookstore/app/privacy-policy/page" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
