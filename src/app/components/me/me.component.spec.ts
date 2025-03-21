import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';
import { MeComponent } from './me.component';

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let userService: UserService;
  let sessionService: SessionService;
  let matSnackBar: MatSnackBar;
  let router: Router;

  // Mock services
  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1
    },
    logOut: jest.fn()
  };

  const mockUserService = {
    getById: jest.fn(),
    delete: jest.fn()
  };

  const mockSnackBar = {
    open: jest.fn()
  };

  const mockRouter = {
    navigate: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeComponent],
      imports: [
        MatSnackBarModule,
        HttpClientModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: UserService, useValue: mockUserService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: Router, useValue: mockRouter }
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    sessionService = TestBed.inject(SessionService);
    matSnackBar = TestBed.inject(MatSnackBar);
    router = TestBed.inject(Router);

    // Reset mocks between tests
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', () => {
    // Mock user data
    const mockUser = { id: 1, name: 'Test User' };
    mockUserService.getById.mockReturnValue(of(mockUser));

    // Call ngOnInit
    component.ngOnInit();

    // Check service was called with correct ID
    expect(mockUserService.getById).toHaveBeenCalledWith('1');

    // Check user data was set
    expect(component.user).toEqual(mockUser);
  });

  it('should call window.history.back()', () => {
    const historyBackSpy = jest.spyOn(window.history, 'back');
    component.back();
    expect(historyBackSpy).toHaveBeenCalled();
  });

  it('should delete user account', () => {
    // Mock successful delete response
    mockUserService.delete.mockReturnValue(of({}));

    // Call delete method
    component.delete();

    // Check service was called with correct ID
    expect(mockUserService.delete).toHaveBeenCalledWith('1');

    // Check snackbar was shown
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      "Your account has been deleted !",
      'Close',
      { duration: 3000 }
    );

    // Check user was logged out
    expect(mockSessionService.logOut).toHaveBeenCalled();

    // Check navigation to home page
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});