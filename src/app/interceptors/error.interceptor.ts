import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
        // Client-side errors
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side errors
        if (error.status === 0) {
          errorMessage = 'Cannot connect to the server. Please check your internet connection.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized: Please log in again.';
          // Optionally, redirect to login page
          // const router = inject(Router);
          // router.navigate(['/auth/login']);
        } else if (error.error && error.error.message) {
          errorMessage = `Error ${error.status}: ${error.error.message}`;
        } else {
          errorMessage = `Error ${error.status}: ${error.message}`;
        }
      }
      notificationService.error(errorMessage);
      return throwError(() => error);
    })
  );
};
