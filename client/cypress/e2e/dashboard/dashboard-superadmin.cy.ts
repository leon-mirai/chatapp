describe('Dashboard SuperAdmin E2E Test', () => {
  beforeEach(() => {
    // Visit the login page
    cy.visit('https://chat.leonlee.au/');

    // Wait for the page to load completely
    cy.get('input[name="email"]', { timeout: 10000 }).should('be.visible');

    // Enter the login credentials for the SuperAdmin
    cy.get('input[name="email"]').type('superadmin@example.com');
    cy.get('input[name="password"]').type('123');

    // Click the login button
    cy.get('button').contains('Login').click();

    // Verify the redirection to the dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should display the SuperAdmin panel with all the necessary elements', () => {
    // Check that the "SuperAdmin Panel" title is visible
    cy.contains('SuperAdmin Panel').should('be.visible');

    // Check for the presence of all necessary elements in the SuperAdmin panel
    cy.contains('Your Groups').should('be.visible');
    cy.contains('Create a New Group').should('be.visible');
    cy.contains('Pending Account Requests').should('be.visible');
    cy.contains('Manage Users').should('be.visible');
    cy.contains('Promote User').should('be.visible');
    cy.contains('Available Groups').should('be.visible');

    // Check the presence of the logout and delete account buttons
    cy.get('button').contains('Logout').should('be.visible');
    cy.get('button').contains('Delete My Account').should('be.visible');
  });

    it('should allow creating a new group', () => {
      const newGroupName = 'New Group Test';

      // Enter group name and click "Create Group"
      cy.get('input[placeholder="Enter group name"]').type(newGroupName);
      cy.get('button').contains('Create Group').click();

      // Assert that the new group is listed
      cy.get('.list-group-item').should('contain.text', newGroupName);
    });
});
