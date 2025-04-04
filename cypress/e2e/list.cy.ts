describe('Sessions list page', () => {
    beforeEach(() => {
        // Intercepter la requête de connexion
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: {
                token: 'fake-jwt-token',
                id: 1,
                username: 'userName',
                firstName: 'firstName',
                lastName: 'lastName',
                admin: true
            }
        }).as('loginRequest');

        // Intercepter la requête des sessions
        cy.intercept('GET', '/api/session', {
            body: [
                {
                    id: 1,
                    name: 'Yoga Débutant',
                    description: 'Séance idéale pour les débutants',
                    date: '2025-04-15T00:00:00.000Z',
                    teacher_id: 2,
                    users: [1, 2, 3]
                },
                {
                    id: 2,
                    name: 'Yoga Avancé',
                    description: 'Pour les pratiquants expérimentés',
                    date: '2025-04-20T00:00:00.000Z',
                    teacher_id: 2,
                    users: [1, 2]
                }
            ]
        }).as('getSessions');

        // Visiter la page de connexion
        cy.visit('/login');

        // Remplir le formulaire de connexion
        cy.get('input[formControlName="email"]').type('admin@example.com');
        cy.get('input[formControlName="password"]').type('password');

        // Soumettre le formulaire
        cy.get('button[type="submit"]').click();

        // Attendre la requête de connexion
        cy.wait('@loginRequest');

        // Attendre d'être redirigé vers /sessions
        cy.url().should('include', '/sessions');

        // Attendre que les sessions soient chargées
        cy.wait('@getSessions');
    });

    it('should display all yoga sessions from the API', () => {
        // Vérifier que toutes les sessions sont affichées
        cy.get('.item').should('have.length', 2);

        // Vérifier la première session
        cy.get('.item').first().within(() => {
            cy.get('mat-card-title').should('contain.text', 'Yoga Débutant');
            cy.get('mat-card-subtitle').should('contain.text', 'Session on April 15, 2025');
            cy.get('mat-card-content p').should('contain.text', 'Séance idéale pour les débutants');
        });

        // Vérifier la deuxième session
        cy.get('.item').last().within(() => {
            cy.get('mat-card-title').should('contain.text', 'Yoga Avancé');
            cy.get('mat-card-subtitle').should('contain.text', 'Session on April 20, 2025');
            cy.get('mat-card-content p').should('contain.text', 'Pour les pratiquants expérimentés');
        });
    });

    it('should navigate to detail page when detail button is clicked', () => {
        cy.get('.item').first().find('button').contains('Detail').click();
        cy.url().should('include', '/sessions/detail/1');
    });

    it('should navigate to update page when edit button is clicked', () => {
        cy.get('.item').first().find('button').contains('Edit').click();
        cy.url().should('include', '/sessions/update/1');
    });

    it('should not display admin buttons for non-admin users', () => {
        // Réintercepter la requête de connexion pour simuler un utilisateur non-admin
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: {
                token: 'fake-jwt-token',
                id: 2,
                username: 'regularUser',
                firstName: 'User',
                lastName: 'Regular',
                admin: false
            }
        }).as('nonAdminLoginRequest');

        // Revenir à la page de connexion
        cy.visit('/login');

        // Se connecter avec l'utilisateur non-admin
        cy.get('input[formControlName="email"]').type('user@example.com');
        cy.get('input[formControlName="password"]').type('password');
        cy.get('button[type="submit"]').click();

        // Attendre la requête de connexion
        cy.wait('@nonAdminLoginRequest');

        // Attendre d'être redirigé vers /sessions
        cy.url().should('include', '/sessions');

        // Attendre que les sessions soient chargées
        cy.wait('@getSessions');

        // Vérifier que le bouton Create n'est pas visible
        cy.get('button').contains('Create').should('not.exist');

        // Vérifier que les boutons Edit ne sont pas visibles
        cy.get('.item').first().find('button').contains('Edit').should('not.exist');
        cy.get('.item').first().find('button').should('have.length', 1); // Seul le bouton Detail doit être présent
    });
});