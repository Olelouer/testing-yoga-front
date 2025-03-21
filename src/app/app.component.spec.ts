import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './features/auth/services/auth.service';
import { SessionService } from './services/session.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let sessionService: SessionService;
  let router: Router;

  // Create mock services
  const sessionServiceMock = {
    $isLogged: jest.fn(),
    logOut: jest.fn()
  };

  const authServiceMock = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatToolbarModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);

    // Reset mocks between tests
    jest.clearAllMocks();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should check if user is logged in', () => {
    // Mock the return value
    sessionServiceMock.$isLogged.mockReturnValue(of(true));

    // Call the method
    const result = component.$isLogged();

    // Verify the service was called
    expect(sessionServiceMock.$isLogged).toHaveBeenCalled();

    // Check the result
    let isLoggedIn: boolean | undefined;
    result.subscribe(value => {
      isLoggedIn = value;
    });

    expect(isLoggedIn).toBe(true);
  });

  it('should log out and navigate to home page', () => {
    // Spy on router navigation
    const navigateSpy = jest.spyOn(router, 'navigate');

    // Call the logout method
    component.logout();

    // Verify service method was called
    expect(sessionServiceMock.logOut).toHaveBeenCalled();

    // Verify navigation occurred
    expect(navigateSpy).toHaveBeenCalledWith(['']);
  });
});