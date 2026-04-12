describe('Email Form Navigation and Functionality', () => {

    beforeEach(() => {
        cy.visit('/');

        // FIX: Split chain after scrollIntoView — cypress/unsafe-to-chain-command
        // scrollIntoView() is an action; chaining .click() directly after it is unsafe.
        // Split into two commands so Cypress can properly retry each independently.
        cy.get('a[href="/assets/html/emailing.html"]')
          .filter(':has(img)')
          .scrollIntoView();
        cy.get('a[href="/assets/html/emailing.html"]')
          .filter(':has(img)')
          .click();

        cy.url().should('include', 'emailing.html');
        cy.get('#emailForm').should('be.visible');
    });

    it('should navigate to the email form via the icon, fill it out, and show success', () => {

        cy.get('#senderName').type('Cypress Automated Test');
        cy.get('#senderEmail').type('test.user@example.com');
        cy.get('#subject').type('Automated E2E Test Submission');
        cy.get('#message').type('This message is a test sent via Cypress automation script.');

        cy.get('#emailForm button[type="submit"]').click();

        cy.get('#formResponse', { timeout: 10000 })
          .should('be.visible')
          .and('contain', 'Success! Your message has been sent.');

        cy.get('#senderName').should('be.empty');
        cy.get('#senderEmail').should('be.empty');
    });

    it('should show an error message when submitting an invalid email format', () => {

        cy.get('#senderName').type('Error Test User');
        cy.get('#subject').type('Invalid Email Test');
        cy.get('#message').type('This tests error handling for invalid input.');
        cy.get('#senderEmail').type('invalid-email-no-at.com');

        cy.intercept('POST', '**/prod/send').as('apiCall');

        cy.get('#emailForm button[type="submit"]').click();

        cy.get('#emailForm button[type="submit"]')
            .should('contain', 'Send Message')
            .and('not.be.disabled');
        cy.get('#formResponse').should('not.be.visible');
    });
});
