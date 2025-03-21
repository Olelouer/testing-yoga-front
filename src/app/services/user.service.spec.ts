import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';
import { Observable } from 'rxjs';

describe('UserService', () => {
  let service: UserService;

  const mockUser: User = {
    id: 1,
    email: 'test@test.com',
    lastName: 'test',
    firstName: 'test',
    admin: true,
    password: 'test',
    createdAt: new Date,
    updatedAt: new Date,
  }

  const pathService = 'api/user';
  const userId = mockUser.id.toString();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ]
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve a user by id', (done) => {
    // Mock HTTP response to avoid real network calls during testing
    const httpSpy = jest.spyOn(service['httpClient'], 'get').mockReturnValue(
      new Observable((observer) => {
        observer.next(mockUser);
        observer.complete();
      })
    );

    service.getById(userId).subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(httpSpy).toHaveBeenCalledWith(`${pathService}/${userId}`);
      done();
    });
  });

  it('should delete a user by id', (done) => {
    // Mock HTTP response to avoid real network calls during testing
    const httpSpy = jest.spyOn(service['httpClient'], 'delete').mockReturnValue(
      new Observable((observer) => {
        observer.next(mockUser);
        observer.complete();
      })
    )

    service.delete(userId).subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(httpSpy).toHaveBeenCalledWith(`${pathService}/${userId}`)
      done();
    })
  });
});
