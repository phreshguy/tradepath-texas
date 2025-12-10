import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F8FAFC", // Slate 50
                foreground: "#0F172A", // Slate 900
                primary: "#F59E0B", // Safety Orange (Amber 500)
                secondary: "#64748B", // Steel (Slate 500)
                success: "#10B981", // ROI Green (Emerald 500)
                navy: {
                    900: "#0F172A", // Slate 900
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;
