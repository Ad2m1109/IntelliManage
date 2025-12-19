import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { config } from '../../../config';
import { GoogleCredentialResponse } from '../../../models/google-credential-response.model'; // Import GoogleCredentialResponse

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit, AfterViewInit {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    // Check if user is already logged in
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
        callback: (response: GoogleCredentialResponse) => this.handleGoogleLogin(response)
      });

      google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }
  }

  private handleGoogleLogin(response: GoogleCredentialResponse) {
    this.loading = true;
    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.redirectUser();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.error = 'Google login failed. Please try again.';
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
    if (!this.email || !this.password) {
      this.error = 'Please enter email and password';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        // console.log('Login successful:', response.message); // Consider a notification service

        // Redirect based on user role
        const userRole = this.authService.getUserRole();
        if (userRole === 'FOUNDER') {
          this.router.navigate(['/founder/projects']);
        } else if (userRole === 'EMPLOYEE') {
          this.router.navigate(['/employee/projects']);
        } else {
          // Fallback to login if role is unknown
          this.router.navigate(['/auth/login']);
        }
      },
      error: (err) => {
        /* Handle error */ // Consider a notification service
        this.error = err.error?.message || err.error || 'Invalid email or password';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
