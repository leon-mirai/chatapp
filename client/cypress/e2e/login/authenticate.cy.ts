describe('Login Success Test', () => {
  beforeEach(() => {
    // visit the login page before each test
    cy.visit('https://chat.leonlee.au/');
  });

  // test for valid username and password
  it('valid username and password', () => {
    // enter valid email
    cy.get('input[name="email"]').type('chatuser@example.com');
    
    // enter valid password
    cy.get('input[name="password"]').type('123');

    // click login
    cy.get('button').contains('Login').click();

    // check if redirected to the dashboard
    cy.url().should('include', '/dashboard');

    // wait for a short period to ensure localStorage/sessionStorage is set
    cy.wait(500);

    // log localStorage and sessionStorage to the Cypress console for debugging
    cy.window().then((window) => {
      console.log('LocalStorage:', window.localStorage);
      console.log('SessionStorage:', window.sessionStorage);
    });

    // check localStorage or sessionStorage for the 'user' key
    cy.window().then((window) => {
      const localStorageUser = window.localStorage.getItem('user');
      const sessionStorageUser = window.sessionStorage.getItem('user');

      if (localStorageUser) {
        // assert user exists in localStorage
        const user = JSON.parse(localStorageUser);
        expect(user.email).to.equal('chatuser@example.com');
      } else if (sessionStorageUser) {
        // if not found in localStorage, check sessionStorage
        const user = JSON.parse(sessionStorageUser);
        expect(user.email).to.equal('chatuser@example.com');
      } else {
        // fail the test if neither storage contains the user
        throw new Error('User data not found in localStorage or sessionStorage');
      }
    });
  });
});



describe('Logout Test', () => {
  it('should successfully login with valid credentials', () => {
    // visit login page
    cy.visit('https://chat.leonlee.au/');

    // enter valid email
    cy.get('input[name="email"]').type('chatuser@example.com');

    // enter valid password
    cy.get('input[name="password"').type('123');

    // click login
    cy.get('button').contains('Login').click();

    // verify redirect to dashboard
    cy.url().should('include', '/dashboard');

    // verify logout
    cy.get('button').contains('Logout').click();

    // verify login page
    cy.url().should('include', '/');
  });
});

describe('Authorisation Test', () => {
  it('should successfully login with valid credentials', () => {
    // visit login page
    cy.visit('https://chat.leonlee.au/');

    // enter valid email
    cy.get('input[name="email"]').type('chatuser@example.com');

    // enter valid password
    cy.get('input[name="password"').type('123');

    // click login
    cy.get('button').contains('Login').click();

    // verify redirect to dashboard
    cy.url().should('include', '/dashboard');

    // verify logout
    cy.get('button').contains('Logout').click();

    // verify login page
    cy.url().should('include', '/');
  });
});

describe('Unauthenticated User Test', () => {
  it('should redirect unauthenticated users to login page when accessing protected routes', () => {
    // list of protected routes
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/groups/66e142bfdb7b93c91f5e73a7',
      '/channels/66e142d7db7b93c91f5e73b1',
    ];

    // loop through each protected route
    protectedRoutes.forEach((route) => {
      cy.visit(`https://chat.leonlee.au${route}`);

      // assert the URL should redirect to login
      cy.url().should('include', '/');
    });
  });
});

describe('Request Account Feature', () => {
  it('should request an account and display a success message', () => {

    cy.visit('https://chat.leonlee.au/');

    // Click the "Request an Account" button
    cy.get('button').contains('Request an Account').click();

    // Wait for the success message to appear and assert the message content
    cy.get('.alert.alert-info', { timeout: 10000 }).should(($el) => {
      const text = $el.text().trim(); // Trim any whitespace or non-breaking spaces
      expect(text).to.include(
        'Account request has been sent to the SuperAdmin'
      );
    });
  });
});
