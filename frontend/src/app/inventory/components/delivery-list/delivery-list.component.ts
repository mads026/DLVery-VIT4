import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { InventoryService } from '../../services/inventory.service';
import { Delivery, DeliveryStatus } from '../../models/delivery.model';
import { DeliveryFormComponent } from '../delivery-form/delivery-form.component';
import { DeliveryStatusDialogComponent } from '../delivery-status-dialog/delivery-status-dialog.component';

@Component({
  selector: 'app-delivery-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatMenuModule
  ],
  templateUrl: './delivery-list.component.html',
  styleUrls: ['./delivery-list.component.css']
})
export class DeliveryListComponent implements OnInit {
  private readonly STATUS_CONFIG: { [key: string]: { color: string; formatted: string; class: string; icon: string } } = {
    [DeliveryStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-800', formatted: 'PENDING', class: 'pending', icon: 'schedule' },
    [DeliveryStatus.IN_TRANSIT]: { color: 'bg-blue-100 text-blue-800', formatted: 'IN TRANSIT', class: 'in-transit', icon: 'local_shipping' },
    [DeliveryStatus.DELIVERED]: { color: 'bg-green-100 text-green-800', formatted: 'DELIVERED', class: 'delivered', icon: 'check_circle' },
    [DeliveryStatus.DAMAGED_IN_TRANSIT]: { color: 'bg-red-100 text-red-800', formatted: 'DAMAGED', class: 'damaged', icon: 'warning' },
    [DeliveryStatus.CANCELLED]: { color: 'bg-gray-100 text-gray-800', formatted: 'CANCELLED', class: 'cancelled', icon: 'cancel' },
    [DeliveryStatus.RETURNED]: { color: 'bg-orange-100 text-orange-800', formatted: 'RETURNED', class: 'returned', icon: 'keyboard_return' }
  };

  deliveries: Delivery[] = [];
  filteredDeliveries: Delivery[] = [];
  loading = true;
  searchTerm = '';
  selectedStatus = '';
  selectedAgent = '';

  displayedColumns: string[] = ['deliveryId', 'agent', 'status', 'items', 'createdAt', 'actions'];
  statuses = Object.values(DeliveryStatus);
  agents: string[] = [];
  DeliveryStatus = DeliveryStatus;

  constructor(
    private inventoryService: InventoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.inventoryService.getAllDeliveries().subscribe({
      next: (deliveries) => {
        this.deliveries = deliveries;
        this.extractAgents();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading deliveries:', error);
        this.snackBar.open('Error loading deliveries', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  extractAgents(): void {
    const agentSet = new Set(this.deliveries.map(d => d.deliveryAgent));
    this.agents = Array.from(agentSet).sort();
  }

  applyFilters(): void {
    this.filteredDeliveries = this.deliveries.filter(delivery => {
      const matchesSearch = !this.searchTerm ||
        delivery.deliveryId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        delivery.deliveryAgent.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        delivery.customerAddress.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus || delivery.status === this.selectedStatus;
      const matchesAgent = !this.selectedAgent || delivery.deliveryAgent === this.selectedAgent;

      return matchesSearch && matchesStatus && matchesAgent;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onAgentChange(): void {
    this.applyFilters();
  }

  openDeliveryForm(): void {
    const dialogRef = this.dialog.open(DeliveryFormComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDeliveries();
      }
    });
  }

  updateDeliveryStatus(delivery: Delivery, status: DeliveryStatus): void {
    if (delivery.id) {
      this.inventoryService.updateDeliveryStatus(delivery.id, status).subscribe({
        next: (updatedDelivery) => {
          this.snackBar.open('Delivery status updated', 'Close', { duration: 3000 });
          this.loadDeliveries();
        },
        error: (error) => {
          console.error('Error updating delivery status:', error);
          this.snackBar.open('Error updating delivery status', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getStatusColor(status: DeliveryStatus): string {
    return this.STATUS_CONFIG[status]?.color || 'bg-gray-100 text-gray-800';
  }

  getTotalItems(delivery: Delivery): number {
    return delivery.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  // KPI calculation methods
  getTotalDeliveries(): number {
    return this.deliveries.length;
  }

  private getDeliveriesByStatus(status: DeliveryStatus): number {
    return this.deliveries.filter(d => d.status === status).length;
  }

  getPendingDeliveries(): number {
    return this.getDeliveriesByStatus(DeliveryStatus.PENDING);
  }

  getInTransitDeliveries(): number {
    return this.getDeliveriesByStatus(DeliveryStatus.IN_TRANSIT);
  }

  getDeliveredCount(): number {
    return this.getDeliveriesByStatus(DeliveryStatus.DELIVERED);
  }

  getDamagedDeliveries(): number {
    return this.getDeliveriesByStatus(DeliveryStatus.DAMAGED_IN_TRANSIT);
  }

  getFilteredCount(): number {
    return this.filteredDeliveries.length;
  }

  // Helper methods for table display
  getFirstProductName(delivery: Delivery): string {
    return delivery.items && delivery.items.length > 0 ? delivery.items[0].productName : 'N/A';
  }

  getFirstProductSku(delivery: Delivery): string {
    return delivery.items && delivery.items.length > 0 ? delivery.items[0].productSku : 'N/A';
  }

  getDeliveredDate(delivery: Delivery): string {
    if (delivery.status === DeliveryStatus.DELIVERED && delivery.deliveredAt) {
      return new Date(delivery.deliveredAt).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return '—';
  }

  formatStatus(status: DeliveryStatus): string {
    return this.STATUS_CONFIG[status]?.formatted || (status as string).replace('_', ' ');
  }

  getStatusClass(status: DeliveryStatus): string {
    return this.STATUS_CONFIG[status]?.class || 'default';
  }

  getStatusIcon(status: DeliveryStatus): string {
    return this.STATUS_CONFIG[status]?.icon || 'help';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedAgent = '';
    this.applyFilters();
  }

  openUpdateDialog(delivery: Delivery): void {
    const availableStatuses = this.getAvailableStatuses(delivery.status);

    if (availableStatuses.length === 0) {
      this.snackBar.open('No status update available for this delivery', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(DeliveryStatusDialogComponent, {
      width: '500px',
      data: {
        delivery: delivery,
        availableStatuses: availableStatuses
      }
    });

    dialogRef.afterClosed().subscribe(selectedStatus => {
      if (selectedStatus) {
        this.updateDeliveryStatus(delivery, selectedStatus);
      }
    });
  }

  private getAvailableStatuses(currentStatus: DeliveryStatus): DeliveryStatus[] {
    // Allow transitions to any status except staying the same
    const allStatuses = Object.values(DeliveryStatus);
    return allStatuses.filter(status => status !== currentStatus);
  }

  private getNextStatus(currentStatus: DeliveryStatus): DeliveryStatus | null {
    const available = this.getAvailableStatuses(currentStatus);
    return available.length > 0 ? available[0] : null;
  }

  canUpdateStatus(status: DeliveryStatus): boolean {
    return this.getAvailableStatuses(status).length > 0;
  }

  getUpdateButtonText(status: DeliveryStatus): string {
    const availableStatuses = this.getAvailableStatuses(status);

    if (availableStatuses.length === 0) {
      return 'Complete';
    }

    if (availableStatuses.length === 1) {
      switch (availableStatuses[0]) {
        case DeliveryStatus.IN_TRANSIT:
          return 'Start Transit';
        case DeliveryStatus.DELIVERED:
          return 'Mark Delivered';
        case DeliveryStatus.CANCELLED:
          return 'Cancel';
        case DeliveryStatus.DAMAGED_IN_TRANSIT:
          return 'Mark Damaged';
        default:
          return 'Update';
      }
    }

    return 'Update Status';
  }
}
