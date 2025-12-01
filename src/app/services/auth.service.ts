import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
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
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
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
            // Redirect based on role
            if (response.user.roleType === 'FOUNDER') {
              this.router.navigate(['/founder/projects']);
            } else {
              this.router.navigate(['/employee/projects']);
            }
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
            // Redirect to role-specific default route
            if (response.user.roleType === 'FOUNDER') {
              this.router.navigate(['/founder/projects']);
            } else {
              this.router.navigate(['/employee/projects']);
            }
          }
        })
      );
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
