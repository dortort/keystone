import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#ffffff',
          dark: '#1e1e2e',
        },
        panel: {
          DEFAULT: '#f8f9fa',
          dark: '#181825',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          light: '#e0e7ff',
          muted: '#818cf8',
        },
        muted: {
          DEFAULT: '#6b7280',
          foreground: '#9ca3af',
        },
      },
      keyframes: {
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'slide-in-from-right': 'slide-in-from-right 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
