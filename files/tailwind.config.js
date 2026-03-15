/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#050505', 1: '#0a0a0a', 2: '#111111',
          3: '#1a1a1a', 4: '#242424', 5: '#2e2e2e',
        },
        amber: { dim: '#92400e', mid: '#d97706', bright: '#f59e0b', glow: '#fcd34d' },
        signal: { green: '#10b981', red: '#ef4444', blue: '#3b82f6', cyan: '#06b6d4' },
      },
      fontFamily: {
        mono:    ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-display)', 'sans-serif'],
        sans:    ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-amber': 'pulseAmber 2s ease-in-out infinite',
        'scan-line':   'scanLine 3s linear infinite',
        'fade-in-up':  'fadeInUp 0.4s ease-out both',
      },
      keyframes: {
        pulseAmber: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
        scanLine:   { '0%': { top: '0%' }, '100%': { top: '100%' } },
        fadeInUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
