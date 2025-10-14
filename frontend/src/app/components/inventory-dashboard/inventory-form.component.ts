import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule
  ],
  template: `
    <form [formGroup]="inventoryForm" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline">
        <mat-label>Product Name</mat-label>
        <input matInput formControlName="productName" placeholder="Enter product name">
        <mat-error *ngIf="inventoryForm.get('productName')?.hasError('required')">
          Product name is required
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>SKU</mat-label>
        <input matInput formControlName="sku" placeholder="Enter SKU">
        <mat-error *ngIf="inventoryForm.get('sku')?.hasError('required')">
          SKU is required
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Quantity</mat-label>
        <input matInput type="number" formControlName="quantity" placeholder="Enter quantity">
        <mat-error *ngIf="inventoryForm.get('quantity')?.hasError('required')">
          Quantity is required
        </mat-error>
        <mat-error *ngIf="inventoryForm.get('quantity')?.hasError('min')">
          Quantity must be greater than 0
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Unit Price</mat-label>
        <input matInput type="number" step="0.01" formControlName="unitPrice" placeholder="Enter unit price">
        <mat-error *ngIf="inventoryForm.get('unitPrice')?.hasError('required')">
          Unit price is required
        </mat-error>
        <mat-error *ngIf="inventoryForm.get('unitPrice')?.hasError('min')">
          Unit price must be greater than 0
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Category</mat-label>
        <mat-select formControlName="category">
          <mat-option value="electronics">Electronics</mat-option>
          <mat-option value="clothing">Clothing</mat-option>
          <mat-option value="books">Books</mat-option>
          <mat-option value="home">Home & Garden</mat-option>
          <mat-option value="sports">Sports</mat-option>
          <mat-option value="other">Other</mat-option>
        </mat-select>
        <mat-error *ngIf="inventoryForm.get('category')?.hasError('required')">
          Category is required
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Description</mat-label>
        <textarea matInput formControlName="description" rows="3" placeholder="Enter product description"></textarea>
      </mat-form-field>

      <div class="form-actions">
        <button mat-raised-button color="primary" type="submit" [disabled]="inventoryForm.invalid">
          {{ isEditing ? 'Update Item' : 'Add Item' }}
        </button>
        <button mat-button type="button" (click)="resetForm()">Clear</button>
      </div>
    </form>
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 500px;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class InventoryFormComponent {
  inventoryForm: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder) {
    this.inventoryForm = this.fb.group({
      productName: ['', Validators.required],
      sku: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unitPrice: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.inventoryForm.valid) {
      const formData = this.inventoryForm.value;
      console.log('Form submitted:', formData);
      // Here you would typically call a service to save the data
      // For now, we'll just log it and reset the form
      this.resetForm();
    }
  }

  resetForm(): void {
    this.inventoryForm.reset();
    this.isEditing = false;
  }
}
