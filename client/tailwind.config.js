/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#081225",
        mist: "#e2ecff",
        brand: "#0f766e",
        accent: "#f97316",
      },
      boxShadow: {
        glow: "0 18px 50px rgba(15, 118, 110, 0.18)",
      },
    },
  },
  plugins: [],
};
