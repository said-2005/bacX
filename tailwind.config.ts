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
                background: "var(--background)",
                foreground: "var(--foreground)",
                surface: "var(--card)",
                "surface-highlight": "var(--accent)",
                border: "var(--border)",
                primary: "var(--primary)",
                "primary-glow": "rgba(41, 151, 255, 0.15)",
                "text-main": "var(--foreground)",
                "text-muted": "var(--muted-foreground)",
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
