/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Tajawal', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f0f7ff',
          100: '#e0effe',
          200: '#baddfd',
          300: '#7ec0fb',
          400: '#399cf6',
          500: '#0f7de8',
          600: '#035dc6',
          700: '#0449a1',
          800: '#083e85',
          900: '#0c356e',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0a',
        }
      }
    },
  },
  plugins: [],
}
