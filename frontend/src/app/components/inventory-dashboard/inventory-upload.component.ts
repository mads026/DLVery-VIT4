import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-inventory-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <div class="upload-container">
      <div class="upload-area" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <h3>Upload Inventory CSV File</h3>
        <p>Drag and drop your CSV file here, or click to browse</p>
        <input
          type="file"
          #fileInput
          (change)="onFileSelected($event)"
          accept=".csv"
          style="display: none;">
        <button mat-raised-button color="primary" (click)="fileInput.click()">
          Choose File
        </button>
      </div>

      <div *ngIf="selectedFile" class="file-info">
        <mat-card>
          <mat-card-content>
            <div class="file-details">
              <mat-icon color="primary">description</mat-icon>
              <div class="file-text">
                <strong>{{ selectedFile.name }}</strong>
                <span>{{ getFileSize(selectedFile.size) }}</span>
              </div>
              <button mat-icon-button color="warn" (click)="clearFile()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="upload-actions">
              <button mat-raised-button color="primary" (click)="uploadFile()" [disabled]="isUploading">
                <mat-icon *ngIf="!isUploading">upload</mat-icon>
                <mat-icon *ngIf="isUploading" class="spinning">sync</mat-icon>
                {{ isUploading ? 'Uploading...' : 'Upload' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="isUploading" class="progress-container">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      </div>

      <div *ngIf="uploadResult" class="upload-result" [ngClass]="{'success': uploadResult.success, 'error': !uploadResult.success}">
        <mat-icon>{{ uploadResult.success ? 'check_circle' : 'error' }}</mat-icon>
        <span>{{ uploadResult.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      text-align: center;
    }
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 1rem;
      background-color: #fafafa;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .upload-area:hover {
      border-color: #2196f3;
      background-color: #f0f8ff;
    }
    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
      margin-bottom: 1rem;
    }
    .file-info mat-card {
      margin-top: 1rem;
    }
    .file-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .file-text {
      flex: 1;
      text-align: left;
    }
    .file-text strong {
      display: block;
      font-size: 1rem;
    }
    .file-text span {
      color: #666;
      font-size: 0.875rem;
    }
    .upload-actions {
      text-align: center;
    }
    .progress-container {
      margin-top: 1rem;
    }
    .upload-result {
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .upload-result.success {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    .upload-result.error {
      background-color: #ffebee;
      color: #c62828;
    }
    .spinning {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class InventoryUploadComponent {
  selectedFile: File | null = null;
  isUploading = false;
  uploadResult: { success: boolean; message: string } | null = null;

  constructor(private snackBar: MatSnackBar) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      this.snackBar.open('Please select a CSV file', 'Close', { duration: 3000 });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      this.snackBar.open('File size must be less than 10MB', 'Close', { duration: 3000 });
      return;
    }

    this.selectedFile = file;
    this.uploadResult = null;
  }

  clearFile(): void {
    this.selectedFile = null;
    this.uploadResult = null;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadResult = null;

    // Simulate file upload
    setTimeout(() => {
      // Here you would typically call a service to upload the file
      // For now, we'll simulate a successful upload
      this.isUploading = false;
      this.uploadResult = {
        success: true,
        message: `Successfully uploaded ${this.selectedFile!.name}`
      };

      this.snackBar.open(this.uploadResult.message, 'Close', { duration: 3000 });
      this.selectedFile = null;
    }, 2000);
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
