export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: { 800: '#1a1a2e', 900: '#0f0f1a', 950: '#0a0a12' },
        accent: { DEFAULT: '#e94560', light: '#ff6b81' },
        neon: { green: '#00ff88', blue: '#00d4ff', purple: '#a855f7', pink: '#ec4899' }
      },
      animation: {
        'pulse-ring': 'pulse-ring 1s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(1.05)', opacity: '0.5' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px rgba(233,69,96,0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(233,69,96,0.8), 0 0 40px rgba(233,69,96,0.4)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
