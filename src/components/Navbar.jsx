import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/tools/image-converter', label: 'Convert' },
  { to: '/tools/background-remover', label: 'Background' },
  { to: '/tools/image-to-text', label: 'OCR' },
  { to: '/tools/signature-maker', label: 'Signature' },
  { to: '/tools/text-summarizer', label: 'Summarize' },
  { to: '/tools/text-rephraser', label: 'Rephrase' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-board text-paper border-b border-board-light">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="inline-block w-3 h-3 rounded-full bg-amber" />
          FileCraft
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `hover:text-amber transition-colors ${isActive ? 'text-amber' : 'text-paper/80'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="lg:hidden text-paper"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-board-light px-4 py-3 flex flex-col gap-3 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-paper/90 hover:text-amber"
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
