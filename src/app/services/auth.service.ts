import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { config } from '../config';
import { User } from '../models/user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  roleType: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private apiUrl = `${config.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  private _decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const decodedToken = this._decodeToken(token);
    if (!decodedToken || !decodedToken.exp) {
      return false;
    }

    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decodedToken.exp);

    return expirationDate.valueOf() > new Date().valueOf();
  }

  // Get current user
  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Get user role
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.roleType || null;
  }

  // Check if user is a Founder
  isFounder(): boolean {
    return this.getUserRole() === 'FOUNDER';
  }

  // Check if user is an Employee
  isEmployee(): boolean {
    return this.getUserRole() === 'EMPLOYEE';
  }

  // Register method
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(
        tap(response => {
          if (response.token && response.user) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          }
        })
      );
  }

  // Login method
  login(email: string, password: string): Observable<AuthResponse> {
    const request: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          if (response.token && response.user) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          }
        })
      );
  }

  // Google Login method
  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, { idToken })
      .pipe(
        tap(response => {
          if (response.token && response.user) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          }
        })
      );
  }

  // Email verification methods
  verifyEmail(email: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, { email, code });
  }

  resendVerificationCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-code`, { email });
  }

  // Password reset methods
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, code, newPassword });
  }

  // Get current user from server
  me(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  // Logout method
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Even if server logout fails, clear local storage
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
