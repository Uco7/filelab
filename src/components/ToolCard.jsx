import { Link } from 'react-router-dom'

export default function ToolCard({ to, title, description, icon }) {
  return (
    <Link
      to={to}
      className="group relative block rounded-xl bg-board-light/60 border border-paper/10 p-6 pt-10 hover:-translate-y-1 hover:border-amber/60 transition-all duration-200"
    >
      {/* peg hole */}
      <span className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-board border border-paper/20" />
      <div className="w-12 h-12 rounded-lg bg-amber/15 text-amber flex items-center justify-center mb-4 group-hover:bg-amber group-hover:text-ink transition-colors">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-paper text-lg mb-1">{title}</h3>
      <p className="text-paper/60 text-sm leading-relaxed">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-mint text-sm font-medium">
        Open tool
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  )
}
