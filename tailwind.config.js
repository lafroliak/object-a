const { fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
  },
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    colors: {
      ...colors,
      color: {
        50: colors.white,
        100: colors.trueGray['50'],
        200: colors.trueGray['100'],
        300: colors.trueGray['200'],
        400: colors.trueGray['400'],
        500: colors.trueGray['500'],
        600: colors.trueGray['600'],
        700: colors.trueGray['700'],
        800: colors.trueGray['800'],
        900: colors.trueGray['900'],
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
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}
