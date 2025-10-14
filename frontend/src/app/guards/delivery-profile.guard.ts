import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { DeliveryAgentProfileService } from '../services/delivery-agent-profile.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryProfileGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private profileService: DeliveryAgentProfileService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    
    // Only check profile for delivery team users
    if (!currentUser || currentUser.role !== 'DL_TEAM') {
      return of(true);
    }

    return this.profileService.isProfileComplete().pipe(
      map(isComplete => {
        if (!isComplete) {
          this.router.navigate(['/delivery/profile-setup']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        // If there's an error checking profile, redirect to setup
        this.router.navigate(['/delivery/profile-setup']);
        return of(false);
      })
    );
  }
}