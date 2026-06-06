describe('Work Experience Page Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    const experienceButtonSelector = 'a.portfolio-btn:contains("Experience")';
    cy.get(experienceButtonSelector).scrollIntoView();
    cy.get(experienceButtonSelector).click();
    cy.get('h1').should('be.visible').and('contain', 'Work Experience');
    cy.url().should('include', 'work-experience.html');
  });

  it('allows all job cards to open and close details', () => {
    cy.get('.timeline-item').each(($item) => {
      cy.wrap($item).find('.toggle-button')
        .should('have.text', 'More Details')
        .click();

      cy.wrap($item).find('.toggle-button')
        .should('have.text', 'Hide Details');

      cy.wrap($item).find('.project-summary').should('have.class', 'visible');

      cy.wrap($item).find('.toggle-button').click();

      cy.wrap($item).find('.toggle-button')
        .should('have.text', 'More Details');

      cy.wrap($item).find('.project-summary').should('not.have.class', 'visible');
    });
  });

  it('switches internship tabs and toggles details', () => {
    const tabs = ['Zimmer', 'Dassault', 'V2R'];

    tabs.forEach((tabName) => {
      cy.contains('.tab-button', tabName).click();
      const contentId = tabName.toLowerCase();
      cy.get(`#${contentId}`).should('be.visible');
      cy.get(`#${contentId} .toggle-button`).should('contain', 'More Details').click();
      cy.get(`#${contentId} .toggle-button`).should('contain', 'Hide Details');
      cy.get(`#${contentId} .project-summary`).should('have.class', 'visible');
      cy.get(`#${contentId} .toggle-button`).click();
      cy.get(`#${contentId} .toggle-button`).should('contain', 'More Details');
      cy.get(`#${contentId} .project-summary`).should('not.have.class', 'visible');
    });
  });
});
