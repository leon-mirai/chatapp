describe('Channel Component E2E Test for General Tech Discussion', () => {
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

    // verify the redirection to the specific channel page
    cy.visit('https://chat.leonlee.au/channels/66e142d7db7b93c91f5e73b1');
  });

  it('should display all necessary elements on the General Tech Discussion channel page', () => {
    // verify that the channel name is displayed
    cy.contains('Channel: General Tech Discussion').should('be.visible');

    // verify the "Members" section is visible with correct buttons
    cy.contains('Members').should('be.visible');
    cy.contains('group_admin_1').should('be.visible');
    cy.contains('super_admin').should('be.visible');
    cy.contains('chat_user').should('be.visible');

    it('should allow sending a chat message', () => {
      // type a message in the chat
      cy.get('textarea[placeholder="Type your message..."]').type(
        'Hello from Cypress!'
      );

      // click the Send button
      cy.get('button').contains('Send').click();

      // verify that the message appears in the chat list
      cy.contains('Hello from Cypress!').should('be.visible');
    });
  });
});
