/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      colors: {
        // Brand teal — sampled from logo wordmark & business card banner
        teal: {
          50:  '#ebf8fb',
          100: '#cdebf2',
          200: '#9bd6e4',
          300: '#5cbed1',
          400: '#2ea7bf',
          500: '#1899b5',  // wordmark
          600: '#067e98',
          700: '#08667a',
          800: '#0c5060',
          900: '#0c3e4b',
        },
        // Brand coral — sampled from logo paw print & business card accents
        coral: {
          50:  '#fef3ee',
          100: '#fde0d0',
          200: '#fabea0',
          300: '#f69566',
          400: '#f37334',
          500: '#f26522',  // logo paw / business card accents
          600: '#d44e10',
          700: '#ae3c0e',
          800: '#8a3210',
          900: '#702b11',
        },
        // Warm neutrals to feel "home salon" not "clinic"
        ink: {
          50: '#f8f6f3',
          100: '#efeae3',
          200: '#ddd3c5',
          300: '#c4b59f',
          400: '#a89679',
          500: '#8c7a5d',
          600: '#6f614a',
          700: '#564a38',
          800: '#3e3528',
          900: '#26201a',
          950: '#16120e',
        },
        whatsapp: '#25d366',
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
