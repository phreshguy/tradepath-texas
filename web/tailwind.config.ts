import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                industrial: { 900: '#0F172A', 100: '#F1F5F9' },
                safety: { 500: '#F59E0B', 600: '#D97706' },
                success: { 500: '#10B981' }
            },
            fontFamily: { sans: ['Inter', 'sans-serif'] }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;
