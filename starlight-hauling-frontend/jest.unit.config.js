module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '^@root(.*)$': '<rootDir>/src$1',
    '^@hooks(.*)$': '<rootDir>/src/hooks$1',
    '^@tests(.*)$': '<rootDir>/tests$1',
    '^lodash-es$': '<rootDir>/node_modules/lodash/index.js',
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tests/__mocks__/file.ts',
    '\\.svg': '<rootDir>/tests/__mocks__/svgr.tsx',
  },
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: [
    '@testing-library/jest-dom/extend-expect',
    'mobx-react-lite/batchingForReactDom',
  ],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.unit.spec.{js,jsx,ts,tsx}'],
  transform: { '^.+\\.[jt]sx?$': 'ts-jest' },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es)'],
  verbose: true,
  testTimeout: 10000,
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
};
