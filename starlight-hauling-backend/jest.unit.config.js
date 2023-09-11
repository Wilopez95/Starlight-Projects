process.env.TZ = 'America/Denver';

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
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testMatch: ['**/*.unit.spec.js'],
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  transformIgnorePatterns: ['node_modules'],
  verbose: true,
  testTimeout: 10000,
};
