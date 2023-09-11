module.exports = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 90,
    },
  },
  coveragePathIgnorePatterns: [
    'node_modules',
    'src/app.ts',
    'src/interfaces',
    'src/data-source',
    'src/database',
    'src/routes',
    'src/server.ts',
    'src/config/config.ts',
  ],
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  transformIgnorePatterns: ['/node_modules/(?!(foo|bar)/)', '/bar/'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
};
