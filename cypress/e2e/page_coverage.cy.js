const publicPages = [
  {
    name: 'Home',
    path: '/',
    visibleText: ['Jordan Nguyen', 'Career Portfolio', 'Core Skills', 'Quality & Pipeline Dashboard', 'Get in Touch'],
    selectors: ['#hero-title', '[data-event-action="Click_EmailForm_Icon"]'],
  },
  {
    name: 'Work Experience',
    path: '/assets/html/work-experience.html',
    visibleText: ['Work Experience', 'My Work Experiences', 'Internship Experiences'],
    selectors: ['#jobs-portfolio', '#internship-portfolio'],
  },
  {
    name: 'Academic',
    path: '/assets/html/academic.html',
    visibleText: ['Biomedical Engineering', 'Polytechnique'],
    selectors: ['main, body'],
  },
  {
    name: 'Certifications',
    path: '/assets/html/certifications.html',
    visibleText: ['My Certifications', 'AWS Certified Developer Associate', 'ISTQB Certified Tester'],
    selectors: ['.certification-item'],
  },
  {
    name: 'SDET Showcase',
    path: '/assets/html/sdet.html',
    visibleText: ['SDET Showcase', 'Skills Proficiency', 'All Skills', 'Quality Dashboard'],
    selectors: ['#radar-svg', '.rtab', '.radar-point'],
  },
  {
    name: 'Quality Dashboard',
    path: '/assets/html/live-pipeline-status.html',
    visibleText: ['Quality Dashboard', 'Deploy to S3', 'Total Automated Tests'],
    selectors: ['#ci-dashboard-grid', '.metric-card'],
  },
  {
    name: 'Case Studies',
    path: '/assets/html/blog.html',
    visibleText: ['QA Case Studies', 'flaky test visibility', 'PR quality gate'],
    selectors: ['.blog-card', 'details.bc-body'],
  },
  {
    name: 'Endorsements',
    path: '/assets/html/testimonials.html',
    visibleText: ['Endorsements', 'Social Proof', 'Endorse on LinkedIn'],
    selectors: ['.testi-card'],
  },
  {
    name: 'Recruiter',
    path: '/assets/html/recruiter.html',
    visibleText: ['Jordan Nguyen', 'Quality Engineering Consultant', 'Core Stack', "Let's talk"],
    selectors: ['.recruiter-name', '.recruiter-cta-row', '.stack-group'],
  },
  {
    name: 'Email Form',
    path: '/assets/html/emailing.html',
    visibleText: ['Send an Email Message', 'Your Name', 'Subject'],
    selectors: ['#emailForm', '#senderEmail', '#message'],
  },
];

const staticUtilityPages = [
  { name: 'Custom 404', path: '/404.html', expected: 'Page Not Found' },
];

function assertNoServerError() {
  cy.contains('Not Found').should('not.exist');
  cy.contains('Liquid Exception').should('not.exist');
  cy.contains('stack level too deep').should('not.exist');
}

function assertPageText(text) {
  // Some labels also appear in hidden nav dropdowns; checking body text avoids
  // Cypress selecting a hidden duplicate before the visible page heading.
  cy.get('body').should('contain', text);
}

describe('Public page render coverage', () => {
  publicPages.forEach((page) => {
    it(`${page.name} page renders expected content`, () => {
      cy.visit(page.path);
      assertNoServerError();

      page.visibleText.forEach(assertPageText);

      page.selectors.forEach((selector) => {
        cy.get(selector).should('exist');
      });
    });
  });

  staticUtilityPages.forEach((page) => {
    it(`${page.name} utility page is reachable`, () => {
      cy.request(page.path).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.contain(page.expected);
      });
    });
  });
});

describe('Page-specific interaction coverage', () => {
  it('Skills radar renders points and filters by category', () => {
    cy.visit('/assets/html/sdet.html');
    cy.get('.radar-point').should('have.length', 24);
    cy.contains('.rtab', 'CI / CD & Cloud').click();
    cy.get('.rtab.active').should('contain', 'CI / CD & Cloud');
    cy.get('.radar-point').should('have.length', 6);
    cy.contains('.sl-name', 'GitHub Actions').should('be.visible');
  });

  it('Live quality dashboard exposes both QA metrics and pipeline cards', () => {
    cy.visit('/assets/html/live-pipeline-status.html');
    cy.get('#ci-dashboard-grid .ci-card').its('length').should('be.gte', 7);
    cy.get('#ci-pipeline-health').should('not.be.empty');
    cy.get('.metric-card').should('have.length.at.least', 4);
    cy.get('#m-total').should('be.visible');
    cy.get('#m-pass').should('be.visible');
  });

  it('Blog case studies expand inline details', () => {
    cy.visit('/assets/html/blog.html');
    cy.get('details.bc-body').first().as('firstCaseStudy');
    cy.get('@firstCaseStudy').should('not.have.attr', 'open');
    cy.get('@firstCaseStudy').find('summary').click();
    cy.get('@firstCaseStudy').should('have.attr', 'open');
    cy.contains('The problem').should('be.visible');
  });

  it('Contact dropdown preserves all contact entry points', () => {
    cy.visit('/');
    cy.get('[data-testid="nav-contact-btn"]')
      .closest('.nav-dropdown')
      .invoke('addClass', 'open');

    cy.get('[data-testid="nav-email-form"]').should('have.attr', 'href', '/assets/html/emailing.html');
    cy.get('[data-testid="nav-recruiter-contact"]').should('have.attr', 'href', '/assets/html/recruiter.html');
  });
});
