/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF5B5B",
          foreground: "#FFFFFF", // Helpful for text on top of primary background
          dark: "#E04F4F", // A slightly darker shade for hover states
        },
      },
    },
  },
  plugins: [],
};
