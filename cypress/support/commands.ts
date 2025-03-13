/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (username = 'admin', password = 'DerakhtKherad@2024') => {
  // Intercept login request - use the correct endpoint
  cy.intercept('POST', '/api/admin/login').as('loginRequest');
  
  // Visit login page and submit credentials
  cy.visit('/fa/admin/login');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  
  // Use click instead of form.submit() to better simulate user interaction
  cy.get('button[type="submit"]').click();
  
  // Wait for the API call to complete
  cy.wait('@loginRequest').then(({ response }) => {
    if (response && response.statusCode === 200) {
      // Set cookie and localStorage with the actual response data
      cy.window().then((win) => {
        win.localStorage.setItem('admin_user', JSON.stringify(response.body.user));
        win.document.cookie = `admin_token=${response.body.token}; path=/`;
      });
    } else {
      // Log the error but don't fail the test here
      cy.log(`Login failed with status: ${response?.statusCode}`);
    }
  });
});

// -- This is a child command --
Cypress.Commands.add('getByCy', (selector) => {
  return cy.get(`[data-cy="${selector}"]`);
});

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Add types to Cypress global namespace
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login to admin panel
     * @example cy.login('admin', 'password')
     */
    login(username?: string, password?: string): Chainable<void>
    
    /**
     * Get element by data-cy attribute
     * @example cy.getByCy('submit-button')
     */
    getByCy(selector: string): Chainable<JQuery<HTMLElement>>
  }
}