import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                // THE RESTORED PALETTE
                industrial: {
                    900: '#0F172A', // Hero & Header Background
                    800: '#1E293B', // Dark Borders & Footer
                    700: '#334155', // Subtext
                    600: '#475569', // Muted Text
                    500: '#64748B', // Icons
                    200: '#E2E8F0', // Light Borders
                    100: '#F1F5F9', // Page Background
                    50: '#F8FAFC',  // Card Backgrounds
                },
                safety: {
                    500: '#F59E0B', // Primary Orange Buttons
                    600: '#D97706', // Button Hover
                },
                success: {
                    500: '#10B981', // ROI Green
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: '100ch', // Optimize reading width
                    },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'), // Keeps the blog working
    ],
};
export default config;
