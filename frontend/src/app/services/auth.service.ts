import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: 'INV_TEAM' | 'DL_TEAM';
  message: string;
}

export interface User {
  username: string;
  email: string;
  role: 'INV_TEAM' | 'DL_TEAM';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.authApiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private initialized = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Load user from storage synchronously to prevent auth state flicker
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
    this.initialized = true;
  }

  loginInventoryTeam(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/inventory/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          sessionStorage.setItem('token', response.token);
          this.setAuthData(response);
        }
      })
    );
  }

  registerInventoryTeam(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/inventory/register`, registerData);
  }

  loginDeliveryTeam(): void {
    window.location.href = environment.oauthUrl;
  }

  handleAuthCallback(token: string, role: string, username?: string, email?: string): void {
    if (token) {
      // Create AuthResponse object
      const authResponse: AuthResponse = {
        token,
        username: username || 'Delivery User',
        email: email || 'delivery@dlvery.com',
        role: role as 'INV_TEAM' | 'DL_TEAM',
        message: 'OAuth login successful'
      };

      sessionStorage.setItem('token', token);
      this.setAuthData(authResponse);

      // Redirect based on role with a small delay to prevent glitches
      setTimeout(() => {
        this.navigateBasedOnRole(role);
      }, 100);
    } else {
      // Handle error case
      this.router.navigate(['/login'], {
        queryParams: { error: 'auth_failed' }
      });
    }
  }

  setAuthData(response: AuthResponse): void {
    const user: User = {
      username: response.username,
      email: response.email,
      role: response.role
    };

    sessionStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private navigateBasedOnRole(role: string): void {
    const routes = {
      'INV_TEAM': '/inventory',
      'DL_TEAM': '/delivery/dashboard'
    };

    this.router.navigate([routes[role as keyof typeof routes] || '/inventory']);
  }

  logout(): void {
    this.clearAuthData();
  }

  private clearAuthData(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('token');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/resend-verification`, { email });
  }
}
