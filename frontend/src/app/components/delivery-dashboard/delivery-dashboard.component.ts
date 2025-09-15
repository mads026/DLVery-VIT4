import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <mat-toolbar color="accent">
      <span>DIVery - Delivery Management</span>
      <span class="spacer"></span>
      <span *ngIf="currentUser">Welcome, {{ currentUser.username }}</span>
      <button mat-icon-button (click)="logout()">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="dashboard-container">
      <div class="welcome-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Delivery Team Dashboard</mat-card-title>
            <mat-card-subtitle>Manage deliveries and customer orders</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Welcome to the delivery management system. Here you can:</p>
            <ul>
              <li>View assigned deliveries</li>
              <li>Update delivery status</li>
              <li>Track delivery routes</li>
              <li>Manage customer communications</li>
            </ul>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .welcome-section {
      margin-bottom: 2rem;
    }
    
    mat-card {
      margin-bottom: 1rem;
    }
    
    ul {
      margin: 1rem 0;
      padding-left: 2rem;
    }
    
    li {
      margin: 0.5rem 0;
    }
  `]
})
export class DeliveryDashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}