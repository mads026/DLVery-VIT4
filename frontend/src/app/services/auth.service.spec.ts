import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, RegisterRequest, AuthResponse, User } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const mockLoginRequest: LoginRequest = {
    username: 'testuser',
    password: 'password123'
  };

  const mockRegisterRequest: RegisterRequest = {
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    fullName: 'New User'
  };

  const mockAuthResponse: AuthResponse = {
    token: 'mock-jwt-token',
    username: 'testuser',
    email: 'test@example.com',
    role: 'INV_TEAM',
    message: 'Login successful'
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loginInventoryTeam', () => {
    it('should login inventory team user', () => {
      service.loginInventoryTeam(mockLoginRequest).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/auth/inventory/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);
      req.flush(mockAuthResponse);
    });

    it('should handle login error', () => {
      service.loginInventoryTeam(mockLoginRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/auth/inventory/login');
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('registerInventoryTeam', () => {
    it('should register inventory team user successfully', () => {
      service.registerInventoryTeam(mockRegisterRequest).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/auth/inventory/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterRequest);
      req.flush(mockAuthResponse);
    });
  });

  describe('setAuthData', () => {
    it('should store auth data and update current user', () => {
      service.setAuthData(mockAuthResponse);

      expect(sessionStorage.getItem('token')).toBe('mock-jwt-token');
      expect(sessionStorage.getItem('user')).toBe(JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        role: 'INV_TEAM'
      }));
    });
  });

  describe('logout', () => {
    it('should clear sessionStorage and navigate to login', () => {
      sessionStorage.setItem('token', 'test-token');
      sessionStorage.setItem('user', JSON.stringify(mockAuthResponse));

      service.logout();

      expect(sessionStorage.getItem('token')).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      sessionStorage.setItem('token', 'test-token');
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when no token exists', () => {
      sessionStorage.removeItem('token');
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('getToken', () => {
    it('should return token from sessionStorage', () => {
      sessionStorage.setItem('token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null when no token exists', () => {
      sessionStorage.removeItem('token');
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from current user subject', () => {
      const user: User = { username: 'test', email: 'test@example.com', role: 'INV_TEAM' };
      service.setAuthData({
        token: 'token',
        username: user.username,
        email: user.email,
        role: user.role,
        message: 'success'
      });

      expect(service.getCurrentUser()).toEqual(user);
    });

    it('should return null when no user exists', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('resendVerificationEmail', () => {
    it('should send resend verification request', () => {
      const email = 'test@example.com';

      service.resendVerificationEmail(email).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/auth/resend-verification');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email });
      req.flush({});
    });
  });
});
