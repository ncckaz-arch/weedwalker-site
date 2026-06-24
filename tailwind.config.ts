import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        walkerBlack: '#050505',
        walkerPanel: '#11110f',
        walkerYellow: '#ffd21a',
        walkerMuted: '#a4a49b'
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 50px rgba(255, 210, 26, 0.18)'
      }
    }
  },
  plugins: []
};

export default config;
