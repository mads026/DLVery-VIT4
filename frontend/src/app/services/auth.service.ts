import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

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
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  loginInventoryTeam(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/inventory/login`, credentials);
  }

  registerInventoryTeam(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/inventory/register`, registerData);
  }

  loginDeliveryTeam(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  handleAuthCallback(token: string, role: string): void {
    if (token) {
      localStorage.setItem('token', token);
      
      // Decode basic user info from token (in real app, you'd validate this server-side)
      const user: User = {
        username: 'user', // You'd extract this from JWT
        email: 'user@example.com', // You'd extract this from JWT
        role: role as 'INV_TEAM' | 'DL_TEAM'
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
      
      // Redirect based on role
      if (role === 'INV_TEAM') {
        this.router.navigate(['/inventory/dashboard']);
      } else if (role === 'DL_TEAM') {
        this.router.navigate(['/delivery/dashboard']);
      }
    }
  }

  setAuthData(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    
    const user: User = {
      username: response.username,
      email: response.email,
      role: response.role
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}