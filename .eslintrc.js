module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:cypress/recommended',
  ],

  plugins: ['cypress'],

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  rules: {
    'no-unused-vars': ['warn', {
      vars: 'all',
      args: 'after-used',
      argsIgnorePattern: '^_',   // FIX: underscore-prefix means "intentionally unused"
      ignoreRestSiblings: true,
    }],
    'no-console':   ['warn', { allow: ['warn', 'error'] }],
    'no-debugger':  'error',
    'eqeqeq':       ['error', 'always'],
    'no-var':       'error',
    'prefer-const': 'warn',
    'no-alert':     'warn',

    'cypress/no-unnecessary-waiting':    'error',
    'cypress/no-assigning-return-values':'error',
    'cypress/assertion-before-screenshot':'warn',
  },

  overrides: [
    {
      files: ['cypress/**/*.cy.js', 'cypress/**/*.spec.js'],
      rules: {
        'no-unused-expressions': 'off',
      },
    },
    {
      files: ['__tests__/**/*.js', '**/*.test.js'],
      env: { jest: true },
    },
  ],

  ignorePatterns: [
    'node_modules/',
    '_site/',
    'assets/js/jquery-3.5.0.js',
  ],
};
