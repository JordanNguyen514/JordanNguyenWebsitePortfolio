describe('Submissions Page Navigation and Authentication', () => {

    const username = 'admin';
    const password = 'admin123';

    beforeEach(() => {
        // Visit the home page using the relative path
        cy.visit('/');
    });

    it('should navigate via the topnav, log in, and display the table', () => {
        // 1. Start at the home page (handled by beforeEach)

        // 2. Navigate to the 'View Submissions' page via the 'Contact' dropdown
        // A normal click on the button to make the menu *visible*
        cy.contains('.dropbtn', 'Contact').click();
        
        // Use { force: true } to click the 'View Submissions' link even if display: none is set
        cy.contains('.dropdown-content a', 'View Submissions').click({ force: true });

        // 3. Verify we have arrived at the submissions page
        cy.url().should('include', '/submissions.html');
        cy.get('#login-section').should('be.visible');

        // 4. Input credentials and log in
        cy.get('#username').type(username);
        cy.get('#password').type(password);
        cy.get('#login-form button').click();

        // 5. Verify the table appears (give the fetch request time to complete)
        cy.wait(2000); 
        cy.get('#submissions-table-container').should('be.visible');
        
        // Optional: Verify specific data is present
        cy.contains('th', 'First Name').should('be.visible');
    });

    it('should show an error with invalid credentials', () => {
        // Visit homepage again for this separate test case (handled by beforeEach)
        
        cy.contains('.dropbtn', 'Contact').click();
        // Use { force: true } here too
        cy.contains('.dropdown-content a', 'View Submissions').click({ force: true });

        // Input invalid credentials
        cy.get('#username').type('wronguser');
        cy.get('#password').type('wrongpass');
        cy.get('#login-form button').click();

        // Verify the error message appears
        cy.wait(1000);
        cy.get('#error-message').should('be.visible').and('contain', 'Invalid username or password.');
    });
});
