import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

import { LoginRequest } from '../interfaces/loginRequest.interface';
import { RegisterRequest } from '../interfaces/registerRequest.interface';

describe('SessionsService', () => {
    let service: AuthService;

    const mockRegister: RegisterRequest = {
        email: 'test@test.com',
        firstName: 'test',
        lastName: 'test',
        password: '1232456',
    }

    const mockLogin: LoginRequest = {
        email: 'test@test.com',
        password: '1232456',
    }

    const pathService = 'api/auth';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule
            ]
        });
        service = TestBed.inject(AuthService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should register a new user', (done) => {
        // Mock HTTP response to avoid real network calls during testing
        const httpSpy = jest.spyOn(service['httpClient'], 'post').mockReturnValue(
            new Observable((observer) => {
                observer.next(mockRegister);
                observer.complete();
            })
        )

        service.register(mockRegister).subscribe(register => {
            expect(register).toEqual(mockRegister);
            expect(httpSpy).toHaveBeenCalledWith(`${pathService}/register`, register)
            done();
        })
    });

    it('should authenticate a user', (done) => {
        // Mock HTTP response to avoid real network calls during testing
        const httpSpy = jest.spyOn(service['httpClient'], 'post').mockReturnValue(
            new Observable((observer) => {
                observer.next(mockLogin);
                observer.complete();
            })
        )

        service.login(mockLogin).subscribe(login => {
            expect(login).toEqual(mockLogin);
            expect(httpSpy).toHaveBeenCalledWith(`${pathService}/login`, login)
            done();
        })
    });
});
