export default {
  collectCoverageFrom: [
    '**/db/dbManagerFramework/connection.js',
    '**/db/dbManagerFramework/**/*.js',
    '**/errors/*.js',
    '**/middlewares/**/*.js',
    '**/scripts/**/*.js',
    '**/utils/**/*.js',
    '**/services/**/*.js',
    '**/repos/**/*.js',
    '**/routes/**/*.js',
    '!**/tests/**/*.js',
    '!**/repos/**/*Query.js',
    '!**/routes/**/*.schema.js',
    '!**/routes/**/*.index.js',
  ],
  coverageReporters: ['html'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  moduleFileExtensions: ['js', 'json', 'node'],
  setupFiles: ['<rootDir>/tests/e2e/shim.js'],
  testMatch: ['**/routes/v1/**/*.subs.e2e.spec.js'],
  transform: { '^.+\\.js$': 'babel-jest' },
  transformIgnorePatterns: ['node_modules'],
  verbose: true,
  testTimeout: 3000,
};
