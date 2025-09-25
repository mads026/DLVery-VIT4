import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

describe('authInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let mockHandler: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    const handlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockHandler = handlerSpy;
    mockHandler.handle.and.returnValue(of({} as any));
  });

  it('should add Authorization header when token exists', () => {
    const mockToken = 'mock-jwt-token';
    authService.getToken.and.returnValue(mockToken);

    const mockRequest = new HttpRequest('GET', '/api/test');
    
    TestBed.runInInjectionContext(() => {
      authInterceptor(mockRequest, mockHandler.handle);
    });

    expect(mockHandler.handle).toHaveBeenCalledWith(
      jasmine.objectContaining({
        headers: jasmine.objectContaining({
          lazyInit: jasmine.any(Function)
        })
      })
    );
  });

  it('should not modify request when no token exists', () => {
    authService.getToken.and.returnValue(null);

    const mockRequest = new HttpRequest('GET', '/api/test');
    
    TestBed.runInInjectionContext(() => {
      authInterceptor(mockRequest, mockHandler.handle);
    });

    expect(mockHandler.handle).toHaveBeenCalledWith(mockRequest);
  });
});