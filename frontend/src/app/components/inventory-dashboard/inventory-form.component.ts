import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Needed for native date adapter

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule   // <-- Required for Datepicker to work
  ],
  template: `
    <form [formGroup]="inventoryForm" (ngSubmit)="onSubmit()" class="form-wrapper">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Product Name</mat-label>
        <input matInput formControlName="productName" required>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Category</mat-label>
        <mat-select formControlName="category">
          <mat-option value="Perishable">Perishable</mat-option>
          <mat-option value="Non-Perishable">Non-Perishable</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Quantity</mat-label>
        <input matInput type="number" formControlName="quantity" required>
      </mat-form-field>

      <!-- ✅ Material Datepicker -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Expiry Date</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="expiryDate">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Is Damaged?</mat-label>
        <mat-select formControlName="damaged">
          <mat-option [value]="false">No</mat-option>
          <mat-option [value]="true">Yes</mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="inventoryForm.invalid">
        Submit
      </button>
    </form>
  `,
  styles: [`
    .form-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      background: #fafafa;
      border-radius: 12px;
      transition: box-shadow 0.3s ease;
    }
    .form-wrapper:hover {
      box-shadow: 0 4px 18px rgba(0,0,0,0.15);
      background: #ffffff;
    }
    .full-width { width: 100%; }
    button {
      align-self: flex-start;
      padding: 0.6rem 1.2rem;
      font-weight: 600;
    }
  `]
})
export class InventoryFormComponent {
  inventoryForm: FormGroup;
  constructor(private fb: FormBuilder) {
    this.inventoryForm = this.fb.group({
      productName: ['', Validators.required],
      category: ['', Validators.required],
      quantity: [0, Validators.required],
      expiryDate: [null], // Store as Date object
      damaged: [false]
    });
  }

  onSubmit() {
    console.log(this.inventoryForm.value);
  }
}
