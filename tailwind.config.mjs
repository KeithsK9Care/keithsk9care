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
        // Brand teal — sampled directly from logo wordmark (Designer.png)
        teal: {
          50:  '#eef5f8',
          100: '#d6eaf0',
          200: '#a8d2dd',
          300: '#6db4c7',
          400: '#2f93ad',
          500: '#007090',  // wordmark — brand anchor
          600: '#005c79',
          700: '#004862',
          800: '#01374c',
          900: '#022836',
        },
        // Brand coral/orange — sampled directly from logo paw print (Designer.png)
        coral: {
          50:  '#fef4ee',
          100: '#fce0cd',
          200: '#fac0a0',
          300: '#f99670',
          400: '#fa7838',
          500: '#f86018',  // logo paw — brand anchor
          600: '#dd4d0a',
          700: '#b13d0c',
          800: '#883110',
          900: '#6b2811',
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
