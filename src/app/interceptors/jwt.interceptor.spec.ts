import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JwtInterceptor } from './jwt.interceptor';
import { SessionService } from '../services/session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';
import { Router } from '@angular/router';

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
        // S'assurer que l'utilisateur n'est pas connecté
        sessionService.isLogged = false;
        sessionService.sessionInformation = undefined;
        const testUrl = '/api/test';
        const testData = { message: 'Success' };

        httpClient.get(testUrl).subscribe(response => {
            expect(response).toEqual(testData);
        });

        // Vérifier la demande - ne devrait pas avoir d'en-tête Authorization
        const req = httpTestingController.expectOne(testUrl);
        expect(req.request.headers.has('Authorization')).toBeFalsy();

        // Répondre avec mock data
        req.flush(testData);
    });

    it('should add an Authorization header when user is logged in', () => {
        // Simuler un utilisateur connecté
        sessionService.isLogged = true;
        sessionService.sessionInformation = mockSessionInfo;
        const testUrl = '/api/test';
        const testData = { message: 'Success' };

        httpClient.get(testUrl).subscribe(response => {
            expect(response).toEqual(testData);
        });

        // Vérifier la demande - l'en-tête Authorization doit contenir le bon jeton.
        const req = httpTestingController.expectOne(testUrl);
        expect(req.request.headers.has('Authorization')).toBeTruthy();
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');

        // Répondre avec mock data
        req.flush(testData);
    });

    it('should handle multiple requests with the same token', () => {
        // Simuler un utilisateur connecté
        sessionService.isLogged = true;
        sessionService.sessionInformation = mockSessionInfo;


        httpClient.get('/api/data1').subscribe();
        httpClient.get('/api/data2').subscribe();
        httpClient.post('/api/data3', {}).subscribe();

        // Vérifier le JWT header des requêtes
        const req1 = httpTestingController.expectOne('/api/data1');
        const req2 = httpTestingController.expectOne('/api/data2');
        const req3 = httpTestingController.expectOne('/api/data3');

        expect(req1.request.headers.get('Authorization')).toBe('Bearer test-token');
        expect(req2.request.headers.get('Authorization')).toBe('Bearer test-token');
        expect(req3.request.headers.get('Authorization')).toBe('Bearer test-token');

        // Répondre aux requêtes
        req1.flush({});
        req2.flush({});
        req3.flush({});
    });

    it('should handle API requests with different HTTP methods', () => {
        sessionService.isLogged = true;
        sessionService.sessionInformation = mockSessionInfo;

        httpClient.get('/api/resource').subscribe();

        // Tester requêtes GET
        const getReq = httpTestingController.expectOne(req => req.method === 'GET' && req.url === '/api/resource');
        expect(getReq.request.headers.get('Authorization')).toBe('Bearer test-token');
        getReq.flush({});

        httpClient.post('/api/resource', { data: 'test' }).subscribe();

        // Tester requêtes POST
        const postReq = httpTestingController.expectOne(req => req.method === 'POST' && req.url === '/api/resource');
        expect(postReq.request.headers.get('Authorization')).toBe('Bearer test-token');
        postReq.flush({});

        // Tester requêtes PUT
        httpClient.put('/api/resource/1', { data: 'updated' }).subscribe();

        const putReq = httpTestingController.expectOne(req => req.method === 'PUT' && req.url === '/api/resource/1');
        expect(putReq.request.headers.get('Authorization')).toBe('Bearer test-token');
        putReq.flush({});

        // Tester requêtes DELETE
        httpClient.delete('/api/resource/1').subscribe();

        const deleteReq = httpTestingController.expectOne(req => req.method === 'DELETE' && req.url === '/api/resource/1');
        expect(deleteReq.request.headers.get('Authorization')).toBe('Bearer test-token');
        deleteReq.flush({});
    });
});