import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        background: "#080608",
        surface: "#0f0b0e",
        "surface-2": "#140e12",
        "surface-3": "#1a1018",
        border: "#261820",
        "border-subtle": "#180e16",

        // Accents — rose palette (Document 2)
        rose: {
          DEFAULT: "#C4857A",
          light: "#D4998E",
          dark: "#8B6355",
          dim: "rgba(196,133,122,0.12)",
        },

        // Legacy alias (keeps old classnames working)
        terracotta: {
          DEFAULT: "#C4857A",
          light: "#D4998E",
          dark: "#8B6355",
        },
        gold: {
          DEFAULT: "#C4857A",
          light: "#D4998E",
          dark: "#8B6355",
        },

        // Text
        "text-primary": "#FFF8F5",
        "text-secondary": "#8B6355",
        "text-muted": "#4a3030",

        // Status
        success: "#4A9B6F",
        warning: "#C9A96E",
        error: "#C94040",
      },

      fontFamily: {
        sans: ["Heebo", "system-ui", "sans-serif"],
        display: ["Heebo", "system-ui", "sans-serif"],
      },

      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "display-md": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.25" }],
      },

      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "sidebar": "280px",
      },

      borderRadius: {
        "4xl": "2rem",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-gold": "linear-gradient(135deg, #C9A96E 0%, #C9A581 50%, #A88850 100%)",
        "gradient-surface": "linear-gradient(180deg, #111111 0%, #0A0A0A 100%)",
        "noise": "url('/images/noise.png')",
      },

      animation: {
        "fade-in": "fadeIn 240ms ease-out",
        "fade-up": "fadeUp 240ms ease-out",
        "scale-in": "scaleIn 200ms ease-out",
        "slide-in-right": "slideInRight 240ms ease-out",
        "slide-in-left": "slideInLeft 240ms ease-out",
        "breathe": "breathe 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
      },

      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
        "240": "240ms",
      },

      backdropBlur: {
        "xs": "4px",
      },

      boxShadow: {
        "glow-gold": "0 0 32px rgba(201, 169, 110, 0.15)",
        "glow-terracotta": "0 0 32px rgba(201, 165, 129, 0.15)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.6)",
        "sidebar": "-8px 0 40px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};

export default config;
