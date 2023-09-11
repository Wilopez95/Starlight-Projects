export default {
  // Modules can be explicitly auto-mocked using jest.mock(moduleName).
  // https://facebook.github.io/jest/docs/en/configuration.html#automock-boolean
  automock: false,

  // Respect Browserify's "browser" field in package.json when resolving modules.
  // https://facebook.github.io/jest/docs/en/configuration.html#browser-boolean
  browser: false,

  // This config option can be used here to have Jest stop running tests after the first failure.
  // https://facebook.github.io/jest/docs/en/configuration.html#bail-boolean
  bail: false,

  // The directory where Jest should store its cached dependency information.
  // https://facebook.github.io/jest/docs/en/configuration.html#cachedirectory-string
  // cacheDirectory: '/tmp/<path>', // [string]

  // Indicates whether the coverage information should be collected while executing the test.
  // Because this retrofits all executed files with coverage collection statements,
  // it may significantly slow down your tests.
  // https://facebook.github.io/jest/docs/en/configuration.html#collectcoverage-boolean
  collectCoverage: true,

  // https://facebook.github.io/jest/docs/en/configuration.html#collectcoveragefrom-array
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/migrations/*.{js,jsx}',
    '!src/config.js',
    '!src/scripts/*.js',
    '!**/node_modules/**',
    '!**/__fixtures__/*.js',
    '!lib/**',
  ],

  // https://facebook.github.io/jest/docs/en/configuration.html#coveragedirectory-string
  coverageDirectory: '<rootDir>/coverage',

  coveragePathIgnorePatterns: [
    '<rootDir>/(scripts|build|docs|public|flow-typed|coverage|lib|config|logs)/',
    '/flow-typed/',
    '/migrations/',
    '/__fixtures__/',
    '/node_modules/',
  ],

  // coverageReporters: [], // [array<string>]
  // coverageThreshold: {}, // [object]

  globals: {},

  // https://facebook.github.io/jest/docs/en/configuration.html#mapcoverage-boolean
  // mapCoverage: false, // [boolean]

  // The default extensions Jest will look for.
  // https://facebook.github.io/jest/docs/en/configuration.html#modulefileextensions-array-string
  moduleFileExtensions: ['js', 'json', 'jsx', 'mjs'],

  // moduleDirectories: // [array<string>]

  // A map from regular expressions to module names that allow to stub out resources,
  // like images or styles with a single module.
  moduleNameMapper: {},

  // modulePathIgnorePatterns: // [array<string>]
  modulePaths: ['<rootDir>/src'],
  // notify: false, // [boolean]
  // preset: // [string]
  // projects: // [array<string>]
  // clearMocks: // [boolean]
  // reporters: // [array<moduleName | [moduleName, options]>]
  // resetMocks: // [boolean]
  // resetModules: // [boolean]
  // resolver: // [string]
  // rootDir: // [string]
  // roots: // [array<string>]
  // setupFiles: ['<rootDir>/tools/jest/setup.js'],
  // setupTestFrameworkScriptFile: '<rootDir>/node_modules/jest-enzyme/lib/index.js', // [string]
  // snapshotSerializers: // [array<string>]
  testEnvironment: 'node',
  // testMatch: // [array<string>]
  testRegex: '.*.test\\.js',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__snapshots__/',
    '/__fixtures__/',
    '/seeds/',
    '/seedData/',
    '<rootDir>/(scripts|test|apidocs|public|flow-typed|coverage|lib|config|logs)/',
  ],
  // testResultsProcessor: // [string]
  // testRunner: // [string]
  // This will initialize the jsdom document with a URL which is necessary
  // for History push state to work.
  // See https://github.com/ReactTraining/react-router/issues/5030
  testURL: 'http://localhost/',
  timers: 'fake',

  transformIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/(scripts|test|apidocs|public|flow-typed|coverage|lib|config|logs)/',
  ],
  verbose: true,
};
