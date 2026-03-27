/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testMatch: ['**/?(*.)+(test|spec).{js,jsx}'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg|webp|ico)$': '<rootDir>/test/__mocks__/fileMock.js',
    '\\.(xlsx)$': '<rootDir>/test/__mocks__/fileMock.js',
    '^framer-motion$': '<rootDir>/test/__mocks__/framer-motion.js',
    '^@lottiefiles/react-lottie-player$': '<rootDir>/test/__mocks__/lottie.js',
  },
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  modulePathIgnorePatterns: ['<rootDir>/jack-marvel-final-pixelmatched/'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/main.jsx',
  ],
  // Keep thresholds off initially to avoid blocking on first run;
  // we'll enforce once we stabilize the suite.
  coverageThreshold: undefined,
};

