import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './components/navigation/navigation.component';
import { AuthService } from './services/auth.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, NavigationComponent],
  template: `
    <div class="app-container" [class.loading]="isLoading">
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
      <app-navigation *ngIf="showNavigation && !isLoading"></app-navigation>
      <main class="main-content" [class.with-nav]="showNavigation && !isLoading">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'DIVery - Delivery Management System';
  showNavigation = false;
  isLoading = true;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Listen to router events to update navigation visibility
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateNavigationVisibility(event.url);
        this.isLoading = false; // Hide loading after first navigation
      });

    // Wait for auth service to initialize before showing content
    if (this.authService.isInitialized()) {
      this.initializeApp();
    } else {
      // Wait a tick for auth service to initialize
      setTimeout(() => this.initializeApp(), 0);
    }
  }

  private initializeApp(): void {
    this.updateNavigationVisibility(this.router.url);

    // Small delay to prevent flash
    setTimeout(() => {
      this.isLoading = false;
    }, 100);
  }

  private updateNavigationVisibility(url: string): void {
    const isPublicRoute = url.includes('/login') ||
                          url.includes('/verify-email') ||
                          url.includes('/auth/callback') ||
                          url === '/';

    const user = this.authService.getCurrentUser();
    const isInventoryRouteAndUser = url.includes('/inventory') && user?.role === 'INV_TEAM';

    this.showNavigation = this.authService.isAuthenticated() && !isPublicRoute && isInventoryRouteAndUser;
  }
}
