/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0A0F1A',
        surface: '#111827',
        surface2: '#1A2336',
        line: '#243049',
        text: '#E6EDF7',
        muted: '#8A97B1',
        cyan: '#22D3EE',
        amber: '#FFB020',
        ok: '#34D399',
        danger: '#F87171',
      },
      fontFamily: {
        display: ['SpaceGrotesk-SemiBold', 'SpaceGrotesk-Bold', 'sans-serif'],
        sans: ['Inter-Regular', 'Inter-Medium', 'sans-serif'],
        mono: ['JetBrainsMono-Regular', 'JetBrainsMono-Medium', 'monospace'],
      },
      borderRadius: {
        industrial: '6px',
      },
    },
  },
  plugins: [],
};
