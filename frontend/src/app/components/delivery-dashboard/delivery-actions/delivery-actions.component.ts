import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeliveryAgentDto, DeliveryAgentService, DeliveryUpdateRequest } from '../../../services/delivery-agent.service';
import { DeliveryStatus } from '../../../inventory/models/delivery.model';

@Component({
  selector: 'app-delivery-actions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="actions-container">
      <div class="header">
        <h3>Update Delivery: {{ data.delivery.deliveryId }}</h3>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="content">
        <!-- Quick Actions -->
        <div class="quick-actions">
          <h4>Quick Actions</h4>
          <div class="action-buttons">
            <button mat-raised-button color="primary" (click)="markInTransit()"
                    [disabled]="updating || data.delivery.status === 'IN_TRANSIT'">
              <mat-icon>local_shipping</mat-icon>
              Start Delivery
            </button>
            <button mat-raised-button color="accent" (click)="openDeliveredForm()"
                    [disabled]="updating || data.delivery.status === 'DELIVERED'">
              <mat-icon>check_circle</mat-icon>
              Mark Delivered
            </button>
          </div>
        </div>

        <!-- Issue Actions -->
        <div class="issue-actions">
          <h4>Report Issues</h4>
          <div class="action-buttons">
            <button mat-stroked-button color="warn" (click)="reportDoorLocked()" [disabled]="updating">
              <mat-icon>lock</mat-icon>
              Door Locked
            </button>
            <button mat-stroked-button color="warn" (click)="reportDamaged()" [disabled]="updating">
              <mat-icon>warning</mat-icon>
              Damaged
            </button>
            <button mat-stroked-button color="warn" (click)="markReturn()" [disabled]="updating">
              <mat-icon>keyboard_return</mat-icon>
              Return
            </button>
          </div>
        </div>

        <!-- Delivered Form -->
        <div *ngIf="showDeliveredForm" class="delivered-form">
          <h4>Delivery Completion</h4>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Customer Name</mat-label>
            <input matInput [(ngModel)]="customerName" placeholder="Enter customer name">
          </mat-form-field>

          <div class="signature-section">
            <h5>Customer Signature</h5>
            <div class="signature-container">
              <canvas #signatureCanvas
                      width="300"
                      height="150"
                      (mousedown)="startDrawing($event)"
                      (mousemove)="draw($event)"
                      (mouseup)="stopDrawing()"
                      (touchstart)="startDrawing($event)"
                      (touchmove)="draw($event)"
                      (touchend)="stopDrawing()">
              </canvas>
            </div>
            <div class="signature-actions">
              <button mat-button (click)="clearSignature()">
                <mat-icon>clear</mat-icon>
                Clear
              </button>
            </div>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes (Optional)</mat-label>
            <textarea matInput [(ngModel)]="notes" rows="3" placeholder="Any additional notes"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-button (click)="cancelDeliveredForm()">Cancel</button>
            <button mat-raised-button color="primary" (click)="confirmDelivered()" [disabled]="updating">
              <mat-icon>check</mat-icon>
              Confirm Delivery
            </button>
          </div>
        </div>

        <!-- Issue Form -->
        <div *ngIf="showIssueForm" class="issue-form">
          <h4>Report Issue: {{ selectedIssueType }}</h4>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Reason</mat-label>
            <textarea matInput [(ngModel)]="issueReason" rows="3"
                      [placeholder]="getIssuePlaceholder()" required></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Additional Notes</mat-label>
            <textarea matInput [(ngModel)]="notes" rows="2" placeholder="Any additional information"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-button (click)="cancelIssueForm()">Cancel</button>
            <button mat-raised-button color="warn" (click)="confirmIssue()" [disabled]="updating || !issueReason">
              <mat-icon>report</mat-icon>
              Report Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .actions-container {
      padding: 0;
      max-height: 80vh;
      overflow-y: auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #f5f5f5;
    }

    .header h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .content {
      padding: 16px;
    }

    .quick-actions,
    .issue-actions {
      margin-bottom: 24px;
    }

    .quick-actions h4,
    .issue-actions h4 {
      margin: 0 0 12px 0;
      font-size: 1rem;
      color: #333;
    }

    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .action-buttons button {
      flex: 1;
      min-width: 120px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .delivered-form,
    .issue-form {
      border-top: 1px solid #e0e0e0;
      padding-top: 16px;
    }

    .delivered-form h4,
    .issue-form h4 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .signature-section {
      margin-bottom: 16px;
    }

    .signature-section h5 {
      margin: 0 0 8px 0;
      font-size: 0.9rem;
      color: #666;
    }

    .signature-container {
      border: 2px dashed #ccc;
      border-radius: 4px;
      padding: 8px;
      background: #fafafa;
      text-align: center;
    }

    canvas {
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: crosshair;
      max-width: 100%;
      height: auto;
    }

    .signature-actions {
      margin-top: 8px;
      text-align: right;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .action-buttons {
        flex-direction: column;
      }

      .action-buttons button {
        min-width: unset;
        width: 100%;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .form-actions button {
        width: 100%;
      }

      canvas {
        width: 100%;
        max-width: 280px;
      }
    }
  `]
})
export class DeliveryActionsComponent {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;

  showDeliveredForm = false;
  showIssueForm = false;
  selectedIssueType = '';
  customerName = '';
  notes = '';
  issueReason = '';
  updating = false;

  private isDrawing = false;
  private ctx: CanvasRenderingContext2D | null = null;
  private signatureData = '';

  constructor(
    private bottomSheetRef: MatBottomSheetRef<DeliveryActionsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { delivery: DeliveryAgentDto },
    private deliveryAgentService: DeliveryAgentService,
    private snackBar: MatSnackBar
  ) {
    this.customerName = data.delivery.customerName || '';
  }

  ngAfterViewInit(): void {
    this.initializeCanvas();
  }

  close(): void {
    this.bottomSheetRef.dismiss();
  }

  markInTransit(): void {
    this.updateDeliveryStatus(DeliveryStatus.IN_TRANSIT, 'Delivery started');
  }

  openDeliveredForm(): void {
    this.showDeliveredForm = true;
    this.showIssueForm = false;
    // Initialize canvas after view update
    setTimeout(() => this.initializeCanvas(), 100);
  }

  cancelDeliveredForm(): void {
    this.showDeliveredForm = false;
    this.customerName = this.data.delivery.customerName || '';
    this.notes = '';
    this.clearSignature();
  }

  confirmDelivered(): void {
    const signatureBase64 = this.getSignatureBase64();

    const request: DeliveryUpdateRequest = {
      deliveryId: this.data.delivery.id,
      status: DeliveryStatus.DELIVERED,
      customerName: this.customerName,
      notes: this.notes,
      signatureBase64: signatureBase64
    };

    this.updateDelivery(request);
  }

  reportDoorLocked(): void {
    this.selectedIssueType = 'Door Locked';
    this.showIssueForm = true;
    this.showDeliveredForm = false;
  }

  reportDamaged(): void {
    this.selectedIssueType = 'Damaged';
    this.showIssueForm = true;
    this.showDeliveredForm = false;
  }

  markReturn(): void {
    this.selectedIssueType = 'Return';
    this.showIssueForm = true;
    this.showDeliveredForm = false;
  }

  cancelIssueForm(): void {
    this.showIssueForm = false;
    this.selectedIssueType = '';
    this.issueReason = '';
    this.notes = '';
  }

  confirmIssue(): void {
    let status: DeliveryStatus = DeliveryStatus.PENDING; // Default fallback
    switch (this.selectedIssueType) {
      case 'Door Locked':
        status = DeliveryStatus.DOOR_LOCKED;
        break;
      case 'Damaged':
        status = DeliveryStatus.DAMAGED_IN_TRANSIT;
        break;
      case 'Return':
        status = DeliveryStatus.RETURNED;
        break;
    }

    const request: DeliveryUpdateRequest = {
      deliveryId: this.data.delivery.id,
      status: status,
      statusReason: this.issueReason,
      notes: this.notes
    };

    this.updateDelivery(request);
  }

  getIssuePlaceholder(): string {
    switch (this.selectedIssueType) {
      case 'Door Locked':
        return 'Describe the situation (e.g., no one home, door locked, etc.)';
      case 'Damaged':
        return 'Describe the damage (e.g., package torn, items broken, etc.)';
      case 'Return':
        return 'Reason for return (e.g., customer refused, wrong address, etc.)';
      default:
        return 'Describe the issue';
    }
  }

  private updateDeliveryStatus(status: DeliveryStatus, message: string): void {
    const request: DeliveryUpdateRequest = {
      deliveryId: this.data.delivery.id,
      status: status
    };

    this.updateDelivery(request, message);
  }

  private updateDelivery(request: DeliveryUpdateRequest, successMessage?: string): void {
    this.updating = true;

    this.deliveryAgentService.updateDelivery(request).subscribe({
      next: (updatedDelivery) => {
        this.updating = false;
        this.snackBar.open(successMessage || 'Delivery updated successfully', 'Close', {
          duration: 3000
        });
        this.bottomSheetRef.dismiss(updatedDelivery);
      },
      error: (error) => {
        this.updating = false;
        this.snackBar.open('Failed to update delivery', 'Close', {
          duration: 3000
        });
        console.error('Error updating delivery:', error);
      }
    });
  }

  private initializeCanvas(): void {
    if (this.signatureCanvas) {
      this.ctx = this.signatureCanvas.nativeElement.getContext('2d');
      if (this.ctx) {
        this.setupCanvasContext();
      }
    }
  }

  private setupCanvasContext(): void {
    if (!this.ctx) return;

    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  startDrawing(event: MouseEvent | TouchEvent): void {
    this.isDrawing = true;
    const { x, y } = this.getEventCoordinates(event);

    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
    }

    event.preventDefault();
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing || !this.ctx) return;

    const { x, y } = this.getEventCoordinates(event);

    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    event.preventDefault();
  }

  private getEventCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  clearSignature(): void {
    if (this.ctx && this.signatureCanvas) {
      this.ctx.clearRect(0, 0, this.signatureCanvas.nativeElement.width, this.signatureCanvas.nativeElement.height);
    }
  }

  private getSignatureBase64(): string {
    if (this.signatureCanvas) {
      return this.signatureCanvas.nativeElement.toDataURL().split(',')[1];
    }
    return '';
  }
}
