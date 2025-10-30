import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBottomSheetModule, MatBottomSheet } from '@angular/material/bottom-sheet';
import { DeliveryAgentDto, DeliveryAgentService } from '../../../services/delivery-agent.service';
import { DeliveryActionsComponent } from '../delivery-actions/delivery-actions.component';

@Component({
  selector: 'app-delivery-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBottomSheetModule
  ],
  template: `
    <div class="delivery-card" [class.overdue]="delivery.isOverdue">
      <div class="card-header">
        <div class="delivery-id">
          <strong *ngIf="!shouldHideDeliveryId()">{{ delivery.deliveryId }}</strong>
          <mat-chip
            [style.background-color]="getPriorityColor()"
            [style.color]="'white'"
            class="priority-chip">
            {{ delivery.priorityDescription }}
          </mat-chip>
        </div>
        <div class="status-chip">
          <mat-chip
            [style.background-color]="getStatusColor()"
            [style.color]="'white'">
            {{ getStatusDisplay() }}
          </mat-chip>
        </div>
      </div>

      <div class="card-content">
        <div class="customer-info">
          <div class="info-row">
            <mat-icon class="info-icon">person</mat-icon>
            <span>{{ delivery.customerName || 'Customer Name TBD' }}</span>
          </div>
          <div class="info-row">
            <mat-icon class="info-icon">location_on</mat-icon>
            <span class="address">{{ delivery.customerAddress }}</span>
          </div>
          <div class="info-row" *ngIf="delivery.customerPhone">
            <mat-icon class="info-icon">phone</mat-icon>
            <span>{{ delivery.customerPhone }}</span>
          </div>
        </div>

        <div class="items-summary">
          <div class="items-count">
            <mat-icon>inventory_2</mat-icon>
            <span>{{ delivery.totalItems }} item(s)</span>
          </div>
          <div class="items-list" *ngIf="delivery.items && delivery.items.length > 0">
            <div *ngFor="let item of delivery.items.slice(0, 2)" class="item-preview">
              {{ item.quantity }}x {{ item.productName }}
            </div>
            <div *ngIf="delivery.items.length > 2" class="more-items">
              +{{ delivery.items.length - 2 }} more items
            </div>
          </div>
        </div>

        <div class="notes" *ngIf="delivery.notes">
          <mat-icon class="info-icon">note</mat-icon>
          <span>{{ delivery.notes }}</span>
        </div>

        <div class="status-reason" *ngIf="delivery.statusReason">
          <mat-icon class="info-icon" [style.color]="'#f44336'">warning</mat-icon>
          <span>{{ delivery.statusReason }}</span>
        </div>
      </div>

      <div class="card-actions">
        <button *ngIf="!isCompleted()" mat-raised-button color="primary" (click)="openActions()" class="action-button">
          <mat-icon>edit</mat-icon>
          Update Status
        </button>
        <div *ngIf="isCompleted()" class="delivered-badge" [class.issue-badge]="hasIssue()">
          <mat-icon>{{ getCompletionIcon() }}</mat-icon>
          <span>{{ getCompletionLabel() }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .delivery-card {
      background: white;
      padding: 1rem;
      border-left: 4px solid #e5e7eb;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .delivery-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .delivery-card.overdue {
      border-left-color: #f44336;
      background: #fff5f5;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      gap: 0.5rem;
    }

    .delivery-id {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .priority-chip,
    .status-chip mat-chip {
      font-size: 0.75rem;
      height: 1.5rem;
      line-height: 1.5rem;
    }

    .card-content {
      margin-bottom: 1rem;
    }

    .customer-info {
      margin-bottom: 0.75rem;
    }

    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 0.375rem;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .info-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      margin-right: 0.5rem;
      color: #666;
      flex-shrink: 0;
    }

    .address {
      flex: 1;
      word-break: break-word;
    }

    .items-summary {
      background: #f8f9fa;
      padding: 0.5rem;
      border-radius: 0.25rem;
      margin-bottom: 0.5rem;
    }

    .items-count {
      display: flex;
      align-items: center;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .items-count mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      margin-right: 0.375rem;
    }

    .items-list {
      font-size: 0.85rem;
      color: #666;
    }

    .item-preview {
      margin-bottom: 0.125rem;
    }

    .more-items {
      font-style: italic;
      color: #999;
    }

    .notes,
    .status-reason {
      display: flex;
      align-items: flex-start;
      font-size: 0.85rem;
      margin-bottom: 0.375rem;
      padding: 0.5rem;
      border-radius: 0.25rem;
    }

    .notes {
      background: #f3f4f6;
      color: #374151;
    }

    .status-reason {
      color: #f44336;
      background: #ffebee;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
    }

    .action-button mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .delivered-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: #10b981;
      font-weight: 500;
      font-size: 0.9rem;
      padding: 0.5rem;
      background: #f0fdf4;
      border: 1px solid #22c55e;
      border-radius: 0.25rem;
    }

    .delivered-badge.issue-badge {
      color: #f59e0b;
      background: #fffbeb;
      border: 1px solid #fbbf24;
    }

    .delivered-badge mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .delivery-card {
        padding: 12px;
      }

      .card-header {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }

      .card-actions {
        flex-direction: column;
        gap: 6px;
      }

      .action-button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class DeliveryCardComponent {
  @Input() delivery!: DeliveryAgentDto;
  @Input() isDelivered = false;
  @Output() statusUpdate = new EventEmitter<DeliveryAgentDto>();
  @Output() viewDetails = new EventEmitter<DeliveryAgentDto>();

  constructor(
    private deliveryAgentService: DeliveryAgentService,
    private bottomSheet: MatBottomSheet
  ) { }

  getPriorityColor(): string {
    return this.deliveryAgentService.getPriorityColor(this.delivery.priority);
  }

  getStatusColor(): string {
    return this.deliveryAgentService.getStatusColor(this.delivery.status);
  }

  getStatusDisplay(): string {
    return this.delivery.status.replace('_', ' ');
  }

  shouldHideDeliveryId(): boolean {
    // Hide delivery IDs that match the pattern DLV-2024-XXX
    return this.delivery.deliveryId.startsWith('DLV-2024-');
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.delivery);
  }

  openActions(): void {
    const bottomSheetRef = this.bottomSheet.open(DeliveryActionsComponent, {
      data: { delivery: this.delivery }
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      if (result) {
        this.statusUpdate.emit(result);
      }
    });
  }

  isCompleted(): boolean {
    // Check if delivery is in a completed state (can't be updated anymore)
    return ['DELIVERED', 'RETURNED', 'DAMAGED_IN_TRANSIT', 'DOOR_LOCKED'].includes(this.delivery.status);
  }

  hasIssue(): boolean {
    return ['RETURNED', 'DAMAGED_IN_TRANSIT', 'DOOR_LOCKED'].includes(this.delivery.status);
  }

  getCompletionIcon(): string {
    if (this.delivery.status === 'DELIVERED') {
      return 'check_circle';
    } else if (this.delivery.status === 'RETURNED') {
      return 'keyboard_return';
    } else if (this.delivery.status === 'DAMAGED_IN_TRANSIT') {
      return 'warning';
    } else if (this.delivery.status === 'DOOR_LOCKED') {
      return 'lock';
    }
    return 'check_circle';
  }

  getCompletionLabel(): string {
    if (this.delivery.status === 'DELIVERED') {
      return 'Completed';
    } else if (this.delivery.status === 'RETURNED') {
      return 'Returned';
    } else if (this.delivery.status === 'DAMAGED_IN_TRANSIT') {
      return 'Damaged';
    } else if (this.delivery.status === 'DOOR_LOCKED') {
      return 'Door Locked';
    }
    return 'Completed';
  }
}
