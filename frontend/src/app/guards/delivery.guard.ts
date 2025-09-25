import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const deliveryGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();
    if (user && user.role === 'DL_TEAM') {
      return true;
    } else {
      // Redirect to appropriate dashboard or login
      if (user && user.role === 'INV_TEAM') {
        router.navigate(['/inventory']);
      } else {
        router.navigate(['/login']);
      }
      return false;
    }
  }

  router.navigate(['/login']);
  return false;
};
