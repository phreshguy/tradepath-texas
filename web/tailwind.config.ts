import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./utils/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // The Critical Brand Palette
                industrial: {
                    900: '#0F172A', // Navy (Headers/Nav) - THIS WAS MISSING
                    800: '#1E293B', // Card BG
                    700: '#334155', // Borders
                    100: '#F1F5F9', // Page BG
                    50: '#F8FAFC',
                },
                safety: {
                    500: '#F59E0B', // Orange (Buttons)
                    600: '#D97706',
                },
                success: {
                    500: '#10B981', // Green
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: 'none', // Prevents the blog from being too skinny
                    },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;
