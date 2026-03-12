export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#f43f5e", // Rose-500
          600: "#e11d48", // Rose-600
          700: "#be123c", // Rose-700
          900: "#4c0519", // Rose-900
        },
        dark: {
          bg: "#050505",
          card: "#0f0f0f",
          border: "#1f1f1f",
          accent: "#f43f5e",
        },
      },
    },
  },
  plugins: [],
};
