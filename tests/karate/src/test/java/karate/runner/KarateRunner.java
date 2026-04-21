package karate.runner;

import com.intuit.karate.junit5.Karate;

/**
 * ============================================================
 *  KarateRunner.java
 *
 *  JUnit 5 entry point for the Karate test suite.
 *  Maven Surefire discovers this class and runs all .feature
 *  files found in the classpath under the "karate" package.
 *
 *  HOW IT WORKS:
 *  Karate uses JUnit 5 as its runner but features are written
 *  in Gherkin (.feature files), not Java. The Java runner
 *  simply tells Karate where to find the features and how to
 *  configure parallel execution and reporting.
 *
 *  NO GLUE CODE NEEDED — unlike Cucumber, Karate's steps
 *  (Given/When/Then) are built-in. You never write step
 *  definition files. This is Karate's biggest advantage
 *  for API testing speed and maintainability.
 *
 *  Running locally:
 *    cd tests/karate
 *    mvn test                          (all tests, production)
 *    mvn test -Dkarate.env=local       (against localhost:8080)
 *    mvn test -Dkarate.options="--tags @smoke"   (tag filter)
 *
 *  Running a single feature:
 *    mvn test -Dtest=KarateRunner -Dkarate.options="classpath:karate/api/health.feature"
 * ============================================================
 */

public class KarateRunner {

    /**
     * Runs all Karate feature files under the karate/ classpath package.
     */
    @Karate.Test
    Karate runAll() {
        return Karate.run("classpath:karate/api");
    }

    /**
     * Runs only the health check suite.
     * Trigger with: mvn test -Dtest="KarateRunner#runHealthChecks"
     */
    @Karate.Test
    Karate runHealthChecks() {
        return Karate.run("classpath:karate/api/health.feature");
    }

    /**
     * Runs only the email API tests.
     * Trigger with: mvn test -Dtest="KarateRunner#runEmailApi"
     */
    @Karate.Test
    Karate runEmailApi() {
        return Karate.run("classpath:karate/api/email-api.feature");
    }
}

