import { HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SessionService } from '../services/session.service';
import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
    let interceptor: JwtInterceptor;
    let sessionService: any;
    let httpHandler: any;

    beforeEach(() => {
        // Mock SessionService
        sessionService = {
            isLogged: false,
            sessionInformation: null
        };

        // Mock HttpHandler
        httpHandler = {
            handle: jest.fn().mockReturnValue(of('response'))
        };

        TestBed.configureTestingModule({
            providers: [
                JwtInterceptor,
                { provide: SessionService, useValue: sessionService }
            ]
        });

        interceptor = TestBed.inject(JwtInterceptor);
    });

    it('should be created', () => {
        expect(interceptor).toBeTruthy();
    });

    /**
     * Test intercept function
     */
    it('should not add token when user is not logged in', () => {
        // Create a simple request
        const request = new HttpRequest('GET', '/api/test');

        // Mock to avoid cloning the request
        request.clone = jest.fn().mockReturnValue(request);

        interceptor.intercept(request, httpHandler);

        // Verify that clone was not called
        expect(request.clone).not.toHaveBeenCalled();
        expect(httpHandler.handle).toHaveBeenCalledWith(request);
    });

    it('should add token when user is logged in', () => {
        // Configure the service to simulate a logged in user
        sessionService.isLogged = true;
        sessionService.sessionInformation = { token: 'test-token' };

        // Create a simple request
        const request = new HttpRequest('GET', '/api/test');

        // Create a mocked clone of the request
        const clonedRequest = new HttpRequest('GET', '/api/test');

        // Mock the clone method to return the cloned request
        request.clone = jest.fn().mockReturnValue(clonedRequest);

        interceptor.intercept(request, httpHandler);

        // Verify that clone was called with the correct headers
        expect(request.clone).toHaveBeenCalledWith({
            setHeaders: {
                Authorization: 'Bearer test-token'
            }
        });

        // Verify that the handler was called with the cloned request
        expect(httpHandler.handle).toHaveBeenCalledWith(clonedRequest);
    });
});