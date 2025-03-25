describe('Not Found page', () => {
    it('should display not found page when accessing invalid route', () => {
        // Visiter une route qui n'existe pas
        cy.visit('/route-inexistante');

        // Vérifier que le titre "Page not found !" est affiché
        cy.get('h1').should('be.visible').and('contain', 'Page not found !');
    });
});