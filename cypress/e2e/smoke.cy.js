describe('Portfolio Website Smoke Test', () => {
  
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the main page and display core content', () => {
    // Check for the main hero title
    cy.get('#hero-title').should('be.visible').and('contain', 'Jordan Nguyen');
    
    // Check for core section titles
    cy.contains('.career-port-title', 'Career Portfolio').should('be.visible');
    cy.contains('.academics-title', 'Academics').should('be.visible');
    cy.contains('.skills-title', 'My Notable Skills').should('be.visible');
    cy.contains('.other-interests-title', 'Other Interests and Passions').should('be.visible');
    cy.contains('.section-title', 'Website Analytics (AWS Kinesis/Lambda)').should('be.visible');
    cy.contains('.section-title', 'My Social Media Presence').should('be.visible');
  });

  it('should verify navigation links in the Career Portfolio section', () => {
    // Check if portfolio buttons are visible and have correct text
    cy.get('[data-event-action="Click_Jobs_Button"]').should('be.visible').and('contain', 'Jobs');
    cy.get('[data-event-action="Click_Internships_Button"]').should('be.visible').and('contain', 'Internships');
    cy.get('[data-event-action="Click_Certifications_Button"]').should('be.visible').and('contain', 'Certifications');

    // Optional: Click a link and verify URL change
    cy.get('[data-event-action="Click_Jobs_Button"]').click();
    cy.url().should('include', '/assets/html/jobs.html');
    cy.go('back'); // Go back to index page for next potential tests
  });

  it('should verify social media and contact links', () => {
    // Check for key social links using their data attributes
    cy.get('[data-event-action="Click_LinkedIn_Icon"]').should('be.visible');
    cy.get('[data-event-action="Click_GitHub_Icon"]').should('be.visible');
    
    // Check contact form, email, CV, and submissions links
    cy.get('[data-event-action="Click_ContactForm_Icon"]').should('be.visible');
    cy.get('[data-event-action="Click_CV_Icon"]').should('be.visible');
    cy.get('[data-event-action="Click_ViewSubmissions_Icon"]').should('be.visible');
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
    cy.get('[data-event-action="Click_Jobs"]').should('be.visible').and('contain', 'Jobs');
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
    cy.get('[data-event-action="Click_ContactForm"]').should('be.visible').and('contain', 'Contact Form');
    cy.get('[data-event-action="Click_ViewSubmissions"]').should('be.visible').and('contain', 'View Submissions');

    cy.get('.nav-dropdown').invoke('removeClass', 'open');
  });

  it('should display the live clock in the navigation bar', () => {
    cy.get('#time').should('exist').and('not.be.empty');
  });
});
