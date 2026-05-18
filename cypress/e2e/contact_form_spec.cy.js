// cypress/e2e/contact_form_spec.cy.js

describe('Contact Form Functionality', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.get('img[alt="Contact Form Link"]').click({ force: true });
        cy.url().should('include', '/contacting.html');
        cy.get('.ContactForm').should('be.visible');
    });

    it('should navigate to the contact page, submit the form, and show a success message', () => {

        // FIX: Intercept the Lambda POST before filling the form.
        // In CI, Lambda cold-starts routinely exceed the 10s timeout causing
        // flaky failures. cy.intercept() stubs the network call so the UI
        // response logic is tested deterministically without a live backend.
        // The Lambda itself is covered by the Karate API tests.
        cy.intercept('POST', '**/prod/contact', {
            statusCode: 200,
            body: { message: 'Message sent successfully!' },
        }).as('contactApi');

        cy.get('#firstName').type('JordanTest');
        cy.get('#lastName').type('NguyenTest');
        cy.get('input[type="radio"][value="P"]').check();
        cy.get('#email').type('test@example.com');
        cy.get('#number').type('1234567890');
        cy.get('#Message').type('This is a test message for the Cypress E2E test.');

        cy.get('.SubBtn').click();

        // Wait for the intercepted request — no timeout risk
        cy.wait('@contactApi');

        cy.get('#formResponse', { timeout: 10000 })
          .should('be.visible')
          .and('contain', 'Message sent successfully!');

        cy.get('#firstName').should('be.empty');
    });
});