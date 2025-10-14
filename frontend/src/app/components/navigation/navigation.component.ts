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
    <mat-toolbar color="primary">
      <button mat-icon-button class="hamburger-menu" (click)="toggleMobileMenu()">
        <mat-icon>menu</mat-icon>
      </button>
      
      <span class="logo">Dlvery - Inventory Management</span>
      <span class="spacer"></span>

      <div class="desktop-nav">
        <button mat-button routerLink="/inventory">
          <mat-icon>inventory</mat-icon>
          Dashboard
        </button>

        <button mat-button routerLink="/inventory/products">
          <mat-icon>category</mat-icon>
          Products
        </button>

        <button mat-button routerLink="/inventory/track">
          <mat-icon>track_changes</mat-icon>
          Track Product
        </button>

        <button mat-button routerLink="/inventory/deliveries">
          <mat-icon>local_shipping</mat-icon>
          Deliveries
        </button>

        <button mat-button routerLink="/inventory/reports">
          <mat-icon>assessment</mat-icon>
          Reports
        </button>
      </div>

      <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item routerLink="/inventory/profile">
          <mat-icon>person</mat-icon>
          Profile
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          Logout
        </button>
      </mat-menu>
    </mat-toolbar>

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
    .spacer {
      flex: 1 1 auto;
    }

    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .hamburger-menu {
      display: none;
      margin-right: 8px;
    }

    .logo {
      white-space: nowrap;
    }

    .desktop-nav {
      display: flex;
      gap: 4px;
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
      width: 250px;
    }

    mat-nav-list {
      padding-top: 0;
    }

    @media (max-width: 899px) {
      .hamburger-menu {
        display: block;
      }

      .desktop-nav {
        display: none;
      }

      .logo {
        font-size: 14px;
      }
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
