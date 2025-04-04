describe('Register page', () => {
    beforeEach(() => {
        // Visiter la page d'inscription avant chaque test
        cy.visit('/register');
    });

    it('should display register form correctly', () => {
        // Vérifier que tous les éléments du formulaire sont présents
        cy.get('mat-card-title').should('contain', 'Register');
        cy.get('input[formControlName=firstName]').should('be.visible');
        cy.get('input[formControlName=lastName]').should('be.visible');
        cy.get('input[formControlName=email]').should('be.visible');
        cy.get('input[formControlName=password]').should('be.visible');
        cy.get('button[type=submit]').should('be.visible').and('contain', 'Submit');
        cy.get('button[type=submit]').should('be.disabled'); // Le bouton devrait être désactivé au départ
    });

    it('should validate email format', () => {
        // Remplir tous les champs sauf email
        cy.get('input[formControlName=firstName]').type('John');
        cy.get('input[formControlName=lastName]').type('Doe');
        cy.get('input[formControlName=password]').type('password123');

        // Tester avec un email invalide
        cy.get('input[formControlName=email]').type('invalid-email');
        cy.get('button[type=submit]').should('be.disabled');

        // Corriger l'email
        cy.get('input[formControlName=email]').clear().type('valid@email.com');
        cy.get('button[type=submit]').should('be.enabled');
    });

    it('should display error message when registration fails', () => {
        // Intercepter la requête d'inscription et simuler une erreur
        cy.intercept('POST', '/api/auth/register', {
            statusCode: 400,
            body: {
                error: 'Registration failed'
            }
        }).as('registerFailure');

        // Remplir le formulaire
        cy.get('input[formControlName=firstName]').type('John');
        cy.get('input[formControlName=lastName]').type('Doe');
        cy.get('input[formControlName=email]').type('existing@example.com');
        cy.get('input[formControlName=password]').type('password123');
        cy.get('button[type=submit]').click();

        // Attendre la réponse et vérifier que le message d'erreur s'affiche
        cy.wait('@registerFailure');
        cy.get('span.error').should('be.visible').and('contain', 'An error occurred');
        cy.url().should('include', '/register'); // L'utilisateur reste sur la page d'inscription
    });

    it('should register successfully and redirect to login page', () => {
        // Intercepter la requête d'inscription réussie
        cy.intercept('POST', '/api/auth/register', {
            statusCode: 201,
            body: {}
        }).as('registerSuccess');

        // Remplir le formulaire
        cy.get('input[formControlName=firstName]').type('John');
        cy.get('input[formControlName=lastName]').type('Doe');
        cy.get('input[formControlName=email]').type('new.user@example.com');
        cy.get('input[formControlName=password]').type('password123');
        cy.get('button[type=submit]').click();

        // Attendre la réponse et vérifier la redirection
        cy.wait('@registerSuccess');
        cy.url().should('include', '/login');
    });
});