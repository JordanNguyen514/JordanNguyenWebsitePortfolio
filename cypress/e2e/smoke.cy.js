describe('Portfolio Website Smoke Test', () => {
  
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the main page and display core content', () => {
    // Check for the main hero title
    cy.get('#hero-title').should('be.visible').and('contain', 'Jordan Nguyen');
    
    // Check for core section titles in the current homepage layout
    cy.contains('.career-port-title', 'Career Portfolio').should('be.visible');
    cy.contains('.skills-title', 'Core Skills').should('be.visible');
    cy.contains('.section-title', 'Quality & Pipeline Status').should('be.visible');
    cy.contains('.section-title', 'Connect').should('be.visible');
    cy.contains('.section-title', 'Get in Touch').should('be.visible');
  });

  it('should verify navigation links in the Career Portfolio section', () => {
    cy.get('[data-event-action="Click_Experience_Button"]').should('be.visible').and('contain', 'Experience');
    cy.get('[data-event-action="Click_Certifications_Button"]').should('be.visible').and('contain', 'Certifications');

    cy.get('[data-event-action="Click_Experience_Button"]').click();
    cy.url().should('include', '/assets/html/work-experience.html');
    cy.go('back');
  });

  it('should verify social media and email links', () => {
    // Check for key social links using their data attributes
    cy.get('[data-event-action="Click_LinkedIn_Icon"]').should('be.visible');
    cy.get('[data-event-action="Click_GitHub_Icon"]').should('be.visible');
    
    // Check email form and CV links
    cy.get('[data-event-action="Click_EmailForm_Icon"]').should('be.visible');
    cy.get('[data-event-action="Click_CV_Icon"]').should('be.visible');
  });

  it('should load the navigation bar and display the Home link', () => {
    // Check if the topnav div exists
    cy.get('.topnav').should('be.visible');

    // Check if the "Home" link is visible and has the correct tracking attribute
    cy.get('a[data-event-action="Click_Home"]')
      .should('be.visible')
      .and('contain', 'Home');
  });

  it('should open the "Browse" dropdown and show its links', () => {
    // FIX: The dropdown is CSS :hover-only. Headless Chrome does not fire
    // :hover on click(), so the menu stays hidden. We add the .open class
    // via JS to simulate hover — matching the Robot Framework fix in common.resource.
    cy.get('[data-testid="nav-browse-btn"]')
      .closest('.nav-dropdown')
      .invoke('addClass', 'open');

    cy.get('.nav-dropdown.open .dropdown-menu').should('be.visible');
    cy.get('[data-event-action="Click_Experience"]').should('be.visible').and('contain', 'Experience');
    cy.get('[data-event-action="Click_Academics"]').should('be.visible').and('contain', 'Academics');

    // Cleanup: remove .open class
    cy.get('.nav-dropdown').invoke('removeClass', 'open');
  });

  it('should open the "Contact" dropdown and show its links', () => {
    // FIX: Same :hover headless fix — add .open class via jQuery invoke
    cy.get('[data-testid="nav-contact-btn"]')
      .closest('.nav-dropdown')
      .invoke('addClass', 'open');

    cy.get('.nav-dropdown.open .dropdown-menu').should('be.visible');
    cy.get('[data-event-action="Click_EmailForm"]').should('be.visible').and('contain', 'Email Form');
    cy.get('[data-testid="nav-recruiter-contact"]').should('be.visible').and('contain', 'For Recruiters');

    cy.get('.nav-dropdown').invoke('removeClass', 'open');
  });

  it('should open the "Dashboards" dropdown and show its link', () => {
    cy.get('[data-testid="nav-dashboards-btn"]')
      .closest('.nav-dropdown')
      .invoke('addClass', 'open');

    cy.get('.nav-dropdown.open .dropdown-menu').should('be.visible');
    cy.get('[data-event-action="Click_Quality_Dashboard"]').should('be.visible').and('contain', 'Quality Dashboard');

    cy.get('.nav-dropdown').invoke('removeClass', 'open');
  });

  it('should display the live clock in the navigation bar', () => {
    cy.get('#time').should('exist').and('not.be.empty');
  });
});
