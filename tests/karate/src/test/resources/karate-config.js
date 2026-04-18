// ============================================================
//  tests/karate/src/test/resources/karate/karate-config.js
//
//  Karate's global configuration file.
//  Runs once before any feature file executes.
//  Sets base URLs and shared variables per environment.
//
//  Run against production (default):
//    mvn test
//
//  Run against local dev server:
//    mvn test -Dkarate.env=local
//
//  Run from CI with custom URL:
//    mvn test -Dkarate.env=ci -DbaseUrl=https://your-url.com
// ============================================================

function fn() {
  var env = karate.env || 'prod';
  karate.log('Karate environment:', env);

  var config = {
    // ── Site URLs ──────────────────────────────────────────
    baseUrl:        'https://d2kmkdebgfkxyh.cloudfront.net',
    contactApiUrl:  'https://yx8x3by1x5.execute-api.ca-central-1.amazonaws.com/prod/submit',

    // ── Default request headers ────────────────────────────
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Accept':       'application/json'
    },

    // ── Test data ──────────────────────────────────────────
    validContact: {
      firstName: 'Karate',
      lastName:  'Test',
      email:     'karate@test.com',
      number:    '5141234567',
      Purpose:   'P',
      Message:   'Automated API test from Karate Framework.'
    }
  };

  if (env === 'local') {
    config.baseUrl = 'http://localhost:8080';
    karate.log('Running against local server:', config.baseUrl);
  }

  if (env === 'ci') {
    // In CI, baseUrl can be overridden via -DbaseUrl system property
    var overrideUrl = java.lang.System.getProperty('baseUrl');
    if (overrideUrl) {
      config.baseUrl = overrideUrl;
    }
  }

  return config;
}
