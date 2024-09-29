// describe('Login Successs Test', () => {
//   it('should successfully login with valid credentials', () => {
//     // visit login page
//     cy.visit('https://chat.leonlee.au/');

//     // enter valid email
//     cy.get('input[name="email"]').type('chatuser@example.com');

//     // enter valid password
//     cy.get('input[name="password"').type('123');

//     // click login
//     cy.get('button').contains('Login').click();

//     // verify redirect to dashboard
//     cy.url().should('include', '/dashboard');
//   });
// });

// describe('Login Fail Test', () => {
//   it('should show an error message for invalid login', () => {
//     // Visit the login page
//     cy.visit('https://chat.leonlee.au/');

//     // Enter invalid email
//     cy.get('input[name="email"]').type('invaliduser@example.com');

//     // Enter invalid password
//     cy.get('input[name="password"]').type('wrongpassword');

//     // Click the login button
//     cy.get('button').contains('Login').click();

//     // Assert that the error message appears
//     cy.get('.alert.alert-danger').should('be.visible');
//   });
// });

// describe('Logout Test', () => {
//   it('should successfully login with valid credentials', () => {
//     // visit login page
//     cy.visit('https://chat.leonlee.au/');

//     // enter valid email
//     cy.get('input[name="email"]').type('chatuser@example.com');

//     // enter valid password
//     cy.get('input[name="password"').type('123');

//     // click login
//     cy.get('button').contains('Login').click();

//     // verify redirect to dashboard
//     cy.url().should('include', '/dashboard');

//     // verify logout
//     cy.get('button').contains('Logout').click();

//     // verify login page
//     cy.url().should('include', '/');
//   });
// });

// describe('Authorisation Test', () => {
//   it('should successfully login with valid credentials', () => {
//     // visit login page
//     cy.visit('https://chat.leonlee.au/');

//     // enter valid email
//     cy.get('input[name="email"]').type('chatuser@example.com');

//     // enter valid password
//     cy.get('input[name="password"').type('123');

//     // click login
//     cy.get('button').contains('Login').click();

//     // verify redirect to dashboard
//     cy.url().should('include', '/dashboard');

//     // verify logout
//     cy.get('button').contains('Logout').click();

//     // verify login page
//     cy.url().should('include', '/');
//   });
// });

// describe('Unauthenticated User Test', () => {
//   it('should redirect unauthenticated users to login page when accessing protected routes', () => {
//     // list of protected routes
//     const protectedRoutes = [
//       '/dashboard',
//       '/profile',
//       '/groups/66e142bfdb7b93c91f5e73a7',
//       '/channels/66e142d7db7b93c91f5e73b1',
//     ];

//     // loop through each protected route
//     protectedRoutes.forEach((route) => {
//       cy.visit(`https://chat.leonlee.au${route}`);

//       // assert the URL should redirect to login
//       cy.url().should('include', '/');
//     });
//   });
// });

describe('Request Account Feature', () => {
  it('should request an account and display a success message', () => {
    // Visit the login page
    cy.visit('https://chat.leonlee.au/');

    // Click the "Request an Account" button
    cy.get('button').contains('Request an Account').click();

    // Wait for the success message to appear and assert the message content
    cy.get('.alert.alert-info', { timeout: 10000 }).should(($el) => {
      const text = $el.text().trim();  // Trim any whitespace or non-breaking spaces
      expect(text).to.include('Account request has been sent to the SuperAdmin');
    });
  });

  it('should display an error if the account request fails', () => {
    // Intercept the request and simulate a server failure
    cy.intercept('POST', '/api/request-account', {
      statusCode: 500,
      body: { message: 'Account request failed' },
    });

    // Visit the login page
    cy.visit('https://chat.leonlee.au/');

    // Click the "Request an Account" button
    cy.get('button').contains('Request an Account').click();

    // Wait for the error message to appear and assert the message content
    cy.get('.alert.alert-info', { timeout: 10000 }).should(($el) => {
      const text = $el.text().trim();  // Trim any whitespace or non-breaking spaces
      expect(text).to.include('Failed to request account creation');
    });
  });
});
