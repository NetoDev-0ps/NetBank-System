/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1E4DA2",
          secondary: "#0F3B98",
          accent: "#2A85D4",
          light: "#57BAF3",
        },
        netdark: {
          100: "#3F536B",
          200: "#064166",
          300: "#082C4D",
          400: "#042566",
          500: "#04162F",
          600: "#0F172A",
        },
        netlight: {
          50: "#F4F9FF",
          100: "#6EACEB",
          200: "#00BCEB",
          300: "#3EADED",
          400: "#3189BD",
          500: "#3586C4",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
