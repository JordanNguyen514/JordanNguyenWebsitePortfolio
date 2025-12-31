// smoke.cy.js
describe('Smoke Test: Jordan Nguyen Website is Live', () => {
  it('Verifies key sections and elements on the homepage', () => {
    // The baseUrl (d2kmkdebgfkxyh.cloudfront.net) is set in buildspec.yml
    cy.visit('/'); 
    
    // Check the page title
    cy.title().should('eq', 'Jordan 1st Page');

    // Check main welcome text
    cy.get('.NameField').should('contain', 'Jordan Nguyen');
    cy.get('.WelcomeField').should('contain', 'Welcome to my webpage');

    // Check for the "Career Portfolio" heading
    cy.get('.CareerPort').should('be.visible').and('contain', 'Career Portfolio');
    
    // Check for a specific skill name (e.g., SQL)
    cy.contains('.SkillName', 'SQL').should('be.visible');
  });
});