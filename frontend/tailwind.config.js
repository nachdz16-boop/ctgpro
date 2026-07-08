/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#00dc82',
        'primary-dark': '#00b36a',
        'primary-light': '#57f0a9',
      },
    },
  },
  plugins: [],
};