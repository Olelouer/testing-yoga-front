import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JwtInterceptor } from './jwt.interceptor';
import { SessionService } from '../services/session.service';
import { Router } from '@angular/router';

// Interface complète pour SessionInformation
interface SessionInformation {
    token: string;
    type: string;
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    admin: boolean;
}

describe('JwtInterceptor Integration Tests', () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;
    let sessionService: SessionService;
    let router: Router;

    // Créer un objet SessionInformation complet
    const mockSessionInfo: SessionInformation = {
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        admin: false
    };

    beforeEach(() => {
        const routerMock = {
            navigate: jest.fn()
        };

        // Créer un mock SessionService avec le typage correct
        const sessionServiceMock = {
            isLogged: false,
            sessionInformation: undefined as SessionInformation | undefined
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
                { provide: SessionService, useValue: sessionServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        });

        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
        sessionService = TestBed.inject(SessionService);
        router = TestBed.inject(Router);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should not add an Authorization header when user is not logged in', () => {
        // Arrange - ensure user is not logged in
        sessionService.isLogged = false;
        sessionService.sessionInformation = undefined;
        const testUrl = '/api/test';
        const testData = { message: 'Success' };

        // Act - make HTTP request
        httpClient.get(testUrl).subscribe(response => {
            // Assert
            expect(response).toEqual(testData);
        });

        // Verify request - should not have Authorization header
        const req = httpTestingController.expectOne(testUrl);
        expect(req.request.headers.has('Authorization')).toBeFalsy();

        // Respond with mock data
        req.flush(testData);
    });

    it('should add an Authorization header when user is logged in', () => {
        // Arrange - simulate logged in user
        sessionService.isLogged = true;
        sessionService.sessionInformation = mockSessionInfo;
        const testUrl = '/api/test';
        const testData = { message: 'Success' };

        // Act - make HTTP request
        httpClient.get(testUrl).subscribe(response => {
            // Assert
            expect(response).toEqual(testData);
        });

        // Verify request - should have Authorization header with correct token
        const req = httpTestingController.expectOne(testUrl);
        expect(req.request.headers.has('Authorization')).toBeTruthy();
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');

        // Respond with mock data
        req.flush(testData);
    });

    it('should handle multiple requests with the same token', () => {
        // Arrange - simulate logged in user
        sessionService.isLogged = true;
        sessionService.sessionInformation = mockSessionInfo;

        // Act - make multiple HTTP requests
        httpClient.get('/api/data1').subscribe();
        httpClient.get('/api/data2').subscribe();
        httpClient.post('/api/data3', {}).subscribe();

        // Verify all requests have JWT header
        const req1 = httpTestingController.expectOne('/api/data1');
        const req2 = httpTestingController.expectOne('/api/data2');
        const req3 = httpTestingController.expectOne('/api/data3');

        expect(req1.request.headers.get('Authorization')).toBe('Bearer test-token');
        expect(req2.request.headers.get('Authorization')).toBe('Bearer test-token');
        expect(req3.request.headers.get('Authorization')).toBe('Bearer test-token');

        // Respond to all requests
        req1.flush({});
        req2.flush({});
        req3.flush({});
    });

    it('should handle 401 Unauthorized responses properly', () => {
        // Arrange - simulate logged in user with potentially invalid token
        const expiredSessionInfo = {
            ...mockSessionInfo,
            token: 'expired-token'
        };

        sessionService.isLogged = true;
        sessionService.sessionInformation = expiredSessionInfo;
        const testUrl = '/api/protected';

        // Act - make HTTP request that will return 401
        httpClient.get(testUrl).subscribe(
            () => fail('should have failed with 401 error'),
            (error) => {
                // Assert
                expect(error.status).toBe(401);
                // In a real implementation, you might have logic to handle 401 responses
            }
        );

        // Simulate 401 response
        const req = httpTestingController.expectOne(testUrl);
        expect(req.request.headers.get('Authorization')).toBe('Bearer expired-token');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle API requests with different HTTP methods', () => {
        // Arrange
        sessionService.isLogged = true;
        sessionService.sessionInformation = mockSessionInfo;

        // Act - make request with GET method
        httpClient.get('/api/resource').subscribe();

        // Assert - verify GET request
        const getReq = httpTestingController.expectOne(req => req.method === 'GET' && req.url === '/api/resource');
        expect(getReq.request.headers.get('Authorization')).toBe('Bearer test-token');
        getReq.flush({});

        // Act - make request with POST method
        httpClient.post('/api/resource', { data: 'test' }).subscribe();

        // Assert - verify POST request
        const postReq = httpTestingController.expectOne(req => req.method === 'POST' && req.url === '/api/resource');
        expect(postReq.request.headers.get('Authorization')).toBe('Bearer test-token');
        postReq.flush({});

        // Act - make request with PUT method
        httpClient.put('/api/resource/1', { data: 'updated' }).subscribe();

        // Assert - verify PUT request
        const putReq = httpTestingController.expectOne(req => req.method === 'PUT' && req.url === '/api/resource/1');
        expect(putReq.request.headers.get('Authorization')).toBe('Bearer test-token');
        putReq.flush({});

        // Act - make request with DELETE method
        httpClient.delete('/api/resource/1').subscribe();

        // Assert - verify DELETE request
        const deleteReq = httpTestingController.expectOne(req => req.method === 'DELETE' && req.url === '/api/resource/1');
        expect(deleteReq.request.headers.get('Authorization')).toBe('Bearer test-token');
        deleteReq.flush({});
    });
});