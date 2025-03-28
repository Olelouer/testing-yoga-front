describe('Me Component', () => {
  beforeEach(() => {
    // Intercepter la requête de connexion
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgQWRtaW4iLCJhZG1pbiI6dHJ1ZX0.nt7secBKEhJ2FgxXwzMjXqF9lZh5TScYc9-eqemSuW0',
        id: 1,
        username: 'userName',
        firstName: 'John',
        lastName: 'Doe',
        admin: true
      }
    }).as('loginRequest');

    // Visiter la page de connexion
    cy.visit('/login');

    // Remplir le formulaire de connexion
    cy.get('input[formControlName="email"]').type('john.doe@example.com');
    cy.get('input[formControlName="password"]').type('password');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la requête de connexion
    cy.wait('@loginRequest');

    // Vérifier que nous sommes sur la page des sessions
    cy.url().should('include', '/sessions');
  });

  it('should display admin user information correctly', () => {
    // Intercepter la requête de l'utilisateur admin
    cy.intercept('GET', '/api/user/1', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'john.doe@example.com',
        lastName: 'Doe',
        firstName: 'John',
        admin: true,
        password: 'hashedPassword',
        createdAt: '2025-01-15T14:30:00.000Z',
        updatedAt: '2025-02-20T10:15:00.000Z'
      }
    }).as('getAdminUserRequest');

    // Naviguer vers la page /me
    cy.get('span.link[routerlink="me"]').click();

    // Vérifier l'URL
    cy.url().should('include', '/me');

    // Attendre que les données utilisateur soient chargées
    cy.wait('@getAdminUserRequest');

    // Vérifier le contenu pour un admin
    cy.get('mat-card-title h1').should('contain.text', 'User information');
    cy.get('mat-card-content p').first().should('contain.text', 'Name: John DOE');
    cy.get('mat-card-content p').eq(1).should('contain.text', 'Email: john.doe@example.com');
    cy.get('mat-card-content p').eq(2).should('contain.text', 'You are admin');

    // Vérifier que le bouton de suppression n'est pas visible pour les admins
    cy.contains('Delete my account').should('not.exist');

    // Vérifier les dates
    cy.contains('Create at:').should('be.visible');
    cy.contains('Last update:').should('be.visible');
  });

  it('should handle back button correctly', () => {
    // Intercepter la requête de l'utilisateur
    cy.intercept('GET', '/api/user/1', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'john.doe@example.com',
        lastName: 'Doe',
        firstName: 'John',
        admin: true,
        password: 'hashedPassword',
        createdAt: '2025-01-15T14:30:00.000Z',
        updatedAt: '2025-02-20T10:15:00.000Z'
      }
    }).as('getUserRequest');

    // Naviguer vers la page /me
    cy.get('span.link[routerlink="me"]').click();
    cy.wait('@getUserRequest');

    // Espionner window.history.back
    cy.window().then((win) => {
      cy.spy(win.history, 'back').as('historyBack');
    });

    // Cliquer sur le bouton "Back"
    cy.get('button mat-icon').contains('arrow_back').parent().click();

    // Vérifier que window.history.back a été appelé
    cy.get('@historyBack').should('have.been.called');
  });

  it('should display non-admin user information and handle delete', () => {
    // Intercepter la requête de connexion pour un non-admin
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImFkbWluIjpmYWxzZX0.MKqlrW0qgXjg2Ac-I8ZSwJXCshDKJIE1bEIXaT_T1CQ',
        id: 1,
        username: 'regularUser',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      }
    }).as('loginNonAdminRequest');

    // Intercepter la requête de l'utilisateur non-admin
    cy.intercept('GET', '/api/user/1', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'john.doe@example.com',
        lastName: 'Doe',
        firstName: 'John',
        admin: false,
        password: 'hashedPassword',
        createdAt: '2025-01-15T14:30:00.000Z',
        updatedAt: '2025-02-20T10:15:00.000Z'
      }
    }).as('getNonAdminUserRequest');

    // Intercepter TOUTES les requêtes DELETE
    cy.intercept('DELETE', '/api/**', {
      statusCode: 200,
      body: {}
    }).as('deleteRequest');

    // Revenir à la page de login et se connecter en tant que non-admin
    cy.visit('/login');
    cy.get('input[formControlName="email"]').type('john.doe@example.com');
    cy.get('input[formControlName="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginNonAdminRequest');

    // Naviguer vers la page /me
    cy.get('span.link[routerlink="me"]').click();

    // Attendre que les données utilisateur soient chargées
    cy.wait('@getNonAdminUserRequest');

    // Vérifier le contenu pour un non-admin
    cy.get('mat-card-title h1').should('contain.text', 'User information');
    cy.get('mat-card-content p').first().should('contain.text', 'Name: John DOE');
    cy.get('mat-card-content p').eq(1).should('contain.text', 'Email: john.doe@example.com');

    // Vérifier que le message "You are admin" n'apparaît pas
    cy.contains('You are admin').should('not.exist');

    // Vérifier que le bouton de suppression est visible
    cy.contains('button', 'Delete my account').should('be.visible');

    // Cliquer sur le bouton de suppression
    cy.get('button[mat-raised-button][color="warn"]').click();

    // Attendre la requête de suppression avec un délai plus long
    cy.wait('@deleteRequest', { timeout: 10000 });

    // Vérifier la redirection vers la page d'accueil
    cy.url().should('include', '/');
  });
});