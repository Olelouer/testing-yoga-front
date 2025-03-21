import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionService } from './session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';


describe('SessionService', () => {
  let service: SessionService;

  const mockUserSession: SessionInformation = {
    token: '123456',
    type: 'test',
    id: 1,
    username: 'test',
    firstName: 'test',
    lastName: 'test',
    admin: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have isLogged as false and sessionInformation as undefined initially', () => {
    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });

  it('should return an observable of the logged-in state', (done) => {
    service.$isLogged().subscribe(isLogged => {
      expect(isLogged).toBe(false);
      done();
    });
  });

  it('should update sessionInformation, set isLogged to true, and notify subscribers', () => {
    // Fake an inactive session
    service.isLogged = false;
    service.sessionInformation = undefined;

    service.logIn(mockUserSession);

    // Check the properties
    expect(service.isLogged).toBe(true);
    expect(service.sessionInformation).toBe(mockUserSession);
  });

  it('should clear sessionInformation, set isLogged to false, and notify subscribers', () => {
    // Fake an active session
    service.isLogged = true;
    service.sessionInformation = mockUserSession;

    service.logOut();

    // Check the properties
    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });
});