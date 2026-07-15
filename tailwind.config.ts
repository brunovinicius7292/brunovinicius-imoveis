import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1F3B",
          50: "#EEF2F7",
          100: "#D6E0EC",
          200: "#AFC3DA",
          300: "#82A0C0",
          400: "#4E76A0",
          500: "#2A5680",
          600: "#1B3D63",
          700: "#132E4C",
          800: "#0B1F3B",
          900: "#071429",
        },
        gold: {
          DEFAULT: "#C9A24B",
          50: "#FBF6E9",
          100: "#F5E9C8",
          200: "#EBD494",
          300: "#DEBE68",
          400: "#C9A24B",
          500: "#AD8735",
          600: "#8C6C29",
          700: "#6B521F",
        },
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
