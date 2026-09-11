/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gemini: {
          50: '#f8fafd',
          100: '#f0f4f9',
          200: '#e3e8ee',
          300: '#c2e7ff',
          400: '#7cacf8',
          500: '#1a73e8',
          600: '#0b57d0',
          700: '#0842a0',
          800: '#042b6a',
          900: '#02183b',
        },
        civic: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a9f6',
          500: '#0b57d0',
          600: '#0842a0',
          700: '#042b6a',
          800: '#074b81',
          900: '#0c3f6c',
          950: '#072746',
        },
        neutral: {
          surface: '#f8fafd',
          card: '#ffffff',
          input: '#f0f4f9',
          border: '#e3e8ee',
          borderLight: '#edf2f7',
          dark: '#1f1f1f',
          secondary: '#444746',
          muted: '#747775',
        }
      },
      fontFamily: {
        sans: ['"Google Sans"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'gemini-card': '0 1px 3px 0 rgba(60, 64, 67, 0.08), 0 4px 8px 3px rgba(60, 64, 67, 0.04)',
        'gemini-elevated': '0 4px 12px 0 rgba(60, 64, 67, 0.12), 0 8px 24px 4px rgba(60, 64, 67, 0.06)',
        'gemini-pill': '0 2px 6px 0 rgba(60, 64, 67, 0.10)',
        'gemini-focus': '0 0 0 3px rgba(26, 115, 232, 0.18)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
