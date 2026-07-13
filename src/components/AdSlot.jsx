/**
 * Placeholder ad slot.
 *
 * Once your AdSense account is approved:
 * 1. Uncomment the <script> tag in index.html (client=ca-pub-XXXX)
 * 2. Replace the <div> below with your real <ins class="adsbygoogle"> unit
 *    and call (adsbygoogle = window.adsbygoogle || []).push({}) in a useEffect.
 *
 * Keeping ad slots as a single shared component means you only wire this up
 * in one place when you're ready to go live with ads.
 */
export default function AdSlot({ label = 'Advertisement', className = '' }) {
  return (
    <div
      className={`w-full flex items-center justify-center rounded-lg border border-dashed border-board-light/30 bg-board/5 text-xs uppercase tracking-wide text-ink/40 font-mono py-6 ${className}`}
      aria-hidden="true"
    >
      {label}
    </div>
  )
}
