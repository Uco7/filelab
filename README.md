# FileCraft

Free, browser-based file and image tools: format conversion, background removal,
OCR (image → text), a signature maker, a text summarizer, a text rephraser, an
emoji remover, and an image compressor. Built with **React + Vite**, styled with
**Tailwind CSS**. No backend is required — every tool runs in the visitor's
browser, which is also what makes free 24/7 hosting possible (see below).

---

## 1. Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

Build for production:

```bash
npm run build      # outputs to /dist
npm run preview    # serve the production build locally to sanity-check it
```

---

## 2. Deploy for free, 24/7, on Render

You explicitly don't want a server that spins down — the fix is to deploy this
as a **Render Static Site**, not a Web Service. Render's free static sites are
served from a CDN and do **not** sleep after inactivity (that spin-down behavior
only applies to free *Web Services*). Since this app has no backend, a static
site is not just cheaper, it's the correct architecture here.

Steps:

1. Push this project to a GitHub repository.
2. In the Render dashboard: **New → Static Site**.
3. Connect the repo.
4. Build command: `npm install && npm run build`
5. Publish directory: `dist`
6. Add a **Rewrite rule** so client-side routing works on refresh/deep links:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`
7. Deploy. You'll get a URL like `https://filecraft.onrender.com` — update the
   canonical URLs in `index.html`, `public/sitemap.xml`, `public/robots.txt`,
   and `src/components/SEO.jsx` (the `SITE_URL` constant) to match your real
   domain once you have one.

If you later add a real backend (see "Where a backend would help" below),
deploy that separately as a Render **Web Service** — free web services do
sleep after ~15 minutes idle, so budget for that if you go this route, or
use a low-cost paid instance, or an external uptime pinger.

---

## 3. Get it indexed and ranking on Google

1. **Google Search Console** → add your property → verify (HTML tag or DNS) →
   submit `https://yourdomain.com/sitemap.xml`.
2. Update every placeholder URL (`filecraft.onrender.com`) in this repo to your
   real domain before submitting — search engines index what's actually in
   your meta tags, not what you meant to put there.
3. Each tool page already ships with a unique `<title>`, meta description,
   canonical tag, and `HowTo`/`Article` structured data (see `SEO.jsx` usage
   in each page) — this is what lets Google show rich snippets.
4. The blog posts in `src/pages/blog/` target specific, high-intent search
   phrases ("remove image background free", "extract text from image",
   "create online signature"). Add more posts the same way — one post per
   concrete, narrow search phrase beats one big general post.
5. Backlinks matter more than anything else for ranking. Submitting the site
   to relevant directories, answering questions where it's a genuine fit
   (Reddit, Stack Exchange, Quora), and getting even a few real links in will
   do more than any on-page tweak.
6. Page speed: this site ships almost no JavaScript until a tool is opened
   (the heavy libraries — Tesseract.js, background-removal — are dynamically
   imported inside each tool's own file), so Lighthouse scores should already
   be strong. Re-check with Lighthouse after your first deploy.

---

## 4. Monetize with ads

1. Apply to **Google AdSense** with your live Render URL once real content is
   up (a Privacy Policy and Terms page are already included — both are
   typically required for approval).
2. Once approved, Google gives you a publisher ID (`ca-pub-XXXXXXXXXXXXXXX`)
   and a real `ads.txt` line:
   - Uncomment the AdSense `<script>` tag at the bottom of `index.html` and
     put in your publisher ID.
   - Replace the placeholder line in `public/ads.txt` with your real one.
3. Every page already has one or more `<AdSlot />` placeholders
   (`src/components/AdSlot.jsx`) marking good ad positions. Swap the
   placeholder `<div>` in that one file for a real
   `<ins class="adsbygoogle">` unit — because every page shares this
   component, you only need to wire it up once.
4. Don't place ads inside the tool's actual working area (upload box, canvas,
   textarea) — AdSense policy prohibits ads that could be mistaken for part of
   the tool's controls, and it also just hurts usability.

---

## 4.5. The optional backend (Document Converter only)

Everything above is about the static frontend, which is all you need for
25 of the 26 tools. The **Document Converter** tool is the one exception:
turning an existing Word/PowerPoint/Excel file into another format while
keeping its real layout needs an actual document engine, not just
JavaScript in a browser tab.

That backend lives in `/server` and is entirely optional:

- If you don't deploy it, every other tool on the site still works fine —
  the Document Converter tool just shows a friendly "this isn't switched on"
  message instead of a broken form.
- If you do want it, see **`server/README.md`** for the full walkthrough:
  it's a small Express app that shells out to headless LibreOffice, meant
  to be deployed as a *separate* Render Web Service (Docker environment),
  with the frontend pointed at it via a `VITE_API_BASE_URL` build variable.
- The honest tradeoff: unlike the static frontend, a free Render Web Service
  sleeps after ~15 minutes idle and takes 30–60 seconds to wake up. The
  tool's UI accounts for this (it shows a "waking up the converter…"
  message rather than looking stuck), but if you want this tool always
  instantly responsive, that's what a paid instance is for.

---

## 5. What's real vs. what's a placeholder

**Fully working, no paid API needed:**
- Image format converter (PNG/JPG/WEBP) — plain `<canvas>`
- Image compressor — `<canvas>` resize + quality re-encode
- Background remover — `@imgly/background-removal` (on-device AI model, MIT-licensed, runs client-side)
- OCR / image-to-text — `tesseract.js` (on-device, open source)
- Signature maker — `<canvas>` drawing + auto-trim
- Signature extractor — drag-to-select crop + luminance-threshold background
  removal, works on an uploaded image or a rendered PDF page
- Sign a document — draw or upload a signature, then place it on a PDF
  (via `pdf-lib`) or image (via `<canvas>`) using percentage-based sliders
  for position and size, with a live preview
- Emoji remover — regex-based text utility
- Text summarizer — extractive algorithm (word-frequency scoring), fully client-side
- Text rephraser — synonym-substitution, fully client-side
- Images to PDF — `pdf-lib`, combines photos into one PDF
- Merge PDF / Split PDF — `pdf-lib`, no upload
- PDF to Images — `pdfjs-dist`, renders each page as a PNG
- PDF Text Extractor — `pdfjs-dist`, reads the embedded text layer of a PDF
- Text to Word (.docx) — `docx` library, builds a real Word file from plain text
- Text to PDF — `jspdf`, builds a paginated PDF from plain text
- Text to PowerPoint — `pptxgenjs`, builds a slide deck from an outline (blank line = new slide)
- Images to PowerPoint — `pptxgenjs`, one image per slide
- PDF to PowerPoint — `pdfjs-dist` + `pptxgenjs`, one rendered page per slide
- KDP Print Formatter — `jspdf`, builds a print-ready PDF at an exact KDP trim
  size, with the inside/gutter margin auto-calculated from page count (runs
  the layout twice: once to count pages, once to build the final file with
  the correct margin)
- KDP eBook Formatter — `jszip`, hand-builds a valid EPUB 2.0.1 file
  (container.xml, OPF package, NCX table of contents, one XHTML file per
  chapter) from a plain-text manuscript

**Live data tools (the only ones that aren't fully offline):**
- Currency Converter — calls [Frankfurter](https://frankfurter.app), a free,
  no-API-key exchange rate API. Works immediately, nothing to configure.
- Crypto Converter — calls [CoinGecko](https://www.coingecko.com/en/api)'s
  free public price endpoint. Also no key required, works immediately.
- Stock Price Checker — the one exception among these three. There's no
  reliable, free, no-key, browser-callable stock price API, so this tool
  asks each visitor to paste their own free
  [Twelve Data](https://twelvedata.com/apikey) API key (no credit card,
  800 requests/day). The key is stored in that visitor's own browser
  (`localStorage`) and sent only to Twelve Data's API directly from their
  browser — it never touches your server, because there is no server. If
  you'd rather not ask visitors for a key at all, the honest alternatives
  are: (a) run a small backend proxy that holds one shared key server-side
  (reintroduces the "needs a server" tradeoff discussed above), or (b) drop
  the stock tool and keep just currency + crypto, which need no key at all.

**The one tool with a real backend:** Document Converter is different from
every other tool on this list — it doesn't just call a public API, it needs
your own server (see section 4.5 above and `server/README.md`). Everything
else in this list needs nothing beyond the static frontend.

**Honest limitation:** the summarizer and rephraser are rule-based, not
AI-generated — there's no paid model behind them, by design, since you
mentioned no hosting/API budget yet. They're genuinely useful for a quick
pass, but they won't read like a human editor rewrote the text.

**Also honest:** all the *other* document tools (Images to PDF, Merge/Split
PDF, Text to Word/PDF/PPT, PDF to PowerPoint, etc.) build a new file from
scratch or manipulate an existing PDF — they don't parse an existing
.docx/.pptx's visual layout and re-render it in another format. That's what
the **Document Converter** tool (and its `/server` backend) is specifically
for; the rest stay fast and fully client-side by not attempting it. The
"PDF to PowerPoint" tool, in particular, sidesteps true conversion by
turning each page into a slide image rather than editable text/shapes —
genuinely useful, but worth knowing it's not the same thing as the backend
conversion.

**On the KDP tools specifically:** both build a new, correctly-structured
file from your manuscript's plain text — they don't take an existing,
already-designed Word document and reformat it while preserving custom
fonts, drop caps, or precise image placement. For a text-first manuscript
(most fiction, a lot of nonfiction) that's not something you'll usually
notice; for a heavily designed book (illustrated children's books, complex
textbooks), you'd still want dedicated layout software.

**Where a backend would help further, if you add more budget later:**
- Swap the summarizer/rephraser to call the Claude API for real AI-quality
  output — this needs a small Node/Express endpoint (so your API key isn't
  exposed in the browser), deployed as a separate Render Web Service.
- "Remove emojis from an image" (as opposed to from text) — actually
  detecting emoji *stickers* pasted onto a photo isn't something a regex or a
  light client-side model can do reliably; it would need a proper object-detection
  model server-side. The current Emoji Remover tool works on text, which
  covers the common real-world case (captions, chat exports, comments).

---

## 6. Project structure

```
src/
  components/   Navbar, ToolStrip, Footer, Layout, SEO, AdSlot, ToolCard
  lib/          summarizer.js, synonyms.js, emojiRegex.js, manuscript.js,
                epubBuilder.js, pdfjs.js, sanitizeForPdf.js, importText.js,
                currencies.js, cryptoCoins.js, config.js
  pages/        Home, About, Contact, Privacy, Terms, NotFound
  pages/blog/   BlogIndex + 5 SEO-targeted guides
  pages/tools/  the 26 tool pages
public/
  robots.txt, sitemap.xml, ads.txt, favicon.svg
server/         optional backend for Document Converter — see server/README.md
```

Add a new tool by creating a file in `src/pages/tools/`, adding a `<Route>`
in `App.jsx`, a `<ToolCard>` entry in `Home.jsx`, a link in `ToolStrip.jsx`
(so it shows up in the horizontal nav on every page), and a URL in
`public/sitemap.xml`.
