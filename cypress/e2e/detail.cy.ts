describe('Session Detail Component', () => {
    // Configuration commune
    const setupSessionData = {
        id: 1,
        name: 'Yoga Débutant',
        description: 'Séance idéale pour les débutants',
        date: '2025-04-15T00:00:00.000Z',
        teacher_id: 2,
        users: [2, 3, 4], // L'utilisateur actuel (id:1) n'y participe pas par défaut
        createdAt: '2024-12-10T00:00:00.000Z',
        updatedAt: '2025-01-15T00:00:00.000Z'
    };

    const teacherData = {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com'
    };

    // Configuration de base avant chaque test
    beforeEach(() => {
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

        // Intercepter la requête de détail de session - configuration de base
        cy.intercept('GET', '/api/session/1', {
            statusCode: 200,
            body: setupSessionData
        }).as('getSessionDetail');

        // Intercepter la requête de détail de professeur
        cy.intercept('GET', '/api/teacher/2', {
            statusCode: 200,
            body: teacherData
        }).as('getTeacherDetail');

        // Se connecter et naviguer vers la page des sessions
        cy.visit('/login');
        cy.get('input[formControlName="email"]').type('admin@example.com');
        cy.get('input[formControlName="password"]').type('password');
        cy.get('button[type="submit"]').click();
        cy.wait('@loginRequest');
        cy.url().should('include', '/sessions');
        cy.wait('@getSessions');
    });

    it('should display session details correctly', () => {
        // Naviguer vers la page de détail
        cy.get('.item').first().find('button').contains('Detail').click();
        cy.url().should('include', '/sessions/detail/1');
        cy.wait('@getSessionDetail');
        cy.wait('@getTeacherDetail');

        // Vérifier les éléments d'interface
        cy.get('h1').should('contain.text', 'Yoga Débutant');
        cy.get('mat-card-subtitle').should('contain.text', 'Jane SMITH');
        cy.get('img.picture').should('have.attr', 'src', 'assets/sessions.png');
        cy.get('mat-card-content').should('contain.text', 'Séance idéale pour les débutants');
        cy.get('mat-card-content').should('contain.text', '3 attendees');
        cy.get('mat-card-content').should('contain.text', 'April 15, 2025');
        cy.get('.created').should('contain.text', 'Create at:');
        cy.get('.updated').should('contain.text', 'Last update:');
    });

    it('should navigate back when back button is clicked', () => {
        // Naviguer vers la page de détail
        cy.get('.item').first().find('button').contains('Detail').click();
        cy.wait('@getSessionDetail');
        cy.wait('@getTeacherDetail');

        // Espionner window.history.back
        cy.window().then((win) => {
            cy.spy(win.history, 'back').as('historyBack');
        });

        // Cliquer sur le bouton back
        cy.get('button mat-icon').contains('arrow_back').parent().click();

        // Vérifier que window.history.back a été appelé
        cy.get('@historyBack').should('have.been.called');
    });

    it('should handle delete functionality for admin users', () => {
        // Intercepter la requête de suppression
        cy.intercept('DELETE', '/api/session/1', {
            statusCode: 200,
            body: {}
        }).as('deleteSession');

        // Naviguer vers la page de détail
        cy.get('.item').first().find('button').contains('Detail').click();
        cy.wait('@getSessionDetail');
        cy.wait('@getTeacherDetail');

        // Vérifier que le bouton Delete est visible pour les admins
        cy.contains('Delete').should('be.visible');

        // Cliquer sur le bouton Delete
        cy.contains('Delete').click();

        // Attendre la requête de suppression
        cy.wait('@deleteSession');

        // Vérifier le message de confirmation
        cy.contains('Session deleted !').should('be.visible');

        // Vérifier la redirection vers la page des sessions
        cy.url().should('include', '/sessions');
    });

    it('should show participate button for non-admin users not participating', () => {
        // IMPORTANT: Définir d'abord les intercepteurs avant de se connecter

        // Intercepter la requête de connexion pour un non-admin
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImFkbWluIjpmYWxzZX0.MKqlrW0qgXjg2Ac-I8ZSwJXCshDKJIE1bEIXaT_T1CQ',
                id: 1,
                username: 'regularUser',
                firstName: 'Regular',
                lastName: 'User',
                admin: false
            }
        }).as('loginNonAdminRequest');

        // Retourner à la page de login et se connecter en tant que non-admin
        cy.visit('/login');
        cy.get('input[formControlName="email"]').type('user@example.com');
        cy.get('input[formControlName="password"]').type('password');
        cy.get('button[type="submit"]').click();
        cy.wait('@loginNonAdminRequest');
        cy.wait('@getSessions');

        // Naviguer vers la page de détail
        cy.get('.item').first().find('button').contains('Detail').click();
        cy.wait('@getSessionDetail');
        cy.wait('@getTeacherDetail');

        // Vérifier que le bouton Delete n'est pas visible
        cy.contains('Delete').should('not.exist');

        // Vérifier que le bouton Participate est visible
        cy.contains('Participate').should('be.visible');
    });

    it('should handle participate functionality', () => {
        // IMPORTANT: Définir d'abord les intercepteurs avant de se connecter

        // Intercepter la requête de connexion pour un non-admin
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImFkbWluIjpmYWxzZX0.MKqlrW0qgXjg2Ac-I8ZSwJXCshDKJIE1bEIXaT_T1CQ',
                id: 1,
                username: 'regularUser',
                firstName: 'Regular',
                lastName: 'User',
                admin: false
            }
        }).as('loginNonAdminRequest');

        // Intercepter la requête de participation
        cy.intercept('POST', '/api/session/1/participate/1', {
            statusCode: 200,
            body: {}
        }).as('participateRequest');

        // Retourner à la page de login et se connecter en tant que non-admin
        cy.visit('/login');
        cy.get('input[formControlName="email"]').type('user@example.com');
        cy.get('input[formControlName="password"]').type('password');
        cy.get('button[type="submit"]').click();
        cy.wait('@loginNonAdminRequest');
        cy.wait('@getSessions');

        // Naviguer vers la page de détail
        cy.get('.item').first().find('button').contains('Detail').click();
        cy.wait('@getSessionDetail');
        cy.wait('@getTeacherDetail');

        // Réintercepter pour le rafraîchissement après participation
        cy.intercept('GET', '/api/session/1', {
            statusCode: 200,
            body: {
                ...setupSessionData,
                users: [...setupSessionData.users, 1] // Ajouter l'utilisateur actuel
            }
        }).as('getUpdatedSessionDetail');

        // Cliquer sur le bouton Participate
        cy.contains('Participate').click();

        // Attendre la requête de participation
        cy.wait('@participateRequest');
        cy.wait('@getUpdatedSessionDetail');

        // Vérifier que le bouton a changé à "Do not participate"
        cy.contains('Do not participate').should('be.visible');

        // Vérifier que le nombre de participants a augmenté
        cy.contains('4 attendees').should('be.visible');
    });

    it('should handle unparticipate functionality', () => {
        // IMPORTANT: Définir d'abord les intercepteurs avant de se connecter

        // Intercepter la requête de connexion pour un non-admin
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImFkbWluIjpmYWxzZX0.MKqlrW0qgXjg2Ac-I8ZSwJXCshDKJIE1bEIXaT_T1CQ',
                id: 1,
                username: 'regularUser',
                firstName: 'Regular',
                lastName: 'User',
                admin: false
            }
        }).as('loginNonAdminRequest');

        // Intercepter la requête de détail avec l'utilisateur déjà inscrit
        cy.intercept('GET', '/api/session/1', {
            statusCode: 200,
            body: {
                ...setupSessionData,
                users: [...setupSessionData.users, 1] // L'utilisateur actuel participe déjà
            }
        }).as('getSessionDetail');

        // Intercepter la requête de désinscription
        cy.intercept('DELETE', '/api/session/1/participate/1', {
            statusCode: 200,
            body: {}
        }).as('unParticipateRequest');

        // Retourner à la page de login et se connecter en tant que non-admin
        cy.visit('/login');
        cy.get('input[formControlName="email"]').type('user@example.com');
        cy.get('input[formControlName="password"]').type('password');
        cy.get('button[type="submit"]').click();
        cy.wait('@loginNonAdminRequest');
        cy.wait('@getSessions');

        // Naviguer vers la page de détail
        cy.get('.item').first().find('button').contains('Detail').click();
        cy.wait('@getSessionDetail');
        cy.wait('@getTeacherDetail');

        // Vérifier que le bouton "Do not participate" est visible
        cy.contains('Do not participate').should('be.visible');

        // Réintercepter pour le rafraîchissement après désinscription
        cy.intercept('GET', '/api/session/1', {
            statusCode: 200,
            body: setupSessionData // Revenir à l'état initial
        }).as('getUpdatedSessionAfterUnParticipate');

        // Cliquer sur le bouton "Do not participate"
        cy.contains('Do not participate').click();

        // Attendre la requête de désinscription
        cy.wait('@unParticipateRequest');
        cy.wait('@getUpdatedSessionAfterUnParticipate');

        // Vérifier que le bouton a changé à "Participate"
        cy.contains('Participate').should('be.visible');

        // Vérifier que le nombre de participants a diminué
        cy.contains('3 attendees').should('be.visible');
    });
});