import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Delivery, DeliveryStatus } from '../../models/delivery.model';

export interface DeliveryStatusDialogData {
  delivery: Delivery;
  availableStatuses: DeliveryStatus[];
}

@Component({
  selector: 'app-delivery-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">Update Delivery Status</h2>
        <button mat-icon-button class="close-btn" (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="delivery-info">
          <h3>Update the status of delivery #{{ data.delivery.id || data.delivery.deliveryId }}</h3>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Product</span>
              <span class="info-value">{{ getFirstProductName() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Agent</span>
              <span class="info-value">{{ data.delivery.deliveryAgent }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Quantity</span>
              <span class="info-value">{{ getTotalQuantity() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Current Status</span>
              <span class="status-badge" [ngClass]="getCurrentStatusClass()">
                <mat-icon>{{ getStatusIcon(data.delivery.status) }}</mat-icon>
                {{ formatStatus(data.delivery.status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="status-options">
          <h4>Update Status</h4>
          <div class="status-buttons-grid">
            <button
              *ngFor="let status of data.availableStatuses"
              mat-raised-button
              class="status-button"
              [ngClass]="getStatusButtonClass(status)"
              (click)="selectStatus(status)">
              {{ getStatusButtonText(status) }}
            </button>
          </div>
        </div>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      max-width: 500px;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 1.5rem 0 1.5rem;
      background: white;
    }

    .dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }

    .close-btn {
      color: #6b7280;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.25rem;
      transition: background-color 0.2s;
    }

    .close-btn:hover {
      background-color: #f3f4f6;
    }

    .dialog-content {
      padding: 1rem 1.5rem 1.5rem 1.5rem;
    }

    .delivery-info {
      margin-bottom: 2rem;
    }

    .delivery-info h3 {
      margin: 0 0 1.5rem 0;
      font-size: 1rem;
      font-weight: 500;
      color: #6b7280;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
    }

    .info-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.in-transit {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-badge.delivered {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.damaged {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-options h4 {
      margin: 0 0 1.5rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
    }

    .status-buttons-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .status-button {
      padding: 0.75rem 1rem !important;
      border-radius: 0.5rem !important;
      font-weight: 500 !important;
      text-transform: none !important;
      transition: all 0.2s ease !important;
      border: none !important;
    }

    .status-button.in-transit {
      background: #f8fafc !important;
      color: #475569 !important;
      border: 1px solid #e2e8f0 !important;
    }

    .status-button.in-transit:hover {
      background: #f1f5f9 !important;
      border-color: #cbd5e1 !important;
    }

    .status-button.delivered {
      background: #10b981 !important;
      color: white !important;
    }

    .status-button.delivered:hover {
      background: #059669 !important;
    }

    .status-button.damaged {
      background: #ef4444 !important;
      color: white !important;
    }

    .status-button.damaged:hover {
      background: #dc2626 !important;
    }

    .status-button.pending {
      background: white !important;
      color: #374151 !important;
      border: 1px solid #d1d5db !important;
    }

    .status-button.pending:hover {
      background: #f9fafb !important;
      border-color: #9ca3af !important;
    }

    .status-button.cancelled {
      background: #6b7280 !important;
      color: white !important;
    }

    .status-button.cancelled:hover {
      background: #4b5563 !important;
    }

    .status-button.returned {
      background: #f59e0b !important;
      color: white !important;
    }

    .status-button.returned:hover {
      background: #d97706 !important;
    }
  `]
})
export class DeliveryStatusDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeliveryStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeliveryStatusDialogData
  ) {}

  selectStatus(status: DeliveryStatus): void {
    this.dialogRef.close(status);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  formatStatus(status: DeliveryStatus): string {
    switch (status) {
      case DeliveryStatus.PENDING: return 'PENDING';
      case DeliveryStatus.IN_TRANSIT: return 'IN TRANSIT';
      case DeliveryStatus.DELIVERED: return 'DELIVERED';
      case DeliveryStatus.DAMAGED_IN_TRANSIT: return 'DAMAGED';
      case DeliveryStatus.CANCELLED: return 'CANCELLED';
      case DeliveryStatus.RETURNED: return 'RETURNED';
      default: return (status as string).replace('_', ' ');
    }
  }

  getCurrentStatusClass(): string {
    return this.getStatusClass(this.data.delivery.status);
  }

  getStatusClass(status: DeliveryStatus): string {
    switch (status) {
      case DeliveryStatus.PENDING: return 'pending';
      case DeliveryStatus.IN_TRANSIT: return 'in-transit';
      case DeliveryStatus.DELIVERED: return 'delivered';
      case DeliveryStatus.DAMAGED_IN_TRANSIT: return 'damaged';
      case DeliveryStatus.CANCELLED: return 'cancelled';
      case DeliveryStatus.RETURNED: return 'returned';
      default: return 'default';
    }
  }

  getStatusButtonClass(status: DeliveryStatus): string {
    switch (status) {
      case DeliveryStatus.IN_TRANSIT: return 'transit';
      case DeliveryStatus.DELIVERED: return 'delivered';
      case DeliveryStatus.CANCELLED: return 'cancelled';
      case DeliveryStatus.DAMAGED_IN_TRANSIT: return 'damaged';
      default: return 'default';
    }
  }

  getStatusIcon(status: DeliveryStatus): string {
    switch (status) {
      case DeliveryStatus.PENDING: return 'schedule';
      case DeliveryStatus.IN_TRANSIT: return 'local_shipping';
      case DeliveryStatus.DELIVERED: return 'check_circle';
      case DeliveryStatus.DAMAGED_IN_TRANSIT: return 'warning';
      case DeliveryStatus.CANCELLED: return 'cancel';
      case DeliveryStatus.RETURNED: return 'keyboard_return';
      default: return 'help';
    }
  }

  getFirstProductName(): string {
    return this.data.delivery.items && this.data.delivery.items.length > 0
      ? this.data.delivery.items[0].productName
      : 'N/A';
  }

  getTotalQuantity(): number {
    return this.data.delivery.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  getStatusButtonText(status: DeliveryStatus): string {
    switch (status) {
      case DeliveryStatus.PENDING: return 'Reset to Pending';
      case DeliveryStatus.IN_TRANSIT: return 'Mark In Transit';
      case DeliveryStatus.DELIVERED: return 'Mark Delivered';
      case DeliveryStatus.DAMAGED_IN_TRANSIT: return 'Mark Damaged';
      case DeliveryStatus.CANCELLED: return 'Cancel Delivery';
      case DeliveryStatus.RETURNED: return 'Mark Returned';
      default: return this.formatStatus(status);
    }
  }
}
