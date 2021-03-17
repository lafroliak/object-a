const path = require('path');

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    // 'airbnb-typescript',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    // "plugin:jsx-a11y/recommended",
    'prettier',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  plugins: ['prettier', '@typescript-eslint', 'jest', 'react', 'simple-import-sort', 'unused-imports'],
  env: {
    es6: true,
    browser: true,
    jest: true,
  },
  rules: {
    'jsx-a11y': 0,
    'import/prefer-default-export': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/no-cycle': 'off',
    'no-multi-assign': 'off',
    'no-underscore-dangle': 'off',
    'import/imports-first': ['error', 'absolute-first'],
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    ],
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
      },
    ],
    semi: ['error', 'never'],
    // https://github.com/benmosher/eslint-plugin-import/issues/1341
    'import/named': 0,
    'import/no-unresolved': 0,
    'import/namespace': 0,
    'import/no-duplicates': 0,
    'import/default': 0,
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'react/prop-types': 0,
    '@typescript-eslint/no-unused-vars': [
      'error',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
    'unused-imports/no-unused-imports-ts': 'error',
    'unused-imports/no-unused-vars-ts': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
    'sort-imports': 'off',
    'import/order': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.js', '.jsx', '.ts', '.tsx'],
    },
    react: {
      version: 'detect',
    },
    'import/resolver': {},
  },
  parserOptions: {
    // Allows for the parsing of modern ECMAScript features
    ecmaVersion: 2020,
    // Allows for the use of imports
    sourceType: 'module',
    // https://blog.geographer.fr/eslint-parser-services, https://www.robertcooper.me/using-eslint-and-prettier-in-a-typescript-project
    project: ['./tsconfig.json'],
  },
}
