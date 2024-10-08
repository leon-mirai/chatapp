describe('GroupAdmin E2E Test for Tech Enthusiasts', () => {
    beforeEach(() => {
        // visit the login page and log in as GroupAdmin
        cy.visit('https://chat.leonlee.au/');
    
        // wait for the page to load completely
        cy.get('input[name="email"]', { timeout: 10000 }).should('be.visible');
    
        // enter the login credentials for the GroupAdmin
        cy.get('input[name="email"]').type('groupadmin1@example.com');
        cy.get('input[name="password"]').type('123');
    
        // click the login button
        cy.get('button').contains('Login').click();
    
        // verify the redirection to the Tech Enthusiasts group page
        cy.visit('https://chat.leonlee.au/groups/66e142bfdb7b93c91f5e73a7');
    });

    it('should display all necessary elements in the GroupAdmin panel', () => {
        // verify that the group name is displayed
        cy.contains('Group: Tech Enthusiasts').should('be.visible');
        
        // verify the "Members" section exists
        cy.contains('Members').should('be.visible');

        // check for the presence of member names and their IDs
        cy.contains('super_admin').should('be.visible');
        cy.contains('group_admin_1').should('be.visible');
        cy.contains('chat_user').should('be.visible');

        // verify that channels are listed
        cy.contains('Channels').should('be.visible');
        cy.contains('General Tech Discussion').should('be.visible');

        // check for the "Leave Channel" button for the current user
        cy.get('button').contains('Leave Channel').should('be.visible');
    });

    
});
