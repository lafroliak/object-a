const { fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  purge: {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
  },
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    colors: {
      ...colors,
      color: {
        50: colors.blueGray['50'],
        100: colors.blueGray['100'],
        200: colors.blueGray['200'],
        300: colors.blueGray['300'],
        400: colors.blueGray['400'],
        500: colors.blueGray['500'],
        600: colors.blueGray['600'],
        700: colors.blueGray['700'],
        800: colors.blueGray['800'],
        900: colors.blueGray['900'],
      },
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
      fontWeight: {
        base: 499,
        dark: 472,
        hover: 521,
      },
      height: {
        '1px': '1px',
      },
      screens: {
        sm: { max: '767px' },
      },
      zIndex: {
        '-1': '-1',
      },
    },
  },
  variants: {
    extend: {
      fontWeight: ['dark', 'hover'],
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
}
