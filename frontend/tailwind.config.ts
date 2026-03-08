/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8B5CF6",
          light: "#A78BFA",
          dark: "#7C3AED",
        },
        secondary: {
          DEFAULT: "#FB923C",
          light: "#FDBA74",
          dark: "#F97316",
        },
        accent: {
          DEFAULT: "#38BDF8",
          light: "#7DD3FC",
          dark: "#0EA5E9",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        brand: {
          violet: "#8B5CF6",
          mango: "#FB923C",
          blue: "#38BDF8",
          success: "#10B981",
        },
        app: {
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          card: "var(--color-card)",
          text: "var(--color-text)",
          muted: "var(--color-muted)",
          border: "var(--color-border)",
        },
      },
    },
  },
  plugins: [],
};
