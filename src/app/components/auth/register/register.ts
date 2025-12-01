import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RoleType } from '../../../models/role-type.enum';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
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
    private router: Router
  ) { }

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
