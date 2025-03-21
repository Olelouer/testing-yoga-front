import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { SessionService } from '../services/session.service';

describe('AuthGuard', () => {
    let authGuard: AuthGuard;
    let sessionService: { isLogged: boolean };
    let router: Router;

    beforeEach(() => {
        // Création de mocks avec Jest
        sessionService = { isLogged: false };

        TestBed.configureTestingModule({
            providers: [
                AuthGuard,
                { provide: SessionService, useValue: sessionService },
            ],
        });

        authGuard = TestBed.inject(AuthGuard);
        router = TestBed.inject(Router);
    });

    /**
     * Test canActivate function
     */
    it('should allow access if the user is logged in', () => {
        const navigateSpy = jest.spyOn(router, 'navigate');
        sessionService.isLogged = true;

        expect(authGuard.canActivate()).toBe(true);
        expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should redirect to /login if the user is not logged in', () => {
        const navigateSpy = jest.spyOn(router, 'navigate');
        sessionService.isLogged = false;

        expect(authGuard.canActivate()).toBe(false);
        expect(navigateSpy).toHaveBeenCalledWith(['login']);
    });
});
