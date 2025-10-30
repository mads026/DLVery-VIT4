import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <nav class="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          <!-- Mobile Menu Button -->
          <button 
            class="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            (click)="toggleMobileMenu()">
            <mat-icon>menu</mat-icon>
          </button>
          
          <!-- Logo -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <mat-icon class="!text-primary-600 !text-xl">local_shipping</mat-icon>
            </div>
            <span class="text-white font-bold text-lg hidden sm:block">DIVery</span>
            <span class="hidden lg:block text-white/80 text-xs">Inventory Management</span>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-1">
            <a 
              routerLink="/inventory" 
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-link">
              <mat-icon class="!text-base">dashboard</mat-icon>
              <span>Dashboard</span>
            </a>

            <a 
              routerLink="/inventory/products" 
              routerLinkActive="active-link"
              class="nav-link">
              <mat-icon class="!text-base">inventory_2</mat-icon>
              <span>Products</span>
            </a>

            <a 
              routerLink="/inventory/track" 
              routerLinkActive="active-link"
              class="nav-link">
              <mat-icon class="!text-base">track_changes</mat-icon>
              <span>Track</span>
            </a>

            <a 
              routerLink="/inventory/deliveries" 
              routerLinkActive="active-link"
              class="nav-link">
              <mat-icon class="!text-base">local_shipping</mat-icon>
              <span>Deliveries</span>
            </a>

            <a 
              routerLink="/inventory/reports" 
              routerLinkActive="active-link"
              class="nav-link">
              <mat-icon class="!text-base">assessment</mat-icon>
              <span>Reports</span>
            </a>
          </div>

          <!-- Profile Menu -->
          <button 
            mat-icon-button 
            [matMenuTriggerFor]="menu"
            class="!text-white hover:!bg-white/10">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #menu="matMenu" class="profile-menu">
            <button mat-menu-item routerLink="/inventory/profile" class="!h-12">
              <mat-icon class="!text-gray-600">person</mat-icon>
              <span>Profile</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()" class="!h-12">
              <mat-icon class="!text-red-600">logout</mat-icon>
              <span class="text-red-600">Logout</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu Drawer -->
    <mat-sidenav-container *ngIf="isMobileMenuOpen" class="mobile-menu-container">
      <mat-sidenav #drawer mode="over" [opened]="isMobileMenuOpen" (closed)="isMobileMenuOpen = false">
        <mat-nav-list>
          <a mat-list-item routerLink="/inventory" (click)="closeMobileMenu()">
            <mat-icon matListItemIcon>inventory</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/inventory/products" (click)="closeMobileMenu()">
            <mat-icon matListItemIcon>category</mat-icon>
            <span matListItemTitle>Products</span>
          </a>
          <a mat-list-item routerLink="/inventory/track" (click)="closeMobileMenu()">
            <mat-icon matListItemIcon>track_changes</mat-icon>
            <span matListItemTitle>Track Product</span>
          </a>
          <a mat-list-item routerLink="/inventory/deliveries" (click)="closeMobileMenu()">
            <mat-icon matListItemIcon>local_shipping</mat-icon>
            <span matListItemTitle>Deliveries</span>
          </a>
          <a mat-list-item routerLink="/inventory/reports" (click)="closeMobileMenu()">
            <mat-icon matListItemIcon>assessment</mat-icon>
            <span matListItemTitle>Reports</span>
          </a>
          <mat-divider></mat-divider>
          <a mat-list-item routerLink="/inventory/profile" (click)="closeMobileMenu()">
            <mat-icon matListItemIcon>person</mat-icon>
            <span matListItemTitle>Profile</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content></mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      color: white;
      font-size: 0.8125rem;
      font-weight: 500;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .nav-link.active-link {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .mobile-menu-container {
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999;
    }

    mat-sidenav {
      width: 280px;
      background: white;
    }

    mat-nav-list {
      padding-top: 1rem;
    }

    ::ng-deep .profile-menu {
      margin-top: 0.5rem;
    }

    ::ng-deep .mat-mdc-menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    ::ng-deep .mat-mdc-menu-item mat-icon {
      margin-right: 0;
    }
  `]
})
export class NavigationComponent {
  isMobileMenuOpen = false;

  constructor(private authService: AuthService) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
