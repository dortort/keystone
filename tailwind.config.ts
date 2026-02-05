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
        },
      },
    },
  },
  plugins: [],
}

export default config
