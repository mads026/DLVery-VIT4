import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
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
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Dlvery - Inventory Management</span>
      <span class="spacer"></span>

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

      <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item>
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
  `]
})
export class NavigationComponent {
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
