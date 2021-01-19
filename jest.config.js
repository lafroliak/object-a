module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@layouts/(.*)$': '<rootDir>/src/layouts/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@typings/(.*)$': '<rootDir>/src/typings/$1',
  },
  coveragePathIgnorePatterns: ['/node_modules/'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
      babelConfig: true,
      diagnostics: false,
    },
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testMatch: ['**/*.(test|spec).(js|jsx|ts|tsx)'],
}
