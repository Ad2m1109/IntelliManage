import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-verification',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './verification.html',
    styleUrl: './verification.css',
})
export class VerificationComponent implements OnInit, AfterViewInit {
    email: string = '';
    code: string[] = ['', '', '', '', '', ''];
    loading: boolean = false;
    error: string = '';
    success: string = '';
    resendDisabled: boolean = false;
    countdown: number = 60;
    timer: any;

    @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.email = params['email'];
            if (!this.email) {
                this.router.navigate(['/auth/login']);
            }
        });
    }

    ngAfterViewInit() {
        // Focus first input
        setTimeout(() => {
            this.codeInputs.first.nativeElement.focus();
        }, 0);
    }

    onInput(event: any, index: number) {
        const input = event.target;
        const value = input.value;

        if (value && index < 5) {
            this.codeInputs.toArray()[index + 1].nativeElement.focus();
        }

        if (this.code.every(digit => digit !== '')) {
            this.verify();
        }
    }

    onKeyDown(event: any, index: number) {
        if (event.key === 'Backspace' && !this.code[index] && index > 0) {
            this.codeInputs.toArray()[index - 1].nativeElement.focus();
        }
    }

    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const pasteData = event.clipboardData?.getData('text');
        if (pasteData && pasteData.length === 6 && /^\d+$/.test(pasteData)) {
            this.code = pasteData.split('');
            this.verify();
        }
    }

    verify() {
        const fullCode = this.code.join('');
        if (fullCode.length !== 6) return;

        this.loading = true;
        this.error = '';
        this.success = '';

        this.authService.verifyEmail(this.email, fullCode).subscribe({
            next: (res) => {
                this.success = 'Email verified successfully! Redirecting to login...';
                setTimeout(() => {
                    this.router.navigate(['/auth/login']);
                }, 2000);
            },
            error: (err) => {
                this.error = err.error?.message || err.error || 'Invalid or expired code';
                this.loading = false;
            }
        });
    }

    resendCode() {
        if (this.resendDisabled) return;

        this.loading = true;
        this.error = '';
        this.success = '';

        this.authService.resendVerificationCode(this.email).subscribe({
            next: () => {
                this.success = 'Verification code resent!';
                this.loading = false;
                this.startCountdown();
            },
            error: (err) => {
                this.error = 'Failed to resend code. Please try again.';
                this.loading = false;
            }
        });
    }

    startCountdown() {
        this.resendDisabled = true;
        this.countdown = 60;
        this.timer = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(this.timer);
                this.resendDisabled = false;
            }
        }, 1000);
    }
}
