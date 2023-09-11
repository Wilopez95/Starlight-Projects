export default {
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testMatch: ['**/tests/unit/**/*.spec.js'],
  transform: { '^.+\\.js$': 'babel-jest' },
  transformIgnorePatterns: ['node_modules'],
  verbose: false,
  testTimeout: 10000,
  collectCoverage: false,
  coveragePathIgnorePatterns: ['tests', 'consts'],
};
