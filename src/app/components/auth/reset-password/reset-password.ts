import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { ApiResponse } from '../../../models/api-response.model'; // Import ApiResponse

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.css',
})
export class ResetPasswordComponent implements OnInit, OnDestroy { // Implement OnDestroy
    email: string = '';
    code: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
    isLoading: boolean = false;
    message: string = '';
    isError: boolean = false;
    newPasswordFieldType: string = 'password'; // Added for new password visibility toggle
    confirmPasswordFieldType: string = 'password'; // Added for confirm password visibility toggle
    private routeSub: Subscription = new Subscription(); // To manage route params subscription

    constructor(
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.routeSub = this.route.queryParams.subscribe(params => {
            this.email = params['email'] || '';
        });
    }

    ngOnDestroy(): void {
        this.routeSub.unsubscribe(); // Unsubscribe from route params
    }

    toggleNewPasswordVisibility() {
        this.newPasswordFieldType = this.newPasswordFieldType === 'password' ? 'text' : 'password';
    }

    toggleConfirmPasswordVisibility() {
        this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
    }

    onSubmit() {
        if (!this.email || !this.code || !this.newPassword) return;

        if (this.newPassword !== this.confirmPassword) {
            this.isError = true;
            this.message = 'Passwords do not match';
            return;
        }

        this.isLoading = true;
        this.message = '';
        this.isError = false;

        this.authService.resetPassword(this.email, this.code, this.newPassword).subscribe({
            next: (response: ApiResponse) => {
                this.isLoading = false;
                this.message = response.message;
                setTimeout(() => {
                    this.router.navigate(['/auth/login']);
                }, 2000);
            },
            error: (error: HttpErrorResponse) => {
                this.isLoading = false;
                this.isError = true;
                this.message = error.error?.message || error.error || 'Failed to reset password. Please try again.';
            }
        });
    }
}
