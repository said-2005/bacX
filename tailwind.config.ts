import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#050505",
                surface: "#0A0A0A",
                "surface-highlight": "#121212",
                border: "#1F1F1F",
                primary: "#2997FF",
                "primary-glow": "rgba(41, 151, 255, 0.15)",
                "text-main": "#EDEDED",
                "text-muted": "#A1A1AA",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "var(--font-tajawal)", "sans-serif"],
                tajawal: ["var(--font-tajawal)", "sans-serif"],
                inter: ["var(--font-inter)", "sans-serif"],
            },
            animation: {
                shimmer: "shimmer 2s linear infinite",
            },
            keyframes: {
                shimmer: {
                    from: {
                        backgroundPosition: "0 0",
                    },
                    to: {
                        backgroundPosition: "-200% 0",
                    },
                },
            },
        },
    },
    plugins: [],
};

export default config;
