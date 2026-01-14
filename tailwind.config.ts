import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './entities/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // 🎨 Custom Premium Colors
        warmth: {
          50: 'var(--color-warmth-50)',
          100: 'var(--color-warmth-100)',
          200: 'var(--color-warmth-200)',
          300: 'var(--color-warmth-300)',
          400: 'var(--color-warmth-400)',
          500: 'var(--color-warmth-500)',
          600: 'var(--color-warmth-600)',
          700: 'var(--color-warmth-700)',
          800: 'var(--color-warmth-800)',
          900: 'var(--color-warmth-900)',
        },
        wisdom: {
          50: 'var(--color-wisdom-50)',
          100: 'var(--color-wisdom-100)',
          200: 'var(--color-wisdom-200)',
          300: 'var(--color-wisdom-300)',
          400: 'var(--color-wisdom-400)',
          500: 'var(--color-wisdom-500)',
          600: 'var(--color-wisdom-600)',
          700: 'var(--color-wisdom-700)',
          800: 'var(--color-wisdom-800)',
          900: 'var(--color-wisdom-900)',
        },
        growth: {
          50: 'var(--color-growth-50)',
          100: 'var(--color-growth-100)',
          500: 'var(--color-growth-500)',
          600: 'var(--color-growth-600)',
          700: 'var(--color-growth-700)',
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      keyframes: {
        // 💫 Fade & Slide
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // ✨ Scale
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scale-out': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
        // 🎭 Bounce
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // 💫 Shimmer
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        // 🌟 Pulse Glow
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(249, 115, 22, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(249, 115, 22, 0)' },
        },
        // 🎪 Slide
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'scale-out': 'scale-out 0.3s ease-in',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        shimmer: 'shimmer 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
