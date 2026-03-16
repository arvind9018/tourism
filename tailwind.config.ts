import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F3D2E",     // 60%
        secondary: "#F4EFEA",   // 30%
        accent: "#E76F51",      // 10%
      },
    },
  },
  plugins: [],
}
export default config
