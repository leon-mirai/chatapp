describe('Dashboard ChatUser E2E Test', () => {
    beforeEach(() => {
      // Visit the login page and log in as ChatUser
      cy.visit('https://chat.leonlee.au/');
  
      // Wait for the page to load completely and ensure the email input is visible
      cy.get('input[name="email"]', { timeout: 10000 }).should('be.visible');
  
      // Enter the login credentials for the ChatUser
      cy.get('input[name="email"]').type('chatuser@example.com');
      cy.get('input[name="password"]').type('123');
  
      // Click the login button
      cy.get('button').contains('Login').click();
  
      // Verify the redirection to the dashboard
      cy.url().should('include', '/dashboard');
    });
  
    it('should display the ChatUser panel with the necessary elements', () => {
      // Verify the "View Groups" and "Available Groups" sections are visible
      cy.contains('View Groups').should('be.visible');
      cy.contains('Available Groups').should('be.visible');
  
      // Check that "Logout" and "Delete My Account" buttons are visible
      cy.get('button').contains('Logout').should('be.visible');
      cy.get('button').contains('Delete My Account').should('be.visible');
    });
  
    it('should allow the ChatUser to request to join a group', () => {
        // Click on the "Request to Join" button for the group "Art Enthusiasts"
        cy.contains('Art Enthusiasts')
          .parent()
          .contains('Request to Join')
          .click();
      });
  });
  