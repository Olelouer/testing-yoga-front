import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  // Mock services
  const authServiceMock = {
    register: jest.fn()
  };

  const routerMock = {
    navigate: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    // Reset mocks
    jest.clearAllMocks();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to login on successful registration', () => {
    // Fill form with test data
    component.form.setValue({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });

    // Mock successful registration
    authServiceMock.register.mockReturnValue(of(undefined));

    // Submit form
    component.submit();

    // Check auth service called
    expect(authServiceMock.register).toHaveBeenCalled();

    // Check navigation
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should set onError flag when registration fails', () => {
    // Fill form with test data
    component.form.setValue({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });

    // Mock failed registration
    authServiceMock.register.mockReturnValue(throwError(() => new Error('Registration failed')));

    // Submit form
    component.submit();

    // Error flag should be true
    expect(component.onError).toBeTruthy();
  });
});