import { HttpInterceptorFn, HttpRequest } from '@angular/common/http'; // Added HttpRequest
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    // Check if the request is for the register or login endpoint
    if ((req.url.includes('/auth/register') && req.method === 'POST') ||
        (req.url.includes('/auth/login') && req.method === 'POST')) {
        return next(req); // Do not add token for registration or login
    }

    if (token) {
        const cloned = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(cloned);
    }

    return next(req);
};
