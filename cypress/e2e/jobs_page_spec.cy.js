describe('Jobs Page Functionality', () => {
    
    beforeEach(() => {
    // Start the test at the home page
    cy.visit('/'); 
    const jobsButtonSelector = 'a.portfolio-btn:contains("Jobs")';

    cy.get(jobsButtonSelector).scrollIntoView().click();
    
    // Wait for the new page H1 to ensure load completion
    cy.get('h1').should('be.visible').and('contain', 'My Work Experiences');

    // Assert that the URL has changed
    cy.url().should('include', 'jobs.html');
  });

  it('Navigates to the jobs page via the specific "Jobs" button and verifies details can be opened and closed', () => {
      // 1. Find all "More Details" buttons initially
    cy.get('.toggle-button').each(($button) => {
      
      // Ensure the button text is "More Details" before clicking
      cy.wrap($button).should('have.text', 'More Details');
      
      // Get the ID of the parent card (e.g., 'kinova-card') to target the specific summary
      const cardId = $button.closest('.timeline-item').attr('id');
      const summarySelector = `#${cardId} .project-summary`;

      // 2. Click "More Details" to open the content
      cy.wrap($button).click();

      // Verify the button text changes to "Hide Details"
      cy.wrap($button).should('have.text', 'Hide Details');

      // Verify the content is visible (has the 'visible' class and is not display: none)
      cy.get(summarySelector)
        .should('be.visible')
        .and('have.class', 'visible');
    });

    // 3. Close all opened details
    // Re-select all buttons, as the text has changed to "Hide Details"
    cy.get('.toggle-button').each(($button) => {
        
        // Ensure the button text is "Hide Details" before clicking
        cy.wrap($button).should('have.text', 'Hide Details');
        
        const cardId = $button.closest('.timeline-item').attr('id');
        const summarySelector = `#${cardId} .project-summary`;

        // Click "Hide Details" to close the content
        cy.wrap($button).click();

        // Verify the button text changes back to "More Details"
        cy.wrap($button).should('have.text', 'More Details');

        // Verify the content is hidden (does not have the 'visible' class and is display: none)
        cy.get(summarySelector)
          .should('not.be.visible')
          .and('not.have.class', 'visible');
    });
  });
});
