import { type Config } from "tailwindcss"

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {colors: {
      background: "rgb(var(--background) / <alpha-value>)",
      foreground: "rgb(var(--foreground) / <alpha-value>)",
      primary: "rgb(var(--primary) / <alpha-value>)",
      "primary-foreground": "rgb(var(--primary-foreground) / <alpha-value>)",
      secondary: "rgb(var(--secondary) / <alpha-value>)",
      "secondary-foreground": "rgb(var(--secondary-foreground) / <alpha-value>)",
      accent: "rgb(var(--accent) / <alpha-value>)",
      "accent-foreground": "rgb(var(--accent-foreground) / <alpha-value>)",
    }},
  },
  plugins: [],
}

export default config
