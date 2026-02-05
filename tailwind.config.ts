import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rubik: ["var(--font-rubik)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "text-default-tertiary": "#B3B3B3",
        "text-default-secondary": "#757575",
        "light-grey-border": "#F5F5F5",
        "medium-grey-border": "#D9D9D9",
        "dark-blue": "#202D74",
        "light-blue": "#7890CD",
        "bcp-blue": "#234254",
      },
    },
  },
  plugins: [],
};
export default config;
