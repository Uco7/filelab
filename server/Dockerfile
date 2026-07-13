FROM node:20-slim

# System deps:
# - libreoffice: the conversion engine itself
# - poppler-utils: pdftoppm / pdftotext (used for pdf -> pptx and pdf -> csv/xlsx paths)
# - python3/pip: runs pdf2docx and python-pptx
# - fonts-liberation: metric-compatible substitutes for Arial/Times/Calibri so
#   converted documents don't reflow badly when the exact MS fonts aren't licensed on the server
RUN apt-get update && apt-get install -y --no-install-recommends \
      libreoffice \
      poppler-utils \
      python3 \
      python3-pip \
      fonts-liberation \
      fontconfig \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir --break-system-packages pdf2docx python-pptx Pillow

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Render sets PORT itself; the app already reads process.env.PORT
EXPOSE 8080

CMD ["node", "index.js"]