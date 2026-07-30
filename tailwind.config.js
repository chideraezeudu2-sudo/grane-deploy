/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lavender: '#f0d7ff',
        forest: '#2dd4bf',
        ember: '#ffa946',
        'vast-ink': '#050505',
        cream: '#E0D8D0',
        stone: '#1a1a1e',
        fog: '#9e968d',
        charcoal: '#0d0d0f',
      },
      fontFamily: {
        garamond: ['EB Garamond', 'Georgia', 'serif'],
        figtree: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
