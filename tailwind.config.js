/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',   // ✅ enables dark mode via class on <html>
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}