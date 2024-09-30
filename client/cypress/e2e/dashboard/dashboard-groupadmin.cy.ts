describe('Dashboard GroupAdmin E2E Test', () => {
    beforeEach(() => {
      // Visit the login page and log in as GroupAdmin
      cy.visit('https://chat.leonlee.au/');
  
      // Wait for the page to load completely
      cy.get('input[name="email"]', { timeout: 10000 }).should('be.visible');
  
      // Enter the login credentials for the GroupAdmin
      cy.get('input[name="email"]').type('groupadmin1@example.com');
      cy.get('input[name="password"]').type('123');
  
      // Click the login button
      cy.get('button').contains('Login').click();
  
      // Verify the redirection to the dashboard
      cy.url().should('include', '/dashboard');
    });
  
    it('should display the GroupAdmin panel with all the necessary elements', () => {
      // Check that the "GroupAdmin Panel" title is visible
      cy.contains('GroupAdmin Panel').should('be.visible');
  
      // Check for the presence of all necessary elements in the GroupAdmin panel
      cy.contains('Your Groups').should('be.visible');
      cy.contains('Create a New Group').should('be.visible');
      cy.contains('Available Groups').should('be.visible');
  
      // Check the presence of the logout and delete account buttons
      cy.get('button').contains('Logout').should('be.visible');
      cy.get('button').contains('Delete My Account').should('be.visible');
    });
  
    it('should allow GroupAdmin to create a new group', () => {
      // Enter a new group name
      cy.get('input[placeholder="Enter group name"]').type('New Group Test by Admin');
  
      // Click on the "Create Group" button
      cy.get('button').contains('Create Group').click();
  
      // Check that the new group is added to the list
      cy.get('.list-group-item').should('contain.text', 'New Group Test by Admin');
    });
  });
  