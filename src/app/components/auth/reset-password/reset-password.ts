import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.css',
})
export class ResetPasswordComponent implements OnInit {
    email: string = '';
    code: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
    isLoading: boolean = false;
    message: string = '';
    isError: boolean = false;

    constructor(
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.email = params['email'] || '';
        });
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
            next: (response: any) => {
                this.isLoading = false;
                this.message = response.message;
                setTimeout(() => {
                    this.router.navigate(['/auth/login']);
                }, 2000);
            },
            error: (error: any) => {
                this.isLoading = false;
                this.isError = true;
                this.message = error.error?.message || error.error || 'Failed to reset password. Please try again.';
            }
        });
    }
}
