// cypress/e2e/contact_form_spec.cy.js

describe('Contact Form Functionality', () => {

    // Visit the home page before each test to start navigation from the top
    beforeEach(() => {
        cy.visit('/'); 
        cy.get('img[alt="Contact Form Link"]').click({ force: true });
        cy.url().should('include', '/contacting.html');
        cy.get('.ContactForm').should('be.visible');
    });

    it('should navigate to the contact page, submit the form, and show a success message', () => {
        
        // 2. Fill out all the form fields
        cy.get('#firstName').type('JordanTest');
        cy.get('#lastName').type('NguyenTest');
        
        // Select a radio button for 'Professional'
        cy.get('input[type="radio"][value="P"]').check(); 
        
        cy.get('#email').type('test@example.com');
        cy.get('#number').type('1234567890');
        cy.get('#Message').type('This is a test message for the Cypress E2E test.');

        // 3. Submit the form
        cy.get('.SubBtn').click();

        // 4. Check for the success message (requires the formResponse div in HTML)
        cy.get('#formResponse', { timeout: 10000 }) // Give it time for the API call to complete
          .should('be.visible')
          .and('contain', 'Message sent successfully!'); // Updated message based on your Lambda response

        // Optionally verify form fields are cleared after submission
        cy.get('#firstName').should('be.empty');
    });
});