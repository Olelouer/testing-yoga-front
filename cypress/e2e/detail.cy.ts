describe('Session Detail Navigation', () => {
    it('should login and navigate to detail page through UI', () => {
        // Intercepter la requête de connexion
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgQWRtaW4iLCJhZG1pbiI6dHJ1ZX0.nt7secBKEhJ2FgxXwzMjXqF9lZh5TScYc9-eqemSuW0',
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

        // Intercepter la requête de détail de session
        cy.intercept('GET', '/api/session/1', {
            statusCode: 200,
            body: {
                id: 1,
                name: 'Yoga Débutant',
                description: 'Séance idéale pour les débutants',
                date: '2025-04-15T00:00:00.000Z',
                teacher_id: 2,
                users: [1, 2, 3],
                createdAt: '2024-12-10T00:00:00.000Z',
                updatedAt: '2025-01-15T00:00:00.000Z'
            }
        }).as('getSessionDetail');

        // Intercepter la requête de détail de professeur
        cy.intercept('GET', '/api/teacher/2', {
            statusCode: 200,
            body: {
                id: 2,
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com'
            }
        }).as('getTeacherDetail');

        // Visiter la page de connexion
        cy.visit('/login');

        // Remplir le formulaire de connexion
        cy.get('input[formControlName="email"]').type('admin@example.com');
        cy.get('input[formControlName="password"]').type('password');

        // Soumettre le formulaire
        cy.get('button[type="submit"]').click();

        // Attendre la requête de connexion
        cy.wait('@loginRequest');

        // Vérifier que nous sommes bien sur la page des sessions
        cy.url().should('include', '/sessions');

        // Attendre que les sessions soient chargées
        cy.wait('@getSessions');

        // Log pour le débogage
        cy.log('Sessions chargées, tentative de cliquer sur le bouton Detail');

        // Cliquer sur le bouton "Detail" de la première session
        cy.get('.item').first().find('button').contains('Detail').click();

        // Vérifier que l'URL a bien changé
        cy.url().should('include', '/sessions/detail/1');

        // Attendre que les détails soient chargés
        cy.wait('@getSessionDetail');
        cy.wait('@getTeacherDetail');

        // Vérifier un élément basique pour confirmer que la page est chargée
        cy.get('img.picture').should('exist');
    });
});