import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RoleType } from '../../../models/role-type.enum';
import { config } from '../../../config';

declare var google: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent implements OnInit, AfterViewInit {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  roleType: RoleType = RoleType.EMPLOYEE;
  loading: boolean = false;
  error: string = '';

  // Make RoleType enum available in template
  RoleType = RoleType;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.redirectUser();
    }
  }

  ngAfterViewInit() {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: (response: any) => this.handleGoogleLogin(response)
      });

      google.accounts.id.renderButton(
        document.getElementById('google-signup-btn'),
        { theme: 'outline', size: 'large', width: '100%', text: 'signup_with' }
      );
    }
  }

  private handleGoogleLogin(response: any) {
    this.loading = true;
    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.redirectUser();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.error = 'Google signup failed. Please try again.';
          this.loading = false;
        });
      }
    });
  }

  private redirectUser() {
    const userRole = this.authService.getUserRole();
    if (userRole === 'FOUNDER') {
      this.router.navigate(['/founder/projects']);
    } else if (userRole === 'EMPLOYEE') {
      this.router.navigate(['/employee/projects']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit() {
    // Validation
    if (!this.fullName || !this.email || !this.password) {
      this.error = 'Please fill in all required fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      roleType: this.roleType
    }).subscribe({
      next: (response) => {
        console.log('Registration successful:', response.message);
        this.router.navigate(['/auth/verify-email'], { queryParams: { email: this.email } });
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.error = err.error?.message || err.error || 'Registration failed. Please try again.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
