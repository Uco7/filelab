// Centralizes pdfjs-dist setup so every tool that reads PDFs configures
// the worker the same way. The `?url` suffix tells Vite to give us the
// final built URL of the worker file instead of trying to execute it,
// which is the reliable way to wire up the pdfjs worker in a Vite app.
let pdfjsLibPromise = null

export async function loadPdfJs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    ]).then(([pdfjsLib, workerUrlModule]) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrlModule.default
      return pdfjsLib
    })
  }
  return pdfjsLibPromise
}
