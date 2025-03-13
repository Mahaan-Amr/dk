describe('Admin Login', () => {
  beforeEach(() => {
    // Visit the admin login page
    cy.visit('/fa/admin/login');
  });

  it('should show login form', () => {
    // Check if the login form is displayed
    cy.get('form').should('exist');
    cy.contains('ورود به پنل مدیریت').should('be.visible');
  });

  it('should show error message with invalid credentials', () => {
    // Enter invalid credentials
    cy.get('input[name="username"]').type('invaliduser');
    cy.get('input[name="password"]').type('wrongpassword');
    
    // Intercept the API call to check for error response
    cy.intercept('POST', '/api/admin/login').as('loginRequest');
    
    // Submit the form using button click
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call
    cy.wait('@loginRequest').then(({ response }) => {
      expect(response?.statusCode).to.eq(401);
    });
    
    // Check for error message - look for the div with error styling instead of specific text
    cy.get('div.bg-red-50').should('be.visible');
    // Since we don't know the exact error message text (depends on translation), 
    // just verify there is some text in the error div
    cy.get('div.bg-red-50').should('not.be.empty');
  });

  it('should redirect to dashboard with valid credentials', () => {
    // Use the valid development credentials
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('DerakhtKherad@2024');
    
    // Intercept the API call
    cy.intercept('POST', '/api/admin/login').as('loginRequest');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call and check response
    cy.wait('@loginRequest').then(({ response }) => {
      expect(response?.statusCode).to.eq(200);
      
      // Store the token and user info
      if (response && response.body) {
        cy.window().then((win) => {
          win.localStorage.setItem('admin_user', JSON.stringify(response.body.user));
          win.document.cookie = `admin_token=${response.body.token}; path=/`;
        });
      }
    });
    
    // Should redirect to dashboard
    cy.url().should('include', '/fa/admin/dashboard');
  });
}); 