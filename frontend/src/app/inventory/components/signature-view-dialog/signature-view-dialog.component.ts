import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Dialog component for viewing customer signatures on delivered orders
 */
@Component({
  selector: 'app-signature-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="signature-dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">
          <mat-icon>signature</mat-icon>
          Customer Signature
        </h2>
        <button mat-icon-button class="close-btn" (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="signature-info">
          <div class="info-section">
            <h3>Delivery Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Delivery ID</span>
                <span class="info-value">{{ data.deliveryId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Customer</span>
                <span class="info-value">{{ data.customerName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <span class="status-badge delivered">
                  <mat-icon>check_circle</mat-icon>
                  DELIVERED
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Delivered At</span>
                <span class="info-value">{{ getDeliveredDate() }}</span>
              </div>
            </div>
          </div>

          <div class="signature-section">
            <h3>Customer Signature</h3>
            <div class="signature-display">
              <div class="signature-box">
                <div *ngIf="data.signature; else noSignature" class="signature-image-container">
                  <img
                    [src]="'data:image/png;base64,' + data.signature"
                    alt="Customer Signature"
                    class="signature-image"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                  <div class="signature-fallback" style="display: none;">
                    <mat-icon class="signature-icon">person</mat-icon>
                    <div class="signature-text">Signature Image</div>
                    <div class="signature-subtitle">Digital Signature</div>
                  </div>
                </div>
                <ng-template #noSignature>
                  <div class="no-signature">
                    <mat-icon class="signature-icon">person</mat-icon>
                    <div class="signature-text">No Signature Available</div>
                    <div class="signature-subtitle">Signature not captured</div>
                  </div>
                </ng-template>
              </div>
            </div>
            <div class="signature-note">
              <mat-icon>info</mat-icon>
              <span>This signature serves as acknowledgment of successful delivery</span>
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
    .signature-dialog-container {
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
    }

    .dialog-actions {
      padding: 1rem 1.5rem;
      background: white;
      border-top: 1px solid #e5e7eb;
    }

    .signature-info {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .info-section h3 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
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

    .status-badge.delivered {
      background: #d1fae5;
      color: #065f46;
    }

    .signature-section h3 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
    }

    .signature-display {
      margin-bottom: 1rem;
    }

    .signature-box {
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      background: #f9fafb;
      position: relative;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .signature-image-container {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .signature-image {
      max-width: 100%;
      max-height: 200px;
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

    .no-signature {
      text-align: center;
      color: #9ca3af;
    }

    .signature-note {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      border-radius: 0.25rem;
      color: #1e40af;
      font-size: 0.875rem;
    }
  `]
})
export class SignatureViewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SignatureViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  getDeliveredDate(): string {
    if (this.data.delivery?.deliveredAt) {
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
