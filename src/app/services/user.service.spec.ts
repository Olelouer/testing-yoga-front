import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { MeComponent } from '../components/me/me.component';
import { UserService } from './user.service';
import { SessionService } from './session.service';
import { User } from '../interfaces/user.interface';
import { SessionInformation } from '../interfaces/sessionInformation.interface';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserService Integration Tests avec MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let httpTestingController: HttpTestingController;
  let userService: UserService;
  let sessionService: SessionService;
  let router: Router;
  const pathService = 'api/user';

  // Données de test
  const mockUser: User = {
    id: 1,
    email: 'john.doe@example.com',
    lastName: 'Doe',
    firstName: 'John',
    admin: false,
    password: 'password123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-15'),
  };

  const mockAdminUser: User = {
    ...mockUser,
    admin: true
  };

  const mockSessionInfo: SessionInformation = {
    id: 1,
    username: 'john.doe',
    firstName: 'John',
    lastName: 'Doe',
    token: 'fake-jwt-token',
    type: 'Bearer',
    admin: false
  };

  beforeEach(async () => {
    // Configurer le module de test
    await TestBed.configureTestingModule({
      declarations: [MeComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        NoopAnimationsModule
      ],
      providers: [
        UserService,
        {
          provide: SessionService,
          useValue: {
            sessionInformation: mockSessionInfo,
            isLogged: true,
            logOut: jest.fn()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Pour les directives fxLayout
    }).compileComponents();

    // Injecter les services
    httpTestingController = TestBed.inject(HttpTestingController);
    userService = TestBed.inject(UserService);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);

    // Créer le composant
    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Vérifier qu'il n'y a pas de requêtes HTTP restantes
    httpTestingController.verify();
  });

  it('should load user data when component initializes', () => {
    // Espionner la méthode de navigation
    jest.spyOn(router, 'navigate');

    // Déclencher ngOnInit
    fixture.detectChanges();

    // Vérifier qu'une requête GET est effectuée pour obtenir les informations utilisateur
    const req = httpTestingController.expectOne(`${pathService}/1`);
    expect(req.request.method).toBe('GET');

    // Simuler la réponse
    req.flush(mockUser);

    // Mettre à jour la vue
    fixture.detectChanges();

    // Vérifier que les données utilisateur sont affichées correctement
    const nameElement = fixture.debugElement.query(By.css('p')).nativeElement;
    expect(nameElement.textContent).toContain('Name: John DOE');

    // Vérifier que le bouton de suppression est présent pour les utilisateurs non admin
    const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
    expect(deleteButton).toBeTruthy();
  });

  it('should show different view for admin users', () => {
    // Déclencher ngOnInit
    fixture.detectChanges();

    // Intercepter la requête HTTP
    const req = httpTestingController.expectOne(`${pathService}/1`);

    // Répondre avec les données d'un admin
    req.flush(mockAdminUser);

    // Mettre à jour la vue
    fixture.detectChanges();

    // Vérifier que le message admin est affiché
    const adminMessage = fixture.debugElement.query(By.css('p.my2'));
    expect(adminMessage.nativeElement.textContent).toContain('You are admin');

    // Vérifier que le bouton de suppression n'est pas affiché pour les admins
    const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
    expect(deleteButton).toBeFalsy();
  });

  it('should delete user account and redirect to home', () => {
    // Espionner les méthodes du sessionService et router
    jest.spyOn(sessionService, 'logOut');
    jest.spyOn(router, 'navigate');
    jest.spyOn(window.history, 'back').mockImplementation(() => { });

    // Déclencher ngOnInit
    fixture.detectChanges();

    // Intercepter la requête HTTP de chargement d'utilisateur
    const getUserReq = httpTestingController.expectOne(`${pathService}/1`);
    getUserReq.flush(mockUser);

    // Mettre à jour la vue
    fixture.detectChanges();

    // Trouver et cliquer sur le bouton de suppression
    const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
    deleteButton.triggerEventHandler('click', null);

    // Intercepter la requête HTTP de suppression
    const deleteReq = httpTestingController.expectOne(`${pathService}/1`);
    expect(deleteReq.request.method).toBe('DELETE');

    // Simuler une réponse réussie
    deleteReq.flush(mockUser);

    // Vérifier que les méthodes appropriées ont été appelées
    expect(sessionService.logOut).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate back when back button is clicked', () => {
    // Espionner window.history.back
    jest.spyOn(window.history, 'back').mockImplementation(() => { });

    // Déclencher ngOnInit
    fixture.detectChanges();

    // Intercepter la requête HTTP
    const req = httpTestingController.expectOne(`${pathService}/1`);
    req.flush(mockUser);

    // Mettre à jour la vue
    fixture.detectChanges();

    // Trouver et cliquer sur le bouton de retour
    const backButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
    backButton.triggerEventHandler('click', null);

    // Vérifier que la méthode back a été appelée
    expect(window.history.back).toHaveBeenCalled();
  });

  it('should handle errors when loading user data', () => {
    // Espionner console.error pour éviter les logs d'erreur
    jest.spyOn(console, 'error').mockImplementation(() => { });

    // Déclencher ngOnInit
    fixture.detectChanges();

    // Intercepter la requête HTTP
    const req = httpTestingController.expectOne(`${pathService}/1`);

    // Simuler une erreur 500
    req.flush('Server error', { status: 500, statusText: 'Server Error' });

    // Mettre à jour la vue
    fixture.detectChanges();

    // Vérifier que l'utilisateur n'est pas défini
    expect(component.user).toBeUndefined();
  });

  it('should handle errors when deleting user account', () => {
    // Espionner console.error et les méthodes du service
    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(sessionService, 'logOut');
    jest.spyOn(router, 'navigate');

    // Déclencher ngOnInit
    fixture.detectChanges();

    // Intercepter la requête HTTP de chargement d'utilisateur
    const getUserReq = httpTestingController.expectOne(`${pathService}/1`);
    getUserReq.flush(mockUser);

    // Mettre à jour la vue
    fixture.detectChanges();

    // Trouver et cliquer sur le bouton de suppression
    const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
    deleteButton.triggerEventHandler('click', null);

    // Intercepter la requête HTTP de suppression
    const deleteReq = httpTestingController.expectOne(`${pathService}/1`);

    // Simuler une erreur 403
    deleteReq.flush('Permission denied', { status: 403, statusText: 'Forbidden' });

    // Vérifier que les méthodes de déconnexion et navigation n'ont pas été appelées
    expect(sessionService.logOut).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should make appropriate service calls', () => {
    // Espionner les méthodes du service pour voir si elles sont appelées correctement
    jest.spyOn(userService, 'getById').mockImplementation((id) => {
      return userService['httpClient'].get<User>(`${pathService}/${id}`);
    });

    jest.spyOn(userService, 'delete').mockImplementation((id) => {
      return userService['httpClient'].delete<User>(`${pathService}/${id}`);
    });

    // Déclencher ngOnInit
    fixture.detectChanges();

    // Intercepter la requête HTTP
    const req = httpTestingController.expectOne(`${pathService}/1`);
    req.flush(mockUser);

    // Vérifier que getById a été appelé
    expect(userService.getById).toHaveBeenCalledWith('1');

    // Simuler un clic sur le bouton de suppression
    component.delete();

    // Intercepter la requête HTTP de suppression
    const deleteReq = httpTestingController.expectOne(`${pathService}/1`);
    deleteReq.flush(mockUser);

    // Vérifier que delete a été appelé
    expect(userService.delete).toHaveBeenCalledWith('1');
  });
});