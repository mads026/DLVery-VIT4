import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
import { ModernInputComponent } from '../../shared/components/modern-input/modern-input.component';
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
    DeliveryCardComponent,
    ModernInputComponent
  ],
  templateUrl: './delivery-dashboard.component.html',
  styleUrls: ['./delivery-dashboard.component.css']
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

    Promise.all([
      this.deliveryAgentService.getTodaysDeliveries().toPromise(),
      this.deliveryAgentService.getPendingDeliveries().toPromise(),
      this.deliveryAgentService.getDeliveredDeliveries().toPromise()
    ]).then(([todaysData, pendingData, deliveredData]) => {
      // Combine and deduplicate deliveries by ID
      const allActiveDeliveries = this.deduplicateDeliveries([
        ...(todaysData || []),
        ...(pendingData || [])
      ]);

      this.categorizeDeliveries(allActiveDeliveries);
      this.deliveredDeliveries = deliveredData || [];
      this.loading = false;
    }).catch(error => {
      console.error('Error loading deliveries:', error);
      this.loading = false;
    });
  }

  private deduplicateDeliveries(deliveries: DeliveryAgentDto[]): DeliveryAgentDto[] {
    const uniqueMap = new Map<number, DeliveryAgentDto>();
    deliveries.forEach(delivery => {
      if (delivery.id && !uniqueMap.has(delivery.id)) {
        uniqueMap.set(delivery.id, delivery);
      }
    });
    return Array.from(uniqueMap.values());
  }

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
    this.loadDeliveries();
  }

  onViewDetails(delivery: DeliveryAgentDto): void {
    // Show details for all completed deliveries (delivered, returned, damaged, door locked)
    const completedStatuses = ['DELIVERED', 'RETURNED', 'DAMAGED_IN_TRANSIT', 'DOOR_LOCKED'];
    if (completedStatuses.includes(delivery.status)) {
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
      const matchesSearch = !this.searchTerm ||
        delivery.deliveryId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        delivery.customerName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        delivery.customerAddress.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus || delivery.status === this.selectedStatus;
      const matchesPriority = !this.selectedPriority || delivery.priority === this.selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }
}
