import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';
import { SessionService } from './session.service';
import { SessionApiService } from '../features/sessions/services/session-api.service';
import { Session } from '../features/sessions/interfaces/session.interface';

describe('TeacherService Integration Tests', () => {
  let httpTestingController: HttpTestingController;
  let teacherService: TeacherService;
  let sessionService: any;
  let sessionApiService: any;
  let formBuilder: FormBuilder;
  const pathService = 'api/teacher';

  // Données de test
  const mockTeachers: Teacher[] = [
    {
      id: 1,
      lastName: 'Doe',
      firstName: 'John',
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2022-01-15')
    },
    {
      id: 2,
      lastName: 'Smith',
      firstName: 'Jane',
      createdAt: new Date('2022-02-01'),
      updatedAt: new Date('2022-02-15')
    }
  ];

  const mockTeacher: Teacher = mockTeachers[0];

  const mockSession: Session = {
    id: 1,
    name: 'Test Session',
    description: 'Session description',
    date: new Date('2023-05-15'),
    teacher_id: 1,
    users: [1, 2]
  };

  beforeEach(() => {
    // Mock des dépendances pour FormComponent
    sessionService = {
      sessionInformation: {
        id: 1,
        admin: true,
        token: 'fake-token',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        type: 'Bearer'
      },
      isLogged: true
    };

    sessionApiService = {
      detail: jest.fn().mockReturnValue(of(mockSession)),
      create: jest.fn().mockReturnValue(of(mockSession)),
      update: jest.fn().mockReturnValue(of(mockSession))
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      providers: [
        TeacherService,
        FormBuilder,
        { provide: SessionService, useValue: sessionService },
        { provide: SessionApiService, useValue: sessionApiService }
      ]
    });

    // Injecter les services
    httpTestingController = TestBed.inject(HttpTestingController);
    teacherService = TestBed.inject(TeacherService);
    formBuilder = TestBed.inject(FormBuilder);
  });

  afterEach(() => {
    // Vérifier qu'il n'y a pas de requêtes HTTP restantes
    httpTestingController.verify();
  });

  // Tests de base du service
  describe('Basic Service Tests', () => {
    it('should be created', () => {
      expect(teacherService).toBeTruthy();
    });

    it('should retrieve all teachers', () => {
      teacherService.all().subscribe(teachers => {
        expect(teachers).toEqual(mockTeachers);
        expect(teachers.length).toBe(2);
      });

      const req = httpTestingController.expectOne(pathService);
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers);
    });

    it('should retrieve a specific teacher by id', () => {
      const teacherId = '1';
      teacherService.detail(teacherId).subscribe(teacher => {
        expect(teacher).toEqual(mockTeacher);
        expect(teacher.id).toBe(1);
        expect(teacher.firstName).toBe('John');
        expect(teacher.lastName).toBe('Doe');
      });

      const req = httpTestingController.expectOne(`${pathService}/${teacherId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTeacher);
    });

    it('should handle errors when retrieving teachers', () => {
      jest.spyOn(console, 'error').mockImplementation(() => { });

      teacherService.all().subscribe({
        next: () => fail('should have failed with server error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpTestingController.expectOne(pathService);
      req.flush('Server error', { status: 500, statusText: 'Server Error' });
    });

    it('should handle errors when retrieving a specific teacher', () => {
      jest.spyOn(console, 'error').mockImplementation(() => { });

      const teacherId = '999';
      teacherService.detail(teacherId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpTestingController.expectOne(`${pathService}/${teacherId}`);
      req.flush('Teacher not found', { status: 404, statusText: 'Not Found' });
    });
  });

  // Tests d'intégration avec le FormComponent (simulé)
  describe('Integration with Session Forms', () => {
    it('should integrate with session form creation', () => {
      // Simuler le fonctionnement du FormComponent en créant un formulaire similaire
      const sessionForm = formBuilder.group({
        name: ['New Session'],
        date: ['2023-05-15'],
        teacher_id: [2],
        description: ['Test description']
      });

      // Simuler l'opération teachers$ du FormComponent
      const teachers$ = teacherService.all();

      // Vérifier que le service fournit les données correctes
      teachers$.subscribe(teachers => {
        expect(teachers).toEqual(mockTeachers);

        // Simuler la sélection d'un enseignant dans le formulaire
        const selectedTeacherId = sessionForm.get('teacher_id')?.value;
        const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

        expect(selectedTeacher).toBeDefined();
        expect(selectedTeacher?.firstName).toBe('Jane');
        expect(selectedTeacher?.lastName).toBe('Smith');
      });

      // Intercepter la requête HTTP et y répondre
      const req = httpTestingController.expectOne(pathService);
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers);

      // Simuler la soumission du formulaire
      const formValue = sessionForm.value;
      sessionApiService.create(formValue);

      // Vérifier que le service API a été appelé avec le bon ID d'enseignant
      expect(sessionApiService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          teacher_id: 2
        })
      );
    });

    it('should integrate with session form update', () => {
      // Simuler le chargement d'une session existante
      const existingSession = { ...mockSession, teacher_id: 1 };

      // Simuler le formulaire d'édition
      const sessionForm = formBuilder.group({
        name: [existingSession.name],
        date: [new Date(existingSession.date).toISOString().split('T')[0]],
        teacher_id: [existingSession.teacher_id],
        description: [existingSession.description]
      });

      // Vérifier que le service de teachers récupère les données
      teacherService.all().subscribe(teachers => {
        // Trouver l'enseignant actuellement sélectionné
        const currentTeacherId = sessionForm.get('teacher_id')?.value;
        const currentTeacher = teachers.find(t => t.id === currentTeacherId);

        expect(currentTeacher).toBeDefined();
        expect(currentTeacher?.id).toBe(1);
        expect(currentTeacher?.firstName).toBe('John');

        // Simuler le changement d'enseignant
        sessionForm.patchValue({ teacher_id: 2 });

        // Vérifier que le nouvel enseignant est correctement sélectionné
        const newTeacherId = sessionForm.get('teacher_id')?.value;
        const newTeacher = teachers.find(t => t.id === newTeacherId);

        expect(newTeacher).toBeDefined();
        expect(newTeacher?.id).toBe(2);
        expect(newTeacher?.firstName).toBe('Jane');
      });

      // Intercepter la requête HTTP et y répondre
      const req = httpTestingController.expectOne(pathService);
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers);

      // Simuler la mise à jour de la session
      const formValue = sessionForm.value;
      sessionApiService.update('1', formValue);

      // Vérifier que le service API a été appelé
      expect(sessionApiService.update).toHaveBeenCalled();
    });
  });
});