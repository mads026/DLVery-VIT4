import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { DeliveryAgentDto } from '../../../services/delivery-agent.service';

@Component({
  selector: 'app-delivery-completion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <div class="completion-dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">
          <mat-icon>check_circle</mat-icon>
          Delivery Completion Details
        </h2>
        <button mat-icon-button class="close-btn" (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="completion-details">
          <!-- Delivery Summary -->
          <div class="summary-section">
            <h3>📦 Delivery Summary</h3>
            <div class="summary-card">
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="summary-label">Delivery ID</span>
                  <span class="summary-value">{{ data.delivery.deliveryId }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Customer</span>
                  <span class="summary-value">{{ data.delivery.customerName }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Items</span>
                  <span class="summary-value">{{ getTotalItems() }} item(s)</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Completed</span>
                  <span class="summary-value">{{ getDeliveredDate() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Items Delivered -->
          <div class="items-section">
            <h3>📋 Items Delivered</h3>
            <div class="items-grid">
              <div *ngFor="let item of data.delivery.items" class="delivered-item">
                <div class="item-details">
                  <div class="item-name">{{ item.productName }}</div>
                  <div class="item-sku">SKU: {{ item.productSku }}</div>
                </div>
                <div class="item-quantity">
                  <mat-chip color="accent">{{ item.quantity }}x</mat-chip>
                </div>
              </div>
            </div>
          </div>

          <!-- Delivery Information -->
          <div class="delivery-info-section" *ngIf="data.delivery.statusReason || data.delivery.notes">
            <h3>📝 Delivery Information</h3>
            <div class="info-card">
              <div class="info-item" *ngIf="data.delivery.statusReason">
                <div class="info-header">
                  <mat-icon>description</mat-icon>
                  <span class="info-label">Reason/Notes</span>
                </div>
                <div class="info-content">{{ data.delivery.statusReason }}</div>
              </div>
              <div class="info-item" *ngIf="data.delivery.notes">
                <div class="info-header">
                  <mat-icon>note</mat-icon>
                  <span class="info-label">Additional Notes</span>
                </div>
                <div class="info-content">{{ data.delivery.notes }}</div>
              </div>
            </div>
          </div>

          <!-- Customer Signature -->
          <div class="signature-section" *ngIf="data.delivery.customerSignature">
            <h3>✍️ Customer Signature</h3>
            <div class="signature-card">
              <div class="signature-display">
                <img
                  [src]="'data:image/png;base64,' + data.delivery.customerSignature"
                  alt="Customer Signature"
                  class="signature-image"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="signature-fallback" style="display: none;">
                  <mat-icon class="signature-icon">person</mat-icon>
                  <div class="signature-text">{{ data.delivery.customerName }}</div>
                  <div class="signature-subtitle">Customer Name (Signature)</div>
                </div>
              </div>
              <div class="signature-info">
                <mat-icon>info</mat-icon>
                <span>Customer signature confirming successful delivery</span>
              </div>
            </div>
          </div>

          <!-- No Information Message -->
          <div class="no-info-section" *ngIf="!data.delivery.statusReason && !data.delivery.notes && !data.delivery.customerSignature">
            <div class="no-info-card">
              <mat-icon class="no-info-icon">info</mat-icon>
              <h4>No Additional Information</h4>
              <p>This delivery was completed without additional notes or signature capture.</p>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onClose()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .completion-dialog-container {
      padding: 0;
      max-width: 500px;
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
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

    .completion-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .summary-section h3,
    .items-section h3,
    .delivery-info-section h3,
    .signature-section h3 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .summary-card {
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .summary-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .summary-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }

    .items-grid {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .delivered-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f0fdf4;
      border: 1px solid #22c55e;
      border-radius: 0.25rem;
    }

    .item-details {
      flex: 1;
    }

    .item-name {
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .item-sku {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .item-quantity mat-chip {
      font-size: 0.75rem;
    }

    .info-card {
      background: #fefce8;
      border: 1px solid #eab308;
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .info-item {
      margin-bottom: 1rem;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #92400e;
    }

    .info-content {
      font-size: 0.875rem;
      color: #78350f;
      line-height: 1.5;
      padding-left: 1.5rem;
    }

    .signature-card {
      background: #f0fdf4;
      border: 1px solid #22c55e;
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .signature-display {
      text-align: center;
      margin-bottom: 1rem;
    }

    .signature-image {
      max-width: 100%;
      max-height: 150px;
      border-radius: 0.25rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .signature-fallback {
      text-align: center;
    }

    .signature-icon {
      font-size: 3rem;
      color: #10b981;
      margin-bottom: 1rem;
    }

    .signature-text {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.5rem;
      word-break: break-all;
    }

    .signature-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      font-style: italic;
    }

    .signature-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #dcfce7;
      border: 1px solid #16a34a;
      border-radius: 0.25rem;
      color: #166534;
      font-size: 0.875rem;
    }

    .no-info-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
    }

    .no-info-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .no-info-icon {
      font-size: 3rem;
      color: #9ca3af;
    }

    .no-info-card h4 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
    }

    .no-info-card p {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }
  `]
})
export class DeliveryCompletionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeliveryCompletionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { delivery: DeliveryAgentDto }
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }

  getTotalItems(): number {
    return this.data.delivery.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;
  }

  getDeliveredDate(): string {
    if (this.data.delivery.deliveredAt) {
      return new Date(this.data.delivery.deliveredAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'N/A';
  }
}
