/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Your other theme extensions
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1280px', // Changed from default 1024px to 1280px
      'xl': '1536px',
      '2xl': '1920px',
    },
  },
  plugins: [],
}