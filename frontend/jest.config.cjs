// jest.config.cjs
// If you keep this as CJS, add:
process.env.BABEL_CONFIG_FILE = './babel.config.mjs';

module.exports = {
  rootDir: '.',

  // Send all .js/.jsx/.ts/.tsx through babel-jest
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },

  testEnvironment: 'jsdom',
  moduleFileExtensions: [ 'js', 'jsx', 'ts', 'tsx' ],

  // Stub out style imports
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },

  // Your setup file for jest-dom & polyfills
  setupFilesAfterEnv: [ '<rootDir>/jest.setup.cjs' ],

  // Only skip node_modules
  transformIgnorePatterns: [ '/node_modules/' ],
};
