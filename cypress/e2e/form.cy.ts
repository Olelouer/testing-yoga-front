describe('Session Form Workflow', () => {
    const teachersData = [
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com'
        }
    ];

    const sessionData = {
        id: 1,
        name: 'Yoga Débutant',
        description: 'Séance idéale pour les débutants',
        date: '2025-04-15T00:00:00.000Z',
        teacher_id: 2,
        users: [2, 3, 4],
        createdAt: '2024-12-10T00:00:00.000Z',
        updatedAt: '2025-01-15T00:00:00.000Z'
    };

    beforeEach(() => {
        // Intercepter la requête de connexion pour un admin
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgQWRtaW4iLCJhZG1pbiI6dHJ1ZX0.nt7secBKEhJ2FgxXwzMjXqF9lZh5TScYc9-eqemSuW0',
                id: 1,
                username: 'adminUser',
                firstName: 'Admin',
                lastName: 'User',
                admin: true
            }
        }).as('loginRequest');

        // Intercepter la requête des sessions
        cy.intercept('GET', '/api/session', {
            statusCode: 200,
            body: [
                {
                    id: 1,
                    name: 'Yoga Débutant',
                    description: 'Séance idéale pour les débutants',
                    date: '2025-04-15T00:00:00.000Z',
                    teacher_id: 2,
                    users: [2, 3, 4]
                },
                {
                    id: 2,
                    name: 'Yoga Avancé',
                    description: 'Pour les pratiquants expérimentés',
                    date: '2025-04-20T00:00:00.000Z',
                    teacher_id: 2,
                    users: [2, 3]
                }
            ]
        }).as('getSessions');

        // Intercepter la requête des enseignants
        cy.intercept('GET', '/api/teacher', {
            statusCode: 200,
            body: teachersData
        }).as('getTeachers');

        // Se connecter et aller à la page des sessions
        cy.visit('/login');
        cy.get('input[formControlName="email"]').type('admin@example.com');
        cy.get('input[formControlName="password"]').type('password');
        cy.get('button[type="submit"]').click();
        cy.wait('@loginRequest');
        cy.url().should('include', '/sessions');
        cy.wait('@getSessions');
    });

    it('should navigate to create form and display it correctly', () => {
        // Cliquer sur le bouton Create
        cy.get('button[routerLink="create"]').contains('Create').click();

        // Vérifier que nous sommes sur la page de création
        cy.url().should('include', '/sessions/create');

        // Attendre que les enseignants soient chargés
        cy.wait('@getTeachers');

        // Vérifier que le formulaire est affiché correctement
        cy.get('h1').should('contain.text', 'Create session');
        cy.get('form').should('be.visible');
        cy.get('input[formControlName="name"]').should('be.visible');
        cy.get('input[formControlName="date"]').should('be.visible');
        cy.get('mat-select[formControlName="teacher_id"]').should('be.visible');
        cy.get('textarea[formControlName="description"]').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible').and('be.disabled');
    });

    it('should create a new session successfully', () => {
        // Intercepter la requête de création
        cy.intercept('POST', '/api/session', {
            statusCode: 201,
            body: {
                id: 3,
                name: 'New Yoga Class',
                description: 'A brand new yoga class',
                date: '2025-05-01T00:00:00.000Z',
                teacher_id: 1,
                users: [],
                createdAt: '2025-03-28T00:00:00.000Z',
                updatedAt: '2025-03-28T00:00:00.000Z'
            }
        }).as('createSession');

        // Aller à la page de création
        cy.get('button[routerLink="create"]').contains('Create').click();
        cy.url().should('include', '/sessions/create');
        cy.wait('@getTeachers');

        // Remplir le formulaire
        cy.get('input[formControlName="name"]').type('New Yoga Class');
        cy.get('input[formControlName="date"]').type('2025-05-01');

        // Sélectionner un enseignant
        cy.get('mat-select[formControlName="teacher_id"]').click();
        cy.get('mat-option').first().click();

        cy.get('textarea[formControlName="description"]').type('A brand new yoga class');

        // Vérifier que le bouton est activé
        cy.get('button[type="submit"]').should('not.be.disabled');

        // Soumettre le formulaire
        cy.get('button[type="submit"]').click();

        // Attendre la requête de création
        cy.wait('@createSession');

        // Vérifier le message de succès
        cy.contains('Session created !').should('be.visible');

        // Vérifier la redirection vers la page des sessions
        cy.url().should('include', '/sessions');
        cy.url().should('not.include', '/create');
    });

    it('should navigate to update form and display it correctly', () => {
        // Intercepter la requête de détail
        cy.intercept('GET', '/api/session/1', {
            statusCode: 200,
            body: sessionData
        }).as('getSessionDetail');

        // Cliquer sur le bouton Edit de la première session
        cy.get('.item').first().contains('Edit').click();

        // Vérifier que nous sommes sur la page de mise à jour
        cy.url().should('include', '/sessions/update/1');

        // Attendre les requêtes nécessaires
        cy.wait('@getSessionDetail');
        cy.wait('@getTeachers');

        // Vérifier que le formulaire est affiché correctement
        cy.get('h1').should('contain.text', 'Update session');
        cy.get('input[formControlName="name"]').should('have.value', 'Yoga Débutant');
        cy.get('textarea[formControlName="description"]').should('have.value', 'Séance idéale pour les débutants');
    });

    it('should update a session successfully', () => {
        // Intercepter la requête de détail
        cy.intercept('GET', '/api/session/1', {
            statusCode: 200,
            body: sessionData
        }).as('getSessionDetail');

        // Intercepter la requête de mise à jour
        cy.intercept('PUT', '/api/session/1', {
            statusCode: 200,
            body: {
                ...sessionData,
                name: 'Updated Yoga Class',
                description: 'This description has been updated'
            }
        }).as('updateSession');

        // Cliquer sur le bouton Edit de la première session
        cy.get('.item').first().contains('Edit').click();
        cy.url().should('include', '/sessions/update/1');
        cy.wait('@getSessionDetail');
        cy.wait('@getTeachers');

        // Modifier le formulaire
        cy.get('input[formControlName="name"]').clear().type('Updated Yoga Class');
        cy.get('textarea[formControlName="description"]').clear().type('This description has been updated');

        // Soumettre le formulaire
        cy.get('button[type="submit"]').click();

        // Attendre la requête de mise à jour
        cy.wait('@updateSession');

        // Vérifier le message de succès
        cy.contains('Session updated !').should('be.visible');

        // Vérifier la redirection vers la page des sessions
        cy.url().should('include', '/sessions');
        cy.url().should('not.include', '/update');
    });

    it('should navigate back when back button is clicked', () => {
        // Aller à la page de création
        cy.get('button[routerLink="create"]').contains('Create').click();
        cy.url().should('include', '/sessions/create');

        // Cliquer sur le bouton back
        cy.get('button[routerLink="/sessions"]').click();

        // Vérifier la redirection en étant plus souple sur le format de l'URL
        cy.url().should('include', '/sessions');
        cy.url().should('not.include', '/create');
    });

    it('should properly validate form fields', () => {
        // Aller à la page de création
        cy.get('button[routerLink="create"]').contains('Create').click();
        cy.url().should('include', '/sessions/create');
        cy.wait('@getTeachers');

        // Le bouton devrait être désactivé au début
        cy.get('button[type="submit"]').should('be.disabled');

        // Remplir partiellement le formulaire
        cy.get('input[formControlName="name"]').type('Test Session');
        cy.get('button[type="submit"]').should('be.disabled');

        cy.get('input[formControlName="date"]').type('2025-05-01');
        cy.get('button[type="submit"]').should('be.disabled');

        // Sélectionner un enseignant
        cy.get('mat-select[formControlName="teacher_id"]').click();
        cy.get('mat-option').first().click();
        cy.get('button[type="submit"]').should('be.disabled');

        // Ajouter une description
        cy.get('textarea[formControlName="description"]').type('Test description');

        // Le bouton devrait être activé maintenant
        cy.get('button[type="submit"]').should('not.be.disabled');

        // Vider un champ pour vérifier la validation
        cy.get('input[formControlName="name"]').clear();
        cy.get('button[type="submit"]').should('be.disabled');
    });
});