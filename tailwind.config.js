/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Sans', 'sans-serif'],
        'serif': ['Merriweather', 'serif'],
        'mono': ['Fira Code', 'monospace'],
      },
      colors: {
        'primary': '#5D473A',
        'secondary': '#91705D',
        'accent': '#E3D2BF',
        'royal': '#ffcf40',
        'greenroyal': '#033f53',
        'dark': '#D9C5B2',
        'light': '#B38363',
        'error': '#FF6B6B',
        'success': '#4CAF50',
        'warning': '#FF9800',
        'info': '#2196F3',
        'neutral': '#AFA69A',
        'transparent': 'transparent',
        'white': '#FFFFFF',
        'black': '#000000', 
      },
    },
  },
  plugins: [],
};
