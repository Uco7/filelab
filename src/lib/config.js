// The Document Converter tool is the only feature that talks to a backend.
// If VITE_API_BASE_URL isn't set at build time, the tool shows a friendly
// "not configured" message instead of a confusing network error — see
// server/README.md for how to deploy the backend and wire this up.
// export const API_BASE_URL_1 = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
// export const API_BASE_URL =  'https://filelab-server.onrender.com'

export const API_BASE_URL = 'https://filelab-server.onrender.com'