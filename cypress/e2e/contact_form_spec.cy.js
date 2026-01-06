// cypress/e2e/contact_form_spec.cy.js

describe('Contact Form Functionality', () => {
    // Visit the local/deployed contact page before each test
    beforeEach(() => {
        // Cypress base URL should be configured in cypress.config.js
        cy.visit('/Contacting/index.html'); 
    });

    it('should successfully submit the contact form and show a success message', () => {
        // Fill out all the form fields
        cy.get('#firstName').type('JordanTest');
        cy.get('#lastName').type('NguyenTest');
        
        // Select a radio button for 'Professional'
        cy.get('input[type="radio"][value="P"]').check(); 
        
        cy.get('#email').type('test@example.com');
        cy.get('#number').type('1234567890');
        cy.get('#Message').type('This is a test message for the Cypress E2E test.');

        // Submit the form
        cy.get('.SubBtn').click();

        // Check for the success message (requires the formResponse div in HTML)
        cy.get('#formResponse', { timeout: 10000 }) // Give it time for the API call to complete
          .should('be.visible')
          .and('contain', 'Message sent successfully!');

        // Optionally verify form fields are cleared after submission
        cy.get('#firstName').should('be.empty');
    });

    // You can add more tests here to check for validation errors, etc.
});