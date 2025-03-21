import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';
import { Observable } from 'rxjs';

describe('TeacherService', () => {
  let service: TeacherService;
  const pathService = 'api/teacher';

  const mockTeacher: Teacher = {
    id: 1,
    lastName: 'test',
    firstName: 'test',
    createdAt: new Date,
    updatedAt: new Date,
  }

  const mockTeachers: Teacher[] = [
    mockTeacher,
    {
      id: 2,
      lastName: 'test2',
      firstName: 'test2',
      createdAt: new Date,
      updatedAt: new Date,
    }
  ]

  const teacherId = mockTeacher.id.toString();


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ]
    });
    service = TestBed.inject(TeacherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all teachers', (done) => {
    // Mock HTTP response to avoid real network calls during testing
    const httpSpy = jest.spyOn(service['httpClient'], 'get').mockReturnValue(
      new Observable(observer => {
        observer.next(mockTeachers);
        observer.complete();
      })
    );

    service.all().subscribe(teachers => {
      expect(teachers).toEqual(mockTeachers);
      expect(httpSpy).toHaveBeenCalledWith(`${pathService}`)
      done();
    });
  });

  it('should retrive a teacher by id', (done) => {
    // Mock HTTP response to avoid real network calls during testing
    const httpSpy = jest.spyOn(service['httpClient'], 'get').mockReturnValue(
      new Observable(observer => {
        observer.next(mockTeacher);
        observer.complete();
      })
    );

    service.detail(teacherId).subscribe(teacher => {
      expect(teacher).toEqual(mockTeacher);
      expect(httpSpy).toHaveBeenCalledWith(`${pathService}/${teacherId}`);
      done();
    })
  });
});
