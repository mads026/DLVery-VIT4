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
import { DeliveryStatusDialogComponent, DeliveryStatusUpdate } from '../delivery-status-dialog/delivery-status-dialog.component';
import { SignatureViewDialogComponent } from '../signature-view-dialog/signature-view-dialog.component';
import { StatusHelpers } from '../../utils/status-helpers.util';
import { ModernInputComponent } from '../../../shared/components/modern-input/modern-input.component';
import { ModernSelectComponent, SelectOption } from '../../../shared/components/modern-select/modern-select.component';

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
    MatMenuModule,
    ModernInputComponent,
    ModernSelectComponent
  ],
  templateUrl: './delivery-list.component.html',
  styleUrls: ['./delivery-list.component.css']
})
export class DeliveryListComponent implements OnInit {
  deliveries: Delivery[] = [];
  filteredDeliveries: Delivery[] = [];
  loading = true;
  searchTerm = '';
  selectedStatus = '';
  selectedAgent = '';

  displayedColumns: string[] = ['deliveryId', 'customer', 'agent', 'status', 'items', 'createdAt', 'deliveredAt', 'reason', 'signature', 'actions'];
  statuses = Object.values(DeliveryStatus);
  agents: string[] = [];
  DeliveryStatus = DeliveryStatus;

  // Options for modern select components
  get statusOptions(): SelectOption[] {
    return [
      { value: '', label: 'All Status' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'IN_TRANSIT', label: 'In Transit' },
      { value: 'DELIVERED', label: 'Delivered' },
      { value: 'DOOR_LOCKED', label: 'Door Locked' },
      { value: 'DAMAGED_IN_TRANSIT', label: 'Damaged' },
      { value: 'RETURNED', label: 'Returned' },
      { value: 'CANCELLED', label: 'Cancelled' }
    ];
  }

  get agentOptions(): SelectOption[] {
    return [
      { value: '', label: 'All Agents' },
      ...this.agents.map(agent => ({ value: agent, label: agent }))
    ];
  }

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

  onSearchChange = (): void => this.applyFilters();
  onStatusChange = (): void => this.applyFilters();
  onAgentChange = (): void => this.applyFilters();

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

  updateDeliveryStatus(delivery: Delivery, statusUpdate: DeliveryStatusUpdate): void {
    if (delivery.id) {
      this.inventoryService.updateDeliveryStatus(
        delivery.id,
        statusUpdate.status,
        statusUpdate.reason,
        statusUpdate.customerSignature,
        statusUpdate.notes
      ).subscribe({
        next: (updatedDelivery) => {
          this.snackBar.open('Delivery status updated successfully', 'Close', { duration: 3000 });
          this.loadDeliveries();
        },
        error: (error) => {
          console.error('Error updating delivery status:', error);
          this.snackBar.open('Error updating delivery status', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getStatusColor = (status: DeliveryStatus): string =>
    StatusHelpers.DELIVERY_STATUS_CONFIG[status]?.color || 'bg-gray-100 text-gray-800';

  getTotalItems = (delivery: Delivery): number =>
    delivery.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  getTotalDeliveries = (): number => this.deliveries.length;
  getPendingDeliveries = (): number => this.deliveries.filter(d => d.status === DeliveryStatus.PENDING).length;
  getInTransitDeliveries = (): number => this.deliveries.filter(d => d.status === DeliveryStatus.IN_TRANSIT).length;
  getDeliveredCount = (): number => this.deliveries.filter(d => d.status === DeliveryStatus.DELIVERED).length;
  getDamagedDeliveries = (): number => this.deliveries.filter(d => d.status === DeliveryStatus.DAMAGED_IN_TRANSIT).length;
  getFilteredCount = (): number => this.filteredDeliveries.length;

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

  formatStatus = (status: DeliveryStatus): string => StatusHelpers.formatDeliveryStatus(status);
  getStatusClass = (status: DeliveryStatus): string => StatusHelpers.getDeliveryStatusClass(status);
  getStatusIcon = (status: DeliveryStatus): string => StatusHelpers.getDeliveryStatusIcon(status);

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

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateDeliveryStatus(delivery, result);
      }
    });
  }

  private getAvailableStatuses = (currentStatus: DeliveryStatus): DeliveryStatus[] =>
    StatusHelpers.getAvailableDeliveryStatuses(currentStatus);

  canUpdateStatus = (status: DeliveryStatus): boolean => this.getAvailableStatuses(status).length > 0;

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

  getCustomerName = (delivery: Delivery): string => delivery.customerName || 'N/A';
  getStatusReason = (delivery: Delivery): string => delivery.statusReason || '—';
  getCustomerSignature = (delivery: Delivery): string => delivery.customerSignature || '—';
  getDeliveryNotes = (delivery: Delivery): string => delivery.deliveryNotes || '—';
  hasAdditionalInfo = (delivery: Delivery): boolean =>
    !!(delivery.statusReason || delivery.customerSignature || delivery.deliveryNotes);

  getStatusReasonIcon(status: DeliveryStatus): string {
    switch (status) {
      case DeliveryStatus.DAMAGED_IN_TRANSIT:
      case DeliveryStatus.RETURNED:
      case DeliveryStatus.DOOR_LOCKED:
        return 'description';
      case DeliveryStatus.DELIVERED:
        return 'signature';
      default:
        return '';
    }
  }

  getStatusReasonTooltip(status: DeliveryStatus): string {
    switch (status) {
      case DeliveryStatus.DAMAGED_IN_TRANSIT:
        return 'Damage description available';
      case DeliveryStatus.RETURNED:
        return 'Return reason available';
      case DeliveryStatus.DOOR_LOCKED:
        return 'Delivery attempt notes available';
      case DeliveryStatus.DELIVERED:
        return 'Customer signature available';
      default:
        return '';
    }
  }

  viewSignature(delivery: Delivery): void {
    const signatureDialog = this.dialog.open(SignatureViewDialogComponent, {
      width: '500px',
      data: {
        delivery: delivery,
        signature: delivery.customerSignature,
        customerName: delivery.customerName,
        deliveryId: delivery.deliveryId
      }
    });
  }
}
