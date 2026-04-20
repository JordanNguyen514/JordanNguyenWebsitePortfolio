describe('Jobs Page Functionality', () => {

    beforeEach(() => {
    cy.visit('/');
    const jobsButtonSelector = 'a.portfolio-btn:contains("Jobs")';

    // FIX: Split chain after scrollIntoView — cypress/unsafe-to-chain-command
    cy.get(jobsButtonSelector).scrollIntoView();
    cy.get(jobsButtonSelector).click();

    cy.get('h1').should('be.visible').and('contain', 'My Work Experiences');
    cy.url().should('include', 'jobs.html');
  });

  it('Navigates to the jobs page via the specific "Jobs" button and verifies details can be opened and closed', () => {

    cy.get('.toggle-button').each(($button) => {

      cy.wrap($button).should('have.text', 'More Details');

      const cardId = $button.closest('.timeline-item').attr('id');
      const summarySelector = `#${cardId} .project-summary`;

      cy.wrap($button).click();

      cy.wrap($button).should('have.text', 'Hide Details');

      cy.get(summarySelector)
        .should('be.visible')
        .and('have.class', 'visible');
    });

    cy.get('.toggle-button').each(($button) => {

        cy.wrap($button).should('have.text', 'Hide Details');

        const cardId = $button.closest('.timeline-item').attr('id');
        const summarySelector = `#${cardId} .project-summary`;

        cy.wrap($button).click();

        cy.wrap($button).should('have.text', 'More Details');

        // FIX: Assert class removal, not CSS visibility.
        // .not.be.visible fails during CSS transition (display:none animation).
        // Checking the class is instant and reflects the toggle state correctly.
        cy.get(summarySelector)
          .should('not.have.class', 'visible');
    });
  });
});
