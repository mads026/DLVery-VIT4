import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inventory-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h3>Upload Inventory CSV</h3>
    <input type="file" (change)="onFileSelected($event)" accept=".csv" />
    <button mat-raised-button color="accent" (click)="upload()" [disabled]="!selectedFile">
      <mat-icon>cloud_upload</mat-icon> Upload
    </button>
  `,
})
export class InventoryUploadComponent {
  selectedFile: File | null = null;

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    this.selectedFile = fileInput.files?.[0] || null;
  }

  upload() {
    if (this.selectedFile) {
      console.log("Uploading:", this.selectedFile.name);
      // TODO: Implement upload logic using service
    }
  }
}
