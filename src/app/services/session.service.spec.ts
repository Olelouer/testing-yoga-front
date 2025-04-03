import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { SessionService } from './session.service';
import { UserService } from './user.service';
import { MeComponent } from '../components/me/me.component';
import { SessionInformation } from '../interfaces/sessionInformation.interface';
import { User } from '../interfaces/user.interface';

describe('SessionService Integration Tests', () => {
  let sessionService: SessionService;
  let userService: UserService;
  let router: Router;
  let snackBar: MatSnackBar;

  const mockSessionInfo: SessionInformation = {
    token: '123456',
    type: 'Bearer',
    id: 1,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    admin: false
  };

  const mockUser: User = {
    id: 1,
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule
      ],
      declarations: [MeComponent],
      providers: [
        SessionService,
        {
          provide: UserService,
          useValue: {
            getById: jest.fn().mockReturnValue(of(mockUser)),
            delete: jest.fn().mockReturnValue(of(mockUser))
          }
        },
        {
          provide: MatSnackBar,
          useValue: {
            open: jest.fn()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Pour ignorer les directives fxLayout
    });

    sessionService = TestBed.inject(SessionService);
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar);

    // Espionner la méthode de navigation
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    // Espionner window.history.back
    jest.spyOn(window.history, 'back').mockImplementation(() => { });
  });

  it('should share login state between components', () => {
    // Créer deux composants qui utilisent le même SessionService
    const fixture1 = TestBed.createComponent(MeComponent);
    const component1 = fixture1.componentInstance;

    const fixture2 = TestBed.createComponent(MeComponent);
    const component2 = fixture2.componentInstance;

    // Par défaut, l'utilisateur n'est pas connecté
    expect(sessionService.isLogged).toBe(false);
    expect(sessionService.sessionInformation).toBeUndefined();

    // Connecter l'utilisateur
    sessionService.logIn(mockSessionInfo);

    // Les deux composants devraient accéder aux mêmes informations de session
    expect(component1['sessionService'].isLogged).toBe(true);
    expect(component1['sessionService'].sessionInformation).toBe(mockSessionInfo);
    expect(component2['sessionService'].isLogged).toBe(true);
    expect(component2['sessionService'].sessionInformation).toBe(mockSessionInfo);
  });

  it('should load user data in MeComponent based on sessionInformation', () => {
    // D'abord connecter l'utilisateur avant de créer le composant
    sessionService.logIn(mockSessionInfo);

    // Créer le composant
    const fixture = TestBed.createComponent(MeComponent);
    const component = fixture.componentInstance;

    // Déclencher ngOnInit
    fixture.detectChanges();

    // Vérifier que le UserService a été appelé avec l'ID correct
    expect(userService.getById).toHaveBeenCalledWith('1');
  });

  it('should handle user deletion and logout in MeComponent', fakeAsync(() => {
    // Configurer la session avant d'initialiser le composant
    sessionService.logIn(mockSessionInfo);

    // Créer le composant
    const fixture = TestBed.createComponent(MeComponent);
    const component = fixture.componentInstance;

    // Déclencher ngOnInit
    fixture.detectChanges();

    // Réinitialiser les espions pour avoir un état propre
    userService.delete = jest.fn().mockImplementation(() => {
      return of(mockUser);
    });

    router.navigate = jest.fn().mockImplementation(() => Promise.resolve(true));

    // Simuler la suppression du compte
    component.delete();

    // Forcer l'exécution des callbacks asynchrones
    tick();

    // Vérifier que le UserService.delete a été appelé
    expect(userService.delete).toHaveBeenCalledWith('1');

    // Vérifier la redirection (après que les callbacks asynchrones aient été exécutés)
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should propagate login state changes to multiple subscribers', () => {
    // Observer arrays to record values
    const values1: boolean[] = [];
    const values2: boolean[] = [];

    // Subscribe to logged-in state
    const sub1 = sessionService.$isLogged().subscribe(value => values1.push(value));
    const sub2 = sessionService.$isLogged().subscribe(value => values2.push(value));

    // Initial state should be false
    expect(values1).toEqual([false]);
    expect(values2).toEqual([false]);

    // Log in
    sessionService.logIn(mockSessionInfo);

    // Both subscribers should receive true
    expect(values1).toEqual([false, true]);
    expect(values2).toEqual([false, true]);

    // Log out
    sessionService.logOut();

    // Both subscribers should receive false again
    expect(values1).toEqual([false, true, false]);
    expect(values2).toEqual([false, true, false]);

    // Clean up subscriptions
    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('should maintain session across route navigation', () => {
    // Configurer la session
    sessionService.logIn(mockSessionInfo);

    // Simuler la navigation vers une autre route puis retour
    router.navigate(['/sessions']);

    // Vérifier que l'état de la session est préservé
    expect(sessionService.isLogged).toBe(true);
    expect(sessionService.sessionInformation).toBe(mockSessionInfo);

    // Créer le composant après navigation
    const fixture = TestBed.createComponent(MeComponent);
    const component = fixture.componentInstance;

    // Déclencher ngOnInit
    fixture.detectChanges();

    // Le composant devrait toujours avoir accès à la session
    expect(userService.getById).toHaveBeenCalledWith('1');
  });

  it('should update UI when session state changes', () => {
    // D'abord créer le composant sans connecter l'utilisateur
    const fixture = TestBed.createComponent(MeComponent);

    // Réinitialiser les mocks
    userService.getById = jest.fn().mockReturnValue(of(mockUser));

    // Maintenant connecter l'utilisateur
    sessionService.logIn(mockSessionInfo);

    // Puis déclencher ngOnInit
    fixture.detectChanges();

    // Vérifier que getById a été appelé
    expect(userService.getById).toHaveBeenCalledWith('1');
  });

  it('should properly handle session login/logout cycles', () => {
    // Vérifier l'état initial
    expect(sessionService.isLogged).toBe(false);
    expect(sessionService.sessionInformation).toBeUndefined();

    // Premier cycle: login
    sessionService.logIn(mockSessionInfo);
    expect(sessionService.isLogged).toBe(true);
    expect(sessionService.sessionInformation).toBe(mockSessionInfo);

    // Premier cycle: logout
    sessionService.logOut();
    expect(sessionService.isLogged).toBe(false);
    expect(sessionService.sessionInformation).toBeUndefined();

    // Deuxième cycle: login
    sessionService.logIn(mockSessionInfo);
    expect(sessionService.isLogged).toBe(true);
    expect(sessionService.sessionInformation).toBe(mockSessionInfo);

    // Deuxième cycle: logout
    sessionService.logOut();
    expect(sessionService.isLogged).toBe(false);
    expect(sessionService.sessionInformation).toBeUndefined();
  });
});