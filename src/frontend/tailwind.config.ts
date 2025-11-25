import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // HallyuLatino 브랜드 컬러
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // 한류 테마 컬러
        hallyu: {
          pink: '#FF6B9D',
          purple: '#9B59B6',
          blue: '#3498DB',
          teal: '#1ABC9C',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        korean: ['var(--font-noto-sans-kr)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
