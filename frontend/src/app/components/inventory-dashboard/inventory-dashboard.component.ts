import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService, User } from '../../services/auth.service';
import { InventoryFormComponent } from './inventory-form.component';
import { InventoryUploadComponent } from './inventory-upload.component';
import { InventoryTableComponent } from './inventory-table.component';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    InventoryFormComponent,
    InventoryUploadComponent,
    InventoryTableComponent
  ],
  template: `
    <mat-toolbar color="primary">
      <span>DIVery - Inventory Management</span>
      <span class="spacer"></span>
      <span *ngIf="currentUser">Welcome, {{ currentUser.username }}</span>
      <button mat-icon-button (click)="logout()" aria-label="Logout">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="dashboard-container">

      <div class="welcome-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Inventory Team Dashboard</mat-card-title>
            <mat-card-subtitle>Manage warehouse inventory and stock levels</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Welcome to the inventory management system. Here you can:</p>
            <ul class="welcome-list">
              <li>Track inventory levels</li>
              <li>Manage stock movements</li>
              <li>Generate inventory reports</li>
              <li>Monitor warehouse operations</li>
            </ul>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="form-section">
        <button mat-raised-button color="primary" (click)="toggleForm()">
          {{ showForm ? 'Close Form' : 'Add Item' }}
        </button>
        <mat-card *ngIf="showForm" class="form-card">
          <mat-card-header>
            <mat-card-title>Add / Edit Inventory</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-inventory-form></app-inventory-form>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="upload-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Upload Inventory CSV File</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-inventory-upload></app-inventory-upload>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="table-section">
        <app-inventory-table></app-inventory-table>
      </div>

    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .dashboard-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .welcome-section, .form-section, .upload-section, .table-section { margin-bottom: 2rem; }
    .form-card { margin-top: 1rem; }
    .welcome-list { margin-top: 1rem; padding-left: 1.5rem; line-height: 1.6; }
    mat-toolbar { font-weight: 600; }
  `]
})
export class InventoryDashboardComponent implements OnInit {
  currentUser: User | null = null;
  showForm = false;
  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
  toggleForm() { this.showForm = !this.showForm; }
  logout(): void { this.authService.logout(); }
}
