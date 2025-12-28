import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.5s ease-in-out",
      },
    },
  },
  plugins: [
    typography,
    function ({ addVariant }) {
      addVariant('swiper-active', '.swiper-slide-active &');
    },
  ],
};

export default config;