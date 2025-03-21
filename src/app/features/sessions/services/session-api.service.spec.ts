import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { Observable } from 'rxjs';

import { SessionApiService } from './session-api.service';
import { Session } from '../interfaces/session.interface';

describe('SessionsService', () => {
  let service: SessionApiService;

  const mockSession: Session = {
    id: 1,
    name: 'test',
    description: 'test',
    date: new Date(),
    teacher_id: 1,
    users: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockSessions: Session[] = [
    mockSession,
    {
      id: 2,
      name: 'test2',
      description: 'test2',
      date: new Date(),
      teacher_id: 2,
      users: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]

  const pathService = 'api/session';
  const sessionId = '1';
  const userId = '1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ]
    });
    service = TestBed.inject(SessionApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all sessions', (done) => {
    // Mock HTTP response to avoid real network calls during testing
    const httpSpy = jest.spyOn(service['httpClient'], 'get').mockReturnValue(
      new Observable((observer) => {
        observer.next(mockSessions);
        observer.complete();
      })
    )

    service.all().subscribe(sessions => {
      expect(sessions).toEqual(mockSessions);
      expect(httpSpy).toHaveBeenCalledWith(`${pathService}`)
      done();
    })
  });

  it('should get a sessions by id', (done) => {
    // Mock HTTP response to avoid real network calls during testing
    const httpSpy = jest.spyOn(service['httpClient'], 'get').mockReturnValue(
      new Observable((observer) => {
        observer.next(mockSession);
        observer.complete();
      })
    )

    service.detail(sessionId).subscribe(session => {
      expect(session).toEqual(mockSession);
      expect(httpSpy).toHaveBeenCalledWith(`${pathService}/${sessionId}`)
      done();
    })
  });

  it('should delete a session by id', (done) => {
    // Mock HTTP response to avoid real network calls during testing
    const httpSpy = jest.spyOn(service['httpClient'], 'delete').mockReturnValue(
      new Observable((observer) => {
        observer.next(mockSession);
        observer.complete();
      })
    )

    service.delete(sessionId).subscribe(session => {
      expect(session).toEqual(mockSession);
      expect(httpSpy).toHaveBeenCalledWith(`${pathService}/${sessionId}`)
      done();
    })
  });

  it('should create a session', (done) => {
    // Mock HTTP response to avoid real network calls during testing
    const httpSpy = jest.spyOn(service['httpClient'], 'post').mockReturnValue(
      new Observable((observer) => {
        observer.next(mockSession);
        observer.complete();
      })
    )

    service.create(mockSession).subscribe(session => {
      expect(session).toEqual(mockSession);
      expect(httpSpy).toHaveBeenCalledWith(`${pathService}`, mockSession)
      done();
    })
  });

  it('should update a session', (done) => {
    // Mock HTTP response to avoid real network calls during testing
    const httpSpy = jest.spyOn(service['httpClient'], 'put').mockReturnValue(
      new Observable((observer) => {
        observer.next(mockSession);
        observer.complete();
      })
    )

    service.update(sessionId, mockSession).subscribe(session => {
      expect(session).toEqual(mockSession);
      expect(httpSpy).toHaveBeenCalledWith(`${pathService}/${sessionId}`, mockSession)
      done();
    })
  });

  it('should add a participant to a session', (done) => {
    // Mock HTTP response to avoid real network calls during testing
    const httpSpy = jest.spyOn(service['httpClient'], 'post').mockReturnValue(
      new Observable((observer) => {
        observer.next(undefined);
        observer.complete();
      })
    )

    service.participate(sessionId, userId).subscribe(() => {
      expect(httpSpy).toHaveBeenCalledWith(`${pathService}/${sessionId}/participate/${userId}`, null)
      done();
    })
  });

  it('should remove a participant from a session', (done) => {
    // Mock HTTP response to avoid real network calls during testing
    const httpSpy = jest.spyOn(service['httpClient'], 'delete').mockReturnValue(
      new Observable((observer) => {
        observer.next(undefined);
        observer.complete();
      })
    )

    service.unParticipate(sessionId, userId).subscribe(() => {
      expect(httpSpy).toHaveBeenCalledWith(`${pathService}/${sessionId}/participate/${userId}`)
      done();
    })
  });
});
