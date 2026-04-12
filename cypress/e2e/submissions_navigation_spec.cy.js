describe('Submissions Page Navigation and Authentication', () => {

    const username = 'admin';
    const password = 'admin123';

    beforeEach(() => {
        cy.visit('/');
        cy.get('img[alt="View Submissions Link"]').click({ force: true });
        cy.url().should('include', '/submissions.html');
        cy.get('#login-section').should('be.visible');
    });

    it('should navigate via the topnav, log in, and display the table', () => {

        cy.get('#username').type(username);
        cy.get('#password').type(password);
        cy.get('#login-form button').click();

        // FIX: Replace cy.wait(2000) with an assertion-based wait.
        // cypress/no-unnecessary-waiting bans arbitrary time waits — they
        // make tests slow AND flaky (pass on fast machines, fail on slow CI).
        // cy.get() with a timeout retries until the element appears or time runs out.
        cy.get('#submissions-table-container', { timeout: 8000 }).should('be.visible');
        cy.contains('th', 'First Name').should('be.visible');
    });

    it('should show an error with invalid credentials', () => {

        cy.get('#username').type('wronguser');
        cy.get('#password').type('wrongpass');
        cy.get('#login-form button').click();

        // FIX: Replace cy.wait(1000) with assertion-based wait.
        cy.get('#error-message', { timeout: 5000 })
          .should('be.visible')
          .and('contain', 'Invalid username or password.');
    });
});
