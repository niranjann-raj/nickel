const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ['Poppins', 'sans-serif'],
                body: ['Work Sans', 'sans-serif'],
                space: ['"Space Grotesk"', 'sans-serif'],
            },
            spacing: { base: '1rem' },
            borderRadius: {
                small: '12px',
                large: '24px',
            },
            boxShadow: {
                custom: '0px 8px 32px rgba(99, 102, 241, 0.15)',
                'custom-hover': '0px 20px 60px rgba(99, 102, 241, 0.25)',
                'glow': '0 0 40px -10px rgba(139, 92, 246, 0.5)',
                'fintech': '0px 4px 24px -1px rgba(0, 0, 0, 0.5), inset 0px 1px 0px rgba(255, 255, 255, 0.1)',
                'fintech-hover': '0px 8px 32px -4px rgba(0, 0, 0, 0.6), inset 0px 1px 0px rgba(255, 255, 255, 0.15)',
                'accent-glow': '0px 0px 24px rgba(245, 158, 11, 0.3)',
            },
            colors: {
                gray: {
                    ...colors.neutral,
                    800: '#121214',
                    900: '#09090b',
                    950: '#000000',
                },
                brand: {
                    blue: '#3B82F6',
                    purple: '#8B5CF6',
                    teal: '#14B8A6',
                    indigo: '#6366F1',
                    pink: '#EC4899',
                    accent: '#F59E0B', // Warm amber accent
                    dark: '#050505',
                }
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 3s infinite',
                'float-fast': 'float 4s ease-in-out infinite',
                'pulse-slow': 'pulse 4s ease-in-out infinite',
                'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'fade-in': 'fadeIn 1s ease-out forwards',
                'bounce-soft': 'bounceSoft 2s infinite',
                'spin-slow': 'spin 12s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                bounceSoft: {
                    '0%, 100%': { transform: 'translateY(-5%)' },
                    '50%': { transform: 'translateY(0)' },
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(40px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                }
            }
        }
    },
    plugins: [],
}
