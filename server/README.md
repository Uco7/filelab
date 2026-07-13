# FileCraft conversion server (optional backend)

This is the one piece of FileCraft that genuinely needs a server: converting
an *existing* Word, PowerPoint, Excel, or PDF file into another one of those
formats while keeping its real layout. That requires an actual
office-document engine — this server runs headless LibreOffice to do it,
the same underlying approach services like Gotenberg use.

Everything else in the main FileCraft site stays a free, static frontend.
This backend is only used by the **Document Converter** tool.

## Running it locally

You need LibreOffice installed locally (`soffice` on your PATH), or just
use Docker:

```bash
docker build -t filecraft-server .
docker run -p 8080:8080 filecraft-server
```

Test it:

```bash
curl -F "file=@test.docx" -F "format=pdf" http://localhost:8080/convert -o test.pdf
```

## Deploying to Render

1. Push this repo to GitHub (the `server/` folder can live right alongside
   the frontend — they deploy as two separate Render services).
2. In Render: **New → Web Service**.
3. Point it at this repo, set the **root directory** to `server`.
4. Render will detect the `Dockerfile` automatically — choose the **Docker**
   environment (not Node) so LibreOffice actually gets installed.
5. Set an environment variable `ALLOWED_ORIGIN` to your frontend's URL
   (e.g. `https://filecraft.onrender.com`) so the API only accepts requests
   from your own site.
6. Deploy. You'll get a URL like `https://filecraft-server.onrender.com`.
7. Back in the **frontend's** Render settings (the static site), add a build
   environment variable `VITE_API_BASE_URL` set to that backend URL, and
   redeploy the frontend so the Document Converter tool knows where to send
   files.

## The honest tradeoff

Free Render Web Services sleep after ~15 minutes of inactivity and take
30–60 seconds to wake back up (LibreOffice's own startup adds a few seconds
on top of that). That's very different from the static frontend, which
never sleeps. Your options:

- **Leave it on the free tier.** Fine for a tool that isn't hit constantly —
  visitors just see a slightly slow first conversion after idle periods. The
  Document Converter tool's UI accounts for this and shows a "waking up the
  converter…" message rather than looking broken.
- **Upgrade to a paid Render instance** (~$7/month at the time of writing)
  once the traffic or the ad revenue justifies it, for an always-warm
  backend.
- **Use an external uptime pinger** to hit `/health` every few minutes and
  keep it warm — free, but worth checking Render's terms before relying on
  it long-term, and it doesn't reduce compute cost, just shifts when it's
  spent.

## Supported conversions

Anything LibreOffice can open and export, which covers the common cases:
`docx`, `doc`, `odt`, `rtf`, `txt`, `pptx`, `ppt`, `odp`, `xlsx`, `xls`,
`ods`, `csv`, and `pdf` — in any direction between them. Very complex
layouts (heavy custom fonts, embedded macros, unusual template features)
may not come through pixel-perfect; LibreOffice's conversion is very good,
not infallible.
