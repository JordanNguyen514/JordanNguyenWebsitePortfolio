describe('Internships Page Functionality', () => {

    // Runs before each test in this suite
    beforeEach(() => {
      // Start the test at the home page
      cy.visit('/'); 
      
      // Navigate to the internships page (using the selector for the portfolio button as discussed previously)
      const internshipsButtonSelector = 'a.portfolio-btn:contains("Internships")';
      cy.get(internshipsButtonSelector).scrollIntoView().click();
      cy.get('h1').should('be.visible').and('contain', 'Internship Experiences');
  
      // Assert that the URL has changed
      cy.url().should('include', 'internships.html');
    });

    it('Verifies navigation and all tabs open and their details can be expanded and collapsed', () => {
        
        // Define the names of the tabs we expect to interact with
        const tabs = ['Zimmer', 'Dassault', 'V2R'];

        // Iterate through each tab
        tabs.forEach((tabName) => {
            
            // 1. Click the specific tab button
            cy.contains('.tab-button', tabName).click();

            // 2. Verify the corresponding content area is visible and active
            // The ID of the content area matches the lowercase tab name (e.g., 'zimmer')
            const contentId = tabName.toLowerCase();
            cy.get(`#${contentId}`)
                .should('be.visible')
                .and('have.css', 'display', 'block'); // Ensures the display: none property is removed

            // 3. Verify the "More Details" button works within this specific active tab
            // The button selector targets the active content area only
            const toggleButtonSelector = `#${contentId} .toggle-button`;
            const summarySelector = `#${contentId} .project-summary`;

            // Open the details
            cy.get(toggleButtonSelector).should('have.text', 'More Details').click();
            cy.get(toggleButtonSelector).should('have.text', 'Hide Details');
            cy.get(summarySelector).should('be.visible');

            // Close the details
            cy.get(toggleButtonSelector).should('have.text', 'Hide Details').click();
            cy.get(toggleButtonSelector).should('have.text', 'More Details');
            cy.get(summarySelector).should('not.be.visible');
        });
    });
});
