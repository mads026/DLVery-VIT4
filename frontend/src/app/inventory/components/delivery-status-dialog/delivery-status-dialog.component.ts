import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Delivery, DeliveryStatus } from '../../models/delivery.model';

export interface DeliveryStatusDialogData {
  delivery: Delivery;
  availableStatuses: DeliveryStatus[];
}

export interface DeliveryStatusUpdate {
  status: DeliveryStatus;
  reason?: string;
  customerSignature?: string;
  notes?: string;
}

@Component({
  selector: 'app-delivery-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
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
        <!-- Delivery Information Section -->
        <div class="delivery-info">
          <h3>Update the status of delivery #{{ data.delivery.id || data.delivery.deliveryId }}</h3>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Customer</span>
              <span class="info-value">{{ data.delivery.customerName || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Agent</span>
              <span class="info-value">{{ data.delivery.deliveryAgent }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Product</span>
              <span class="info-value">{{ getFirstProductName() }}</span>
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

        <!-- Status Selection Section -->
        <div class="status-options">
          <h4>Select New Status</h4>
          <div class="status-buttons-grid">
            <button
              *ngFor="let status of data.availableStatuses"
              mat-raised-button
              class="status-button"
              [ngClass]="getStatusButtonClass(status)"
              (click)="onStatusSelect(status)">
              <mat-icon>{{ getStatusIcon(status) }}</mat-icon>
              {{ getStatusButtonText(status) }}
            </button>
          </div>
        </div>

        <!-- Additional Information Section (shown after status selection) -->
        <div *ngIf="selectedStatus && showAdditionalFields()" class="additional-info-section">
          <h4>Additional Information</h4>

          <!-- Reason Field (for damaged, returned, door locked) -->
          <div *ngIf="requiresReason()" class="form-field">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ getReasonLabel() }}</mat-label>
              <textarea
                matInput
                formControlName="reason"
                rows="3"
                [placeholder]="getReasonPlaceholder()">
              </textarea>
              <mat-error *ngIf="statusForm.get('reason')?.hasError('required')">
                {{ getReasonLabel() }} is required
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Customer Signature Field (for delivered) -->
          <div *ngIf="requiresSignature()" class="form-field">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Customer Signature</mat-label>
              <input
                matInput
                formControlName="customerSignature"
                placeholder="Enter customer name as signature">
              <mat-hint>Customer's full name as acknowledgment of delivery</mat-hint>
              <mat-error *ngIf="statusForm.get('customerSignature')?.hasError('required')">
                Customer signature is required
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Notes Field (optional for all) -->
          <div class="form-field">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Additional Notes</mat-label>
              <textarea
                matInput
                formControlName="notes"
                rows="2"
                placeholder="Any additional notes or comments...">
              </textarea>
            </mat-form-field>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions" *ngIf="selectedStatus">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button
          mat-raised-button
          color="primary"
          (click)="onConfirm()"
          [disabled]="!statusForm.valid">
          Update Status
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      max-width: 600px;
      border-radius: 0.5rem;
      overflow: hidden;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 1.5rem 0 1.5rem;
      background: white;
      flex-shrink: 0;
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
      padding: 1rem 1.5rem;
      flex: 1;
      overflow-y: auto;
    }

    .dialog-actions {
      padding: 1rem 1.5rem;
      background: white;
      border-top: 1px solid #e5e7eb;
      flex-shrink: 0;
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
      display: flex !important;
      align-items: center !important;
      gap: 0.5rem !important;
      justify-content: center !important;
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

    .additional-info-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }

    .additional-info-section h4 {
      margin: 0 0 1.5rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
    }

    .form-field {
      margin-bottom: 1.5rem;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class DeliveryStatusDialogComponent {
  selectedStatus: DeliveryStatus | null = null;
  statusForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DeliveryStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeliveryStatusDialogData
  ) {
    this.statusForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      reason: [''],
      customerSignature: [''],
      notes: ['']
    });
  }

  onStatusSelect(status: DeliveryStatus): void {
    this.selectedStatus = status;
    this.updateFormValidation();
  }

  updateFormValidation(): void {
    const reasonControl = this.statusForm.get('reason');
    const signatureControl = this.statusForm.get('customerSignature');

    if (this.requiresReason()) {
      reasonControl?.setValidators([Validators.required]);
    } else {
      reasonControl?.clearValidators();
    }

    if (this.requiresSignature()) {
      signatureControl?.setValidators([Validators.required]);
    } else {
      signatureControl?.clearValidators();
    }

    reasonControl?.updateValueAndValidity();
    signatureControl?.updateValueAndValidity();
  }

  onConfirm(): void {
    if (this.statusForm.valid && this.selectedStatus) {
      const updateData: DeliveryStatusUpdate = {
        status: this.selectedStatus,
        reason: this.statusForm.get('reason')?.value || undefined,
        customerSignature: this.statusForm.get('customerSignature')?.value || undefined,
        notes: this.statusForm.get('notes')?.value || undefined
      };
      this.dialogRef.close(updateData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  requiresReason(): boolean {
    return this.selectedStatus ?
      [DeliveryStatus.DAMAGED_IN_TRANSIT, DeliveryStatus.RETURNED, DeliveryStatus.DOOR_LOCKED].includes(this.selectedStatus) :
      false;
  }

  requiresSignature(): boolean {
    return this.selectedStatus === DeliveryStatus.DELIVERED;
  }

  showAdditionalFields(): boolean {
    return this.selectedStatus !== null;
  }

  getReasonLabel(): string {
    switch (this.selectedStatus) {
      case DeliveryStatus.DAMAGED_IN_TRANSIT: return 'Damage Description';
      case DeliveryStatus.RETURNED: return 'Return Reason';
      case DeliveryStatus.DOOR_LOCKED: return 'Delivery Attempt Notes';
      default: return 'Reason';
    }
  }

  getReasonPlaceholder(): string {
    switch (this.selectedStatus) {
      case DeliveryStatus.DAMAGED_IN_TRANSIT: return 'Describe the damage and circumstances...';
      case DeliveryStatus.RETURNED: return 'Why was the delivery returned?';
      case DeliveryStatus.DOOR_LOCKED: return 'Describe the delivery attempt...';
      default: return 'Enter reason...';
    }
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
      case DeliveryStatus.IN_TRANSIT: return 'in-transit';
      case DeliveryStatus.DELIVERED: return 'delivered';
      case DeliveryStatus.CANCELLED: return 'cancelled';
      case DeliveryStatus.DAMAGED_IN_TRANSIT: return 'damaged';
      case DeliveryStatus.RETURNED: return 'returned';
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
      case DeliveryStatus.DOOR_LOCKED: return 'lock';
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
      case DeliveryStatus.IN_TRANSIT: return 'Start Transit';
      case DeliveryStatus.DELIVERED: return 'Mark Delivered';
      case DeliveryStatus.DAMAGED_IN_TRANSIT: return 'Mark Damaged';
      case DeliveryStatus.DOOR_LOCKED: return 'Door Locked';
      case DeliveryStatus.RETURNED: return 'Mark Returned';
      case DeliveryStatus.CANCELLED: return 'Cancel Delivery';
      default: return this.formatStatus(status);
    }
  }
}
