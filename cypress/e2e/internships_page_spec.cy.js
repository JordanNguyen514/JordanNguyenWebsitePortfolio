describe('Internships Page Functionality', () => {

    beforeEach(() => {
      cy.visit('/');

      // FIX: Split chain after scrollIntoView — cypress/unsafe-to-chain-command
      const internshipsButtonSelector = 'a.portfolio-btn:contains("Internships")';
      cy.get(internshipsButtonSelector).scrollIntoView();
      cy.get(internshipsButtonSelector).click();

      cy.get('h1').should('be.visible').and('contain', 'Internship Experiences');
      cy.url().should('include', 'internships.html');
    });

    it('Verifies navigation and all tabs open and their details can be expanded and collapsed', () => {

        const tabs = ['Zimmer', 'Dassault', 'V2R'];

        tabs.forEach((tabName) => {

            cy.contains('.tab-button', tabName).click();

            const contentId = tabName.toLowerCase();
            cy.get(`#${contentId}`)
                .should('be.visible')
                .and('have.css', 'display', 'block');

            const toggleButtonSelector = `#${contentId} .toggle-button`;
            const summarySelector = `#${contentId} .project-summary`;

            cy.get(toggleButtonSelector).should('have.text', 'More Details').click();
            cy.get(toggleButtonSelector).should('have.text', 'Hide Details');
            cy.get(summarySelector).should('be.visible');

            cy.get(toggleButtonSelector).should('have.text', 'Hide Details').click();
            cy.get(toggleButtonSelector).should('have.text', 'More Details');
            cy.get(summarySelector).should('not.be.visible');
        });
    });
});
