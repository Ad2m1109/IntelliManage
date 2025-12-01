import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const expectedRole = route.data['role'];

    if (!authService.isLoggedIn()) {
        router.navigate(['/auth/login']);
        return false;
    }

    const userRole = authService.getUserRole();

    if (userRole === expectedRole) {
        return true;
    }

    // Redirect to appropriate dashboard if role doesn't match
    if (authService.isFounder()) {
        router.navigate(['/founder/projects']);
    } else if (authService.isEmployee()) {
        router.navigate(['/employee/projects']);
    } else {
        router.navigate(['/auth/login']);
    }

    return false;
};
