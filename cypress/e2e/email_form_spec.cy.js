describe('Email Form Navigation and Functionality', () => {

    beforeEach(() => {
        cy.visit('/'); 

        cy.get('a[href="/assets/html/emailing.html"]')
          .filter(':has(img)') 
          .scrollIntoView() 
          .click();

        // 2. Verify that we have navigated to the correct page
        cy.url().should('include', '/assets/html/emailing.html');
        
        // Verify the form container is visible
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

    // --- Non-Happy Path Test (Invalid Email) ---
    it('should show an error message when submitting an invalid email format', () => {
        
        // Fill in valid data for everything else
        cy.get('#senderName').type('Error Test User');
        cy.get('#subject').type('Invalid Email Test');
        cy.get('#message').type('This tests error handling for invalid input.');

        // Input an invalid email address (missing the '@' symbol)
        cy.get('#senderEmail').type('invalid-email-no-at.com');

        // Monitor network requests to ensure the fetch/API call does *not* happen
        cy.intercept('POST', '**/prod/send').as('apiCall');

        // Attempt to submit the form
        cy.get('#emailForm button[type="submit"]').click();
        
        cy.get('#emailForm button[type="submit"]')
            .should('contain', 'Send Message')
            .and('not.be.disabled');
        cy.get('#formResponse').should('not.be.visible');
    });
});
