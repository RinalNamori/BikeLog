/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent:   '#e94560',
        bg:       '#1a1a2e',
        surface:  '#16213e',
        surfaceV: '#1e2a45',
        border:   '#2a3a55',
        muted:    '#8899aa',
        on:       '#e8e8e8',
        ok:       '#4caf50',
        warn:     '#ff9800',
        danger:   '#f44336',
        info:     '#2196f3',
      },
    },
  },
  plugins: [],
}
