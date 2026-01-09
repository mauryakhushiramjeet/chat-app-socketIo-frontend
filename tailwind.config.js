/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    fontFamily: {
      ibm: ["IBM Plex Sans", "sans-serif"],
      metro: ["Metrophobic", "sans-serif"],
      nunito: ["Nunito", "sans-serif"],
    },
  },
  plugins: [],
};
