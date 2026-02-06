const { url } = require("node:inspector");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      content: {
        empty: "''",
      },
    },
    fontFamily: {
      ibm: ["IBM Plex Sans", "sans-serif"],
      metro: ["Metrophobic", "sans-serif"],
      nunito: ["Nunito", "sans-serif"],
    },
    screens: {
      "3xl": "1660px",
      "2xl": "1536px",
      xl: "1280px",
      lg: "1024px",
      md: "768px",
      sm: "640px",
      xs: "425px",
    },
    backgroundImage: {
      chatImg: "url('./assets/chat-back.png')",
      chatImgForm: "url('./assets/chat-form-back.png')",
    },
  },
  plugins: [],
};
