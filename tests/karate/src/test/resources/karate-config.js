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
    // contactApiUrl removed — API Gateway decommissioned.
    // Tests now use the email form Lambda which is the active endpoint.
    emailApiUrl: 'https://88vzig52sl.execute-api.ca-central-1.amazonaws.com/prod/send',

    // ── Default request headers ────────────────────────────
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Accept':       'application/json'
    },

    // ── Test data ──────────────────────────────────────────
    validEmail: {
      senderName:  'Karate Test',
      senderEmail: 'karate@test.com',
      subject:     'Automated Karate API Test',
      message:     'This is an automated API test from the Karate Framework suite.'
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
