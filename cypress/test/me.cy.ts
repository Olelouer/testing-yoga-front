describe('List Component', () => {
  beforeEach(() => {
    // Configuration des mocks pour les sessions avec le champ users
    cy.intercept('GET', '/api/session', {
      body: [
        {
          id: 1,
          name: 'Yoga for Beginners',
          description: 'A gentle introduction to yoga practices.',
          date: '2023-06-15T10:00:00.000Z',
          teacher_id: 1,
          users: [1, 2, 5],
          createdAt: '2023-01-15T08:00:00.000Z',
          updatedAt: '2023-01-20T10:30:00.000Z'
        },
        {
          id: 2,
          name: 'Advanced Meditation',
          description: 'Deep meditation techniques for experienced practitioners.',
          date: '2023-06-20T14:00:00.000Z',
          teacher_id: 2,
          users: [3, 4],
          createdAt: '2023-02-05T09:15:00.000Z',
          updatedAt: '2023-02-10T11:45:00.000Z'
        },
        {
          id: 3,
          name: 'Flexibility Focus',
          description: 'Improve your flexibility with these targeted poses.',
          date: '2023-06-25T16:30:00.000Z',
          teacher_id: 1,
          users: [1, 6, 7, 8],
          createdAt: '2023-03-12T15:20:00.000Z',
          updatedAt: '2023-03-18T08:10:00.000Z'
        }
      ]
    }).as('getSessions');
  });

  describe('For regular users', () => {
    beforeEach(() => {
      // Configuration d'un utilisateur non-admin
      cy.window().then((win) => {
        win.localStorage.setItem('session', JSON.stringify({
          id: 10,
          username: 'regularuser',
          firstName: 'Regular',
          lastName: 'User',
          admin: false
        }));
      });

      // Accéder à la page des sessions
      cy.visit('/sessions');
      cy.wait('@getSessions');
    });

    it('should display the list of sessions correctly', () => {
      // Vérifier le titre
      cy.contains('Yoga sessions available').should('be.visible');

      // Vérifier qu'il y a 3 sessions affichées
      cy.get('.item').should('have.length', 3);

      // Vérifier le contenu des sessions
      cy.contains('Yoga for Beginners').should('be.visible');
      cy.contains('Advanced Meditation').should('be.visible');
      cy.contains('Flexibility Focus').should('be.visible');

      // Vérifier les dates
      cy.contains('Session on').should('be.visible');

      // Vérifier les images
      cy.get('img.picture').should('have.length', 3);
      cy.get('img.picture').first().should('have.attr', 'src', 'assets/sessions.png');
      cy.get('img.picture').first().should('have.attr', 'alt', 'Yoga session');

      // Vérifier les descriptions
      cy.contains('A gentle introduction to yoga practices.').should('be.visible');
      cy.contains('Deep meditation techniques for experienced practitioners.').should('be.visible');
      cy.contains('Improve your flexibility with these targeted poses.').should('be.visible');

      // Vérifier les boutons
      cy.contains('button', 'Detail').should('have.length', 3);
    });

    it('should NOT show create and edit buttons for regular users', () => {
      // Le bouton Create ne doit pas être visible
      cy.contains('button', 'Create').should('not.exist');

      // Les boutons Edit ne doivent pas être visibles
      cy.contains('button', 'Edit').should('not.exist');
    });

    it('should navigate to session detail when clicking Detail button', () => {
      // Cliquer sur le premier bouton Detail
      cy.contains('button', 'Detail').first().click();

      // Vérifier la navigation vers la page de détail
      cy.url().should('include', '/sessions/detail/1');
    });
  });

  describe('For admin users', () => {
    beforeEach(() => {
      // Configuration d'un utilisateur admin
      cy.window().then((win) => {
        win.localStorage.setItem('session', JSON.stringify({
          id: 1,
          username: 'adminuser',
          firstName: 'Admin',
          lastName: 'User',
          admin: true
        }));
      });

      // Accéder à la page des sessions
      cy.visit('/sessions');
      cy.wait('@getSessions');
    });

    it('should show create button for admin users', () => {
      // Le bouton Create doit être visible
      cy.contains('button', 'Create').should('be.visible');
    });

    it('should show edit buttons for admin users', () => {
      // Les boutons Edit doivent être visibles
      cy.contains('button', 'Edit').should('have.length', 3);
    });

    it('should navigate to create session page when clicking Create button', () => {
      // Cliquer sur le bouton Create
      cy.contains('button', 'Create').click();

      // Vérifier la navigation vers la page de création
      cy.url().should('include', '/sessions/create');
    });

    it('should navigate to update session page when clicking Edit button', () => {
      // Cliquer sur le premier bouton Edit
      cy.contains('button', 'Edit').first().click();

      // Vérifier la navigation vers la page de mise à jour
      cy.url().should('include', '/sessions/update/1');
    });
  });
});