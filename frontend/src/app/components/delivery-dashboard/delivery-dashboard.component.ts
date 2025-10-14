import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, User } from '../../services/auth.service';
import { DeliveryAgentService, DeliveryAgentDto } from '../../services/delivery-agent.service';
import { DeliveryCardComponent } from './delivery-card/delivery-card.component';
import { DeliveryCompletionDialogComponent } from './delivery-completion-dialog/delivery-completion-dialog.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatBottomSheetModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    DeliveryCardComponent
  ],
  template: `
    <div class="delivery-container">
      <!-- Header Section -->
      <div class="delivery-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="delivery-title">Delivery Agent Dashboard</h1>
            <p class="delivery-subtitle">Manage your deliveries and track progress</p>
          </div>
          <div class="header-actions">
            <button mat-icon-button [matMenuTriggerFor]="profileMenu" class="profile-btn" matTooltip="Account Menu">
              <mat-icon>account_circle</mat-icon>
            </button>
          </div>

          <!-- Profile Menu -->
          <mat-menu #profileMenu="matMenu" class="profile-dropdown">
            <div class="menu-header">
              <mat-icon>account_circle</mat-icon>
              <div class="user-info">
                <div class="user-name">{{ currentUser?.username || 'User' }}</div>
                <div class="user-email">{{ currentUser?.email || '' }}</div>
              </div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="openAccountSettings()">
              <mat-icon>settings</mat-icon>
              <span>Account Settings</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner">
          <mat-icon class="spin">refresh</mat-icon>
        </div>
        <p class="loading-text">Loading delivery data...</p>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!loading" class="delivery-content">

        <!-- Key Performance Indicators -->
        <section class="kpi-section">
          <div class="kpi-grid">

            <!-- Today's Deliveries Card -->
            <div class="kpi-card today">
              <div class="kpi-header">
                <div class="kpi-title">
                  <mat-icon>today</mat-icon>
                  <span>Today's Deliveries</span>
                </div>
              </div>
              <div class="kpi-main">
                <div class="kpi-value today-color">{{ todaysDeliveries.length }}</div>
              </div>
            </div>

            <!-- Pending Card -->
            <div class="kpi-card pending">
              <div class="kpi-header">
                <div class="kpi-title">
                  <mat-icon>schedule</mat-icon>
                  <span>Pending</span>
                </div>
              </div>
              <div class="kpi-main">
                <div class="kpi-value pending-color">{{ pendingDeliveries.length }}</div>
              </div>
            </div>

            <!-- Delivered Card -->
            <div class="kpi-card delivered">
              <div class="kpi-header">
                <div class="kpi-title">
                  <mat-icon>check_circle</mat-icon>
                  <span>Delivered</span>
                </div>
              </div>
              <div class="kpi-main">
                <div class="kpi-value delivered-color">{{ deliveredDeliveries.length }}</div>
              </div>
            </div>

            <!-- Overdue Card -->
            <div class="kpi-card overdue">
              <div class="kpi-header">
                <div class="kpi-title">
                  <mat-icon>warning</mat-icon>
                  <span>Overdue</span>
                </div>
              </div>
              <div class="kpi-main">
                <div class="kpi-value overdue-color">{{ getOverdueCount() }}</div>
              </div>
            </div>

          </div>
        </section>

        <!-- Filters and Search -->
        <section class="filters-section">
          <div class="filters-container">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search deliveries</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Search by delivery ID, customer...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter by Status</mat-label>
              <mat-select [(value)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="PENDING">Pending</mat-option>
                <mat-option value="IN_TRANSIT">In Transit</mat-option>
                <mat-option value="DELIVERED">Delivered</mat-option>
                <mat-option value="DOOR_LOCKED">Door Locked</mat-option>
                <mat-option value="DAMAGED_IN_TRANSIT">Damaged</mat-option>
                <mat-option value="RETURNED">Returned</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter by Priority</mat-label>
              <mat-select [(value)]="selectedPriority" (selectionChange)="applyFilters()">
                <mat-option value="">All Priorities</mat-option>
                <mat-option value="EMERGENCY">🚨 Emergency</mat-option>
                <mat-option value="PERISHABLE">🥛 Perishable</mat-option>
                <mat-option value="ESSENTIAL">⚡ Essential</mat-option>
                <mat-option value="STANDARD">📦 Standard</mat-option>
                <mat-option value="LOW">📋 Low Priority</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </section>

        <!-- Delivery Tabs -->
        <section class="delivery-section">
          <mat-tab-group class="delivery-tabs" (selectedTabChange)="onTabChange($event)">

            <!-- Today's Deliveries Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <span [matBadge]="getFilteredTodaysDeliveries().length" matBadgeColor="primary" [matBadgeHidden]="getFilteredTodaysDeliveries().length === 0">
                  <mat-icon>today</mat-icon>
                  Today's Deliveries
                </span>
              </ng-template>

              <div class="tab-content">
                <div class="delivery-list-header">
                  <h3>Today's Deliveries ({{ getFilteredTodaysDeliveries().length }})</h3>
                </div>

                <div *ngIf="getFilteredTodaysDeliveries().length === 0" class="empty-state">
                  <mat-icon class="empty-icon">today</mat-icon>
                  <h3>No deliveries for today</h3>
                  <p>All caught up! Check pending deliveries or come back tomorrow.</p>
                </div>

                <div class="delivery-grid">
                  <div *ngFor="let delivery of getFilteredTodaysDeliveries()" class="delivery-item">
                    <app-delivery-card
                      [delivery]="delivery"
                      (statusUpdate)="onDeliveryUpdate($event)"
                      (viewDetails)="onViewDetails($event)">
                    </app-delivery-card>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Pending Deliveries Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <span [matBadge]="getFilteredPendingDeliveries().length" matBadgeColor="warn" [matBadgeHidden]="getFilteredPendingDeliveries().length === 0">
                  <mat-icon>schedule</mat-icon>
                  Pending
                </span>
              </ng-template>

              <div class="tab-content">
                <div class="delivery-list-header">
                  <h3>Pending Deliveries ({{ getFilteredPendingDeliveries().length }})</h3>
                </div>

                <div *ngIf="getFilteredPendingDeliveries().length === 0" class="empty-state">
                  <mat-icon class="empty-icon">done_all</mat-icon>
                  <h3>All caught up!</h3>
                  <p>No pending deliveries. Great work!</p>
                </div>

                <div class="delivery-grid">
                  <div *ngFor="let delivery of getFilteredPendingDeliveries()" class="delivery-item">
                    <app-delivery-card
                      [delivery]="delivery"
                      (statusUpdate)="onDeliveryUpdate($event)"
                      (viewDetails)="onViewDetails($event)">
                    </app-delivery-card>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Delivered Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <span [matBadge]="getFilteredDeliveredDeliveries().length" matBadgeColor="accent" [matBadgeHidden]="getFilteredDeliveredDeliveries().length === 0">
                  <mat-icon>check_circle</mat-icon>
                  Delivered
                </span>
              </ng-template>

              <div class="tab-content">
                <div class="delivery-list-header">
                  <h3>Delivered Items ({{ getFilteredDeliveredDeliveries().length }})</h3>
                </div>

                <div *ngIf="getFilteredDeliveredDeliveries().length === 0" class="empty-state">
                  <mat-icon class="empty-icon">check_circle</mat-icon>
                  <h3>No delivered items yet</h3>
                  <p>Completed deliveries will appear here.</p>
                </div>

                <div class="delivery-grid">
                  <div *ngFor="let delivery of getFilteredDeliveredDeliveries()" class="delivery-item">
                    <app-delivery-card
                      [delivery]="delivery"
                      [isDelivered]="true"
                      (viewDetails)="onViewDetails($event)">
                    </app-delivery-card>
                  </div>
                </div>
              </div>
            </mat-tab>

          </mat-tab-group>
        </section>

      </div>
    </div>
  `,
  styles: [`
    .delivery-container {
      padding: 2rem;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* Header Section */
    .delivery-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
    }

    .header-text {
      flex: 1;
    }

    .delivery-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
      line-height: 1.2;
    }

    .delivery-subtitle {
      font-size: 1rem;
      color: #64748b;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .profile-btn {
      background: #f8fafc !important;
      color: #374151 !important;
      border: 2px solid #e2e8f0 !important;
      width: 48px !important;
      height: 48px !important;
    }

    .profile-btn:hover {
      background: #e2e8f0 !important;
      border-color: #cbd5e1 !important;
    }

    .profile-btn mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .refresh-btn, .logout-btn {
      padding: 0.75rem 1.5rem !important;
      border-radius: 0.5rem !important;
      font-weight: 500 !important;
      text-transform: none !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
    }

    .refresh-btn {
      background: #2563eb !important;
      color: white !important;
    }

    .refresh-btn:hover {
      background: #1d4ed8 !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
    }

    .logout-btn {
      background: #dc2626 !important;
      color: white !important;
    }

    .logout-btn:hover {
      background: #b91c1c !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .loading-spinner .mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #3b82f6;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .loading-text {
      margin-top: 1rem;
      font-size: 1.125rem;
      color: #6b7280;
    }

    /* KPI Section */
    .kpi-section {
      margin-bottom: 2rem;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .kpi-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }

    .kpi-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .kpi-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
    }

    .kpi-title mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .kpi-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .kpi-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
    }

    .today-color { color: #3b82f6; }
    .pending-color { color: #f59e0b; }
    .delivered-color { color: #10b981; }
    .overdue-color { color: #ef4444; }

    /* Filters Section */
    .filters-section {
      margin-bottom: 2rem;
    }

    .filters-container {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .filter-field {
      min-width: 180px;
    }

    /* Delivery Section */
    .delivery-section {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .delivery-tabs {
      background: transparent;
    }

    .delivery-list-header {
      padding: 1.5rem 1.5rem 0 1.5rem;
    }

    .delivery-list-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }

    .tab-content {
      padding: 1.5rem;
      min-height: 400px;
    }

    .delivery-grid {
      display: grid;
      gap: 1rem;
    }

    .delivery-item {
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .delivery-item:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      color: #64748b;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1.5rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
    }

    .empty-state p {
      margin: 0;
      font-size: 1rem;
    }

    /* Profile Dropdown Menu */
    .profile-dropdown {
      min-width: 280px !important;
    }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8fafc;
    }

    .menu-header mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #374151;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .user-email {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .profile-dropdown .mat-mdc-menu-item {
      height: 48px !important;
      line-height: 48px !important;
    }

    .profile-dropdown .mat-mdc-menu-item mat-icon {
      margin-right: 12px;
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .delivery-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .header-actions {
        width: 100%;
        justify-content: stretch;
      }

      .logout-btn {
        flex: 1;
      }

      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .kpi-card {
        padding: 1rem;
      }

      .kpi-value {
        font-size: 1.5rem;
      }

      .filters-container {
        flex-direction: column;
        gap: 1rem;
      }

      .search-field, .filter-field {
        width: 100%;
        min-width: unset;
      }

      .tab-content {
        padding: 1rem;
      }
    }
  `]
})
export class DeliveryDashboardComponent implements OnInit {
  currentUser: User | null = null;
  todaysDeliveries: DeliveryAgentDto[] = [];
  pendingDeliveries: DeliveryAgentDto[] = [];
  deliveredDeliveries: DeliveryAgentDto[] = [];
  loading = true;
  selectedTabIndex = 0;

  // Filtering
  searchTerm = '';
  selectedStatus = '';
  selectedPriority = '';

  constructor(
    private authService: AuthService,
    private deliveryAgentService: DeliveryAgentService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.loading = true;

    // Load today's, pending, and delivered deliveries
    Promise.all([
      this.deliveryAgentService.getTodaysDeliveries().toPromise(),
      this.deliveryAgentService.getPendingDeliveries().toPromise(),
      this.deliveryAgentService.getDeliveredDeliveries().toPromise()
    ]).then(([todaysData, pendingData, deliveredData]) => {
      const allActiveDeliveries = [
        ...(todaysData || []),
        ...(pendingData || [])
      ];

      // Categorize deliveries based on scheduled date and timing
      this.categorizeDeliveries(allActiveDeliveries);
      this.deliveredDeliveries = deliveredData || [];

      // Deliveries are now managed in separate arrays for better organization

      this.loading = false;
    }).catch(error => {
      console.error('Error loading deliveries:', error);
      this.loading = false;
    });
  }

  /**
   * Categorizes deliveries into Today's and Pending based on schedule and status
   */
  private categorizeDeliveries(deliveries: DeliveryAgentDto[]): void {
    const now = new Date();
    const today = this.getDateOnly(now);

    this.todaysDeliveries = [];
    this.pendingDeliveries = [];

    deliveries.forEach(delivery => {
      const scheduledDate = new Date(delivery.scheduledDate);
      const scheduledDateOnly = this.getDateOnly(scheduledDate);
      const hoursSinceScheduled = (now.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60);

      const isFuture = scheduledDateOnly > today;
      const isDelayedAndNotStarted = hoursSinceScheduled >= 24 &&
        (delivery.status === 'PENDING' || delivery.status === 'ASSIGNED');

      if (isFuture || isDelayedAndNotStarted) {
        this.pendingDeliveries.push(delivery);
      } else {
        this.todaysDeliveries.push(delivery);
      }
    });
  }

  /**
   * Helper to get date-only (no time component) for reliable comparison
   */
  private getDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  refreshData(): void {
    this.loadDeliveries();
  }

  getOverdueCount(): number {
    return this.pendingDeliveries.filter(d => d.isOverdue).length;
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

  onDeliveryUpdate(delivery: DeliveryAgentDto): void {
    // Refresh data after update
    this.loadDeliveries();
  }

  onViewDetails(delivery: DeliveryAgentDto): void {
    // Only show details for delivered items
    if (delivery.status === 'DELIVERED') {
      // Open delivery completion details dialog focused on reason and signature
      const detailsDialog = this.dialog.open(DeliveryCompletionDialogComponent, {
        width: '500px',
        data: { delivery: delivery }
      });
    }
  }

  openAccountSettings(): void {
    this.router.navigate(['/delivery/profile-setup']);
  }

  logout(): void {
    this.authService.logout();
  }

  // Filtering methods
  applyFilters(): void {
    // Filters are applied in the getter methods
  }

  getFilteredTodaysDeliveries(): DeliveryAgentDto[] {
    return this.filterDeliveries(this.todaysDeliveries);
  }

  getFilteredPendingDeliveries(): DeliveryAgentDto[] {
    return this.filterDeliveries(this.pendingDeliveries);
  }

  getFilteredDeliveredDeliveries(): DeliveryAgentDto[] {
    return this.filterDeliveries(this.deliveredDeliveries);
  }

  private filterDeliveries(deliveries: DeliveryAgentDto[]): DeliveryAgentDto[] {
    return deliveries.filter(delivery => {
      // Search filter
      const matchesSearch = !this.searchTerm ||
        delivery.deliveryId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        delivery.customerName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        delivery.customerAddress.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = !this.selectedStatus || delivery.status === this.selectedStatus;

      // Priority filter
      const matchesPriority = !this.selectedPriority || delivery.priority === this.selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }
}
