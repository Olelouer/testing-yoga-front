import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UnauthGuard } from './unauth.guard';
import { SessionService } from '../services/session.service';

describe('UnauthGuard', () => {
    let unauthGuard: UnauthGuard;
    let sessionService: { isLogged: boolean };
    let router: Router;

    beforeEach(() => {
        // Création de mocks avec Jest
        sessionService = { isLogged: false };

        TestBed.configureTestingModule({
            providers: [
                UnauthGuard,
                { provide: SessionService, useValue: sessionService },
            ],
        });

        unauthGuard = TestBed.inject(UnauthGuard);
        router = TestBed.inject(Router);
    });

    /**
     * Test canActivate function
     */
    it('should redirect to /rentals if the user is logged in', () => {
        const navigateSpy = jest.spyOn(router, 'navigate');
        sessionService.isLogged = true;

        expect(unauthGuard.canActivate()).toBe(false);
        expect(navigateSpy).toHaveBeenCalledWith(['rentals']);
    });

    it('sshould allow access if the user is not logged in', () => {
        sessionService.isLogged = false;

        expect(unauthGuard.canActivate()).toBe(true);
    });
});
