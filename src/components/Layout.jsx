import Navbar from './Navbar.jsx'
import ToolStrip from './ToolStrip.jsx'
import Footer from './Footer.jsx'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ToolStrip />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
