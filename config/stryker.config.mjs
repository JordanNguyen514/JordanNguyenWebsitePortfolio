/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  mutate: ['tests/unit/**/*.test.js'],
  jest: {
    projectType: 'custom',
    configFile: 'package.json',
    enableFindRelatedTests: true,
  },
  thresholds: { high: 80, low: 60, break: 50 },
  timeoutMS: 10000,
  timeoutFactor: 1.5,
  ignorePatterns: ['node_modules', 'cypress', 'tests/playwright', 'tests/contract', '_site'],
};
