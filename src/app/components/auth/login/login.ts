import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Please enter email and password';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response.message);

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
        console.error('Login error:', err);
        this.error = err.error?.message || err.error || 'Invalid email or password';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
