/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        board: {
          DEFAULT: '#20262E',
          light: '#2A313B',
          dark: '#171B21'
        },
        paper: '#F6F3EC',
        amber: {
          DEFAULT: '#F2A93B',
          dark: '#D98D1F'
        },
        mint: {
          DEFAULT: '#57C7A6',
          dark: '#3AA687'
        },
        ink: '#1B1F23'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      backgroundImage: {
        pegboard:
          'radial-gradient(circle, rgba(246,243,236,0.08) 1.5px, transparent 1.5px)'
      },
      backgroundSize: {
        pegboard: '28px 28px'
      }
    }
  },
  plugins: []
}
