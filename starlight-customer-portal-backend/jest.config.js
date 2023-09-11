export default {
  verbose: true,
  collectCoverageFrom: [
    'routes/**/*.{js,ts}',
    '!routes/**/?(*.)schema.{js,ts}',
    '!routes/**/?(*.)index.{js,ts}',
  ],
  coverageReporters: ['json-summary'],
  coverageThreshold: {
    global: {
      statements: 98,
      branches: 91,
      functions: 98,
      lines: 98,
    },
  },
  moduleDirectories: [
    './',
    './consts/',
    './errors/',
    './middlewares/',
    './node_modules/',
    './routes/',
    './schema/',
    './services/',
    './tests/',
    './utils/',
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testRegex: '/tests/e2e/.*(\\.|/)(test|spec)\\.[jt]sx?$|/routes/.*(\\.|/)(test|spec)\\.[jt]sx?$',
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  transformIgnorePatterns: ['node_modules'],
};
