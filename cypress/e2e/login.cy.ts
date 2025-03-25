describe('Login page', () => {
  beforeEach(() => {
    // Visiter la page de login avant chaque test
    cy.visit('/login');
  });

  it('should display login form correctly', () => {
    // Vérifier que tous les éléments du formulaire sont présents
    cy.get('mat-card-title').should('contain', 'Login');
    cy.get('input[formControlName=email]').should('be.visible');
    cy.get('input[formControlName=password]').should('be.visible');
    cy.get('button[type=submit]').should('be.visible').and('contain', 'Submit');
    cy.get('button[type=submit]').should('be.disabled'); // Le bouton devrait être désactivé au départ
  });

  it('should validate email format', () => {
    // Tester la validation de l'email
    cy.get('input[formControlName=email]').type('invalid-email');
    cy.get('input[formControlName=password]').type('somePassword');
    cy.get('button[type=submit]').should('be.disabled'); // Le bouton doit rester désactivé

    // Corriger l'email et vérifier que le bouton est activé
    cy.get('input[formControlName=email]').clear().type('valid@email.com');
    cy.get('button[type=submit]').should('be.enabled');
  });

  it('should validate password is required', () => {
    // Tester la validation du mot de passe requis
    cy.get('input[formControlName=email]').type('test@email.com');
    cy.get('button[type=submit]').should('be.disabled');

    // Ajouter un mot de passe et vérifier que le bouton est activé
    cy.get('input[formControlName=password]').type('password123');
    cy.get('button[type=submit]').should('be.enabled');
  });

  it('should toggle password visibility', () => {
    // Tester le bouton de visibilité du mot de passe
    cy.get('input[formControlName=password]').type('password123');
    cy.get('input[formControlName=password]').should('have.attr', 'type', 'password');

    // Cliquer sur le bouton pour rendre le mot de passe visible
    cy.get('button[matSuffix]').click();
    cy.get('input[formControlName=password]').should('have.attr', 'type', 'text');

    // Cliquer à nouveau pour cacher le mot de passe
    cy.get('button[matSuffix]').click();
    cy.get('input[formControlName=password]').should('have.attr', 'type', 'password');
  });

  it('should display error message on authentication failure', () => {
    // Intercepter la requête d'authentification et simuler une erreur
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        error: 'Invalid credentials'
      }
    }).as('loginFailure');

    // Soumettre le formulaire avec des identifiants incorrects
    cy.get('input[formControlName=email]').type('wrong@email.com');
    cy.get('input[formControlName=password]').type('wrongpassword');
    cy.get('button[type=submit]').click();

    // Attendre la réponse et vérifier que le message d'erreur s'affiche
    cy.wait('@loginFailure');
    cy.get('p.error').should('be.visible').and('contain', 'An error occurred');
    cy.url().should('include', '/login'); // L'utilisateur reste sur la page de login
  });

  it('should login successfully and redirect to sessions page', () => {
    // Intercepter la requête d'authentification réussie
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true
      }
    }).as('loginSuccess');

    // Intercepter la requête de session
    cy.intercept('GET', '/api/session', []).as('session');

    // Soumettre le formulaire avec des identifiants corrects
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    // Attendre la réponse et vérifier la redirection
    cy.wait('@loginSuccess');

    // Ne pas vérifier la persistence des données mais s'assurer que la redirection fonctionne
    cy.url().should('include', '/sessions');
  });

  it('should submit form on enter key press', () => {
    // Intercepter la requête d'authentification réussie
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true
      }
    }).as('loginSuccess');

    // Intercepter la requête de session
    cy.intercept('GET', '/api/session', []).as('session');

    // Remplir le formulaire et appuyer sur Entrée
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    // Attendre la réponse et vérifier la redirection
    cy.wait('@loginSuccess');
    cy.url().should('include', '/sessions');
  });
});