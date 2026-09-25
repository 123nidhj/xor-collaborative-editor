/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#050505',
          900: '#0a0a0a',
          850: '#111111',
          800: '#171717',
          700: '#262626',
          600: '#404040',
        },
        brand: {
          cyan: '#06b6d4',
          indigo: '#6366f1',
          purple: '#a855f7',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -4px rgba(6, 182, 212, 0.45)',
        'glow-indigo': '0 0 30px -5px rgba(99, 102, 241, 0.45)',
        'glow-card': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 20px 40px -15px rgba(0, 0, 0, 0.8)',
        'glow-pill': '0 0 15px -2px rgba(6, 182, 212, 0.3)',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
        'linear-grid': "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-flow': 'waveFlow 8s ease-in-out infinite alternate',
      },
      keyframes: {
        waveFlow: {
          '0%': { transform: 'scale(1) translateY(0px)' },
          '100%': { transform: 'scale(1.02) translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
