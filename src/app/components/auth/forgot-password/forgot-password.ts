import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { ApiResponse } from '../../../models/api-response.model'; // Import ApiResponse

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    if (!this.email) return;

    this.isLoading = true;
    this.message = '';
    this.isError = false;

    this.authService.forgotPassword(this.email).subscribe({
      next: (response: ApiResponse) => {
        this.isLoading = false;
        this.message = response.message;
        // Redirect to reset password after a short delay
        setTimeout(() => {
          this.router.navigate(['/auth/reset-password'], { queryParams: { email: this.email } });
        }, 2000);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.isError = true;
        this.message = error.error?.message || error.error || 'Failed to send reset code. Please try again.';
      }
    });
  }
}
