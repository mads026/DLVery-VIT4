import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { InventoryService } from '../../services/inventory.service';
import { Product, ProductCategory } from '../../models/product.model';
import { ErrorHandler } from '../../utils/error-handler.util';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  categories = Object.values(ProductCategory);
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.isEditMode = !!data;
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data) {
      this.productForm.patchValue(this.data);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      sku: [''], // SKU will be auto-generated, not required from user
      name: ['', [Validators.required]],
      description: [''],
      category: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      isDamaged: [false],
      isPerishable: [false],
      expiryDate: [null]
    });
  }

  onPerishableChange(): void {
    const isPerishable = this.productForm.get('isPerishable')?.value;
    const expiryDateControl = this.productForm.get('expiryDate');

    if (isPerishable) {
      expiryDateControl?.setValidators([Validators.required]);
    } else {
      expiryDateControl?.clearValidators();
      expiryDateControl?.setValue(null);
    }
    expiryDateControl?.updateValueAndValidity();
  }

  get minDate(): Date {
    return new Date(); // Today's date as minimum
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formValue = { ...this.productForm.value };

      // Convert date to ISO string if present
      if (formValue.expiryDate) {
        formValue.expiryDate = new Date(formValue.expiryDate).toISOString().split('T')[0];
      }

      // Remove SKU from payload when creating new product (it will be auto-generated)
      if (!this.isEditMode) {
        delete formValue.sku;
        console.log('Creating new product without SKU (will be auto-generated)');
      }

      console.log('Submitting product data:', formValue);

      if (this.isEditMode && this.data?.id) {
        this.inventoryService.updateProduct(this.data.id, formValue).subscribe({
          next: (product) => {
            this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.snackBar.open(ErrorHandler.extractMessage(error), 'Close', { duration: 5000 });
          }
        });
      } else {
        this.inventoryService.createProduct(formValue).subscribe({
          next: (product) => {
            this.snackBar.open(`Product created successfully with SKU: ${product.sku}`, 'Close', { duration: 4000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.snackBar.open(ErrorHandler.extractMessage(error), 'Close', { duration: 5000 });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
