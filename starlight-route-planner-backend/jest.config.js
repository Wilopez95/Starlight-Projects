export default {
  verbose: false,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['tests', 'consts'],
  moduleDirectories: [
    './',
    './consts/',
    './db/',
    './errors/',
    './middlewares/',
    './models/',
    './node_modules/',
    './routes/',
    './schema/',
    './scripts/',
    './services/',
    './tests/',
    './utils/',
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testRegex:
    '/tests/e2e/.*(\\.|/)(test|spec)\\.[jt]sx?$|/tests/unit/.*(\\.|/)(test|spec)\\.[jt]sx?$',
  transform: { '^.+\\.js$': 'babel-jest' },
  transformIgnorePatterns: ['node_modules'],
};
