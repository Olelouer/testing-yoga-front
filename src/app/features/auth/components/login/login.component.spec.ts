import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { SessionService } from 'src/app/services/session.service';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: { login: jest.Mock };
  let mockRouter: { navigate: jest.Mock };
  let mockSessionService: { logIn: jest.Mock };

  const mockLoginResponse: SessionInformation = {
    token: 'fake-token',
    type: 'user',
    id: 1,
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false
  };

  beforeEach(async () => {
    // Create mock services
    mockAuthService = {
      login: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn()
    };

    mockSessionService = {
      logIn: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: SessionService, useValue: mockSessionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call login service and navigate to sessions on successful login', () => {
    // Mock successful login response
    mockAuthService.login.mockReturnValue(of(mockLoginResponse));

    // Set form values
    component.form.setValue({
      email: 'test@example.com',
      password: 'password123'
    });

    // Call submit method
    component.submit();

    // Verify auth service was called with correct login request
    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });

    // Verify session service was called with the response
    expect(mockSessionService.logIn).toHaveBeenCalledWith(mockLoginResponse);

    // Verify router navigation
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sessions']);

    // Verify error flag wasn't set
    expect(component.onError).toBe(false);
  });

  it('should set onError flag to true when login fails', () => {
    // Mock failed login response
    mockAuthService.login.mockReturnValue(throwError(() => new Error('Login failed')));

    // Set form values
    component.form.setValue({
      email: 'test@example.com',
      password: 'wrong-password'
    });

    // Call submit method
    component.submit();

    // Verify auth service was called
    expect(mockAuthService.login).toHaveBeenCalled();

    // Verify session service was NOT called
    expect(mockSessionService.logIn).not.toHaveBeenCalled();

    // Verify router was NOT called
    expect(mockRouter.navigate).not.toHaveBeenCalled();

    // Verify error flag was set
    expect(component.onError).toBe(true);
  });
});
