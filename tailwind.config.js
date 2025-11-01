/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,html}"],
  darkMode: "media",
  prefix: "plasmo-",
  theme: {
    extend: {
      colors: {
        background: 'oklch(0.12 0.02 120)',
        foreground: 'oklch(0.96 0.005 120)',
        card: 'oklch(0.16 0.02 120)',
        "card-foreground": 'oklch(0.96 0.005 120)',
        popover: 'oklch(0.16 0.02 120)',
        "popover-foreground": 'oklch(0.96 0.005 120)',
        primary: 'oklch(0.55 0.08 115)',
        "primary-foreground": 'oklch(0.12 0.02 120)',
        secondary: 'oklch(0.22 0.02 120)',
        "secondary-foreground": 'oklch(0.96 0.005 120)',
        muted: 'oklch(0.2 0.02 120)',
        "muted-foreground": 'oklch(0.65 0.02 120)',
        accent: 'oklch(0.6 0.1 115)',
        "accent-foreground": 'oklch(0.12 0.02 120)',
        destructive: 'oklch(0.5 0.2 27.325)',
        "destructive-foreground": 'oklch(0.96 0.005 120)',
        border: 'oklch(0.22 0.02 120)',
        input: 'oklch(0.22 0.02 120)',
        ring: 'oklch(0.55 0.08 115)',
      },
      borderRadius: {
        lg: "0.875rem",
        md: "calc(0.875rem - 2px)",
        sm: "calc(0.875rem - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "Geist", "Geist Fallback"],
        mono: ["Geist Mono", "Geist Mono Fallback"],
      },
    },
  },
};