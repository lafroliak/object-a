const { fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  purge: {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      ...colors,
      gray: colors.blueGray,
    },
    screens: {
      xs: { max: '639px' },
      // sm: { min: '640px' },
      sm: { max: '767px' },
      md: { min: '768px' },
      lg: { min: '1024px' },
      xl: { min: '1280px' },
      // sm: { min: '640px', max: '767px' },
      // md: { min: '768px', max: '1023px' },
      // lg: { min: '1024px', max: '1279px' },
      // xl: { min: '1280px', max: '1535px' },
      '2xl': { min: '1536px' },
    },
    extend: {
      cursor: {
        grab: 'grab',
        grabbing: 'grabbing',
      },
      fontFamily: {
        'jet-brain-mono': [
          'JetBrains Mono Variables',
          'JetBrains Mono',
          ...fontFamily.mono,
        ],
        'jet-brain-static': ['JetBrains Mono', ...fontFamily.mono],
      },
      height: {
        '1px': '1px',
      },
      zIndex: {
        '-1': '-1',
      },
    },
  },
  variants: {},
  plugins: [require('@tailwindcss/aspect-ratio')],
}
