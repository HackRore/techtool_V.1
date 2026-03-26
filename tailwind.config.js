/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-heading)', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-code)', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: { DEFAULT: '#2563EB', dark: '#1D4ED8', light: '#EFF6FF' },
      },
    },
  },
  plugins: [],
}
