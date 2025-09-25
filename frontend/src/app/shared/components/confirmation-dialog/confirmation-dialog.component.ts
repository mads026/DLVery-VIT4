import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirmation-dialog">
      <div class="dialog-header" [ngClass]="'header-' + (data.type || 'info')">
        <mat-icon class="dialog-icon">
          {{ getIcon() }}
        </mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      
      <div mat-dialog-content class="dialog-content">
        <div class="message-content" [innerHTML]="data.message"></div>
      </div>
      
      <div mat-dialog-actions class="dialog-actions">
        <button mat-button 
                (click)="onCancel()" 
                class="cancel-btn">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button 
                (click)="onConfirm()" 
                [ngClass]="'confirm-btn-' + (data.type || 'info')"
                class="confirm-btn">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      width: 600px;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 2rem 2rem 1.25rem 2rem;
      margin: -2rem -2rem 0 -2rem;
      border-radius: 4px 4px 0 0;
      flex-shrink: 0;
    }

    .header-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .header-danger {
      background: #fee2e2;
      color: #991b1b;
    }

    .header-info {
      background: #dbeafe;
      color: #1e40af;
    }

    .dialog-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      flex-shrink: 0;
    }

    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 1.3;
    }

    .dialog-content {
      padding: 1.75rem 2rem;
      color: #374151;
      line-height: 1.6;
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .message-content {
      flex: 1;
      overflow: hidden;
      word-wrap: break-word;
      hyphens: auto;
    }

    .message-content p {
      margin: 0 0 1rem 0;
    }

    .message-content p:last-child {
      margin-bottom: 0;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1.25rem;
      padding: 1.75rem 2rem 1.5rem 2rem;
      margin: 0;
      flex-shrink: 0;
      border-top: 1px solid #f1f5f9;
    }

    .cancel-btn {
      color: #6b7280;
      padding: 0.75rem 1.5rem;
    }

    .cancel-btn:hover {
      background: #f3f4f6;
    }

    .confirm-btn {
      min-width: 100px;
      padding: 0.75rem 1.5rem;
    }

    .confirm-btn-warning {
      background: #f59e0b;
      color: white;
    }

    .confirm-btn-warning:hover {
      background: #d97706;
    }

    .confirm-btn-danger {
      background: #dc2626;
      color: white;
    }

    .confirm-btn-danger:hover {
      background: #b91c1c;
    }

    .confirm-btn-info {
      background: #3b82f6;
      color: white;
    }

    .confirm-btn-info:hover {
      background: #2563eb;
    }

    /* Ensure no scrollbars appear and force width */
    :host ::ng-deep .mat-mdc-dialog-container {
      overflow: hidden !important;
      width: 600px !important;
      max-width: 90vw !important;
    }

    :host ::ng-deep .mat-mdc-dialog-content {
      overflow: hidden !important;
      max-height: none !important;
    }

    :host ::ng-deep .mat-mdc-dialog-surface {
      width: 600px !important;
      max-width: 90vw !important;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}