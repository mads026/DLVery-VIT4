import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { InventoryService } from '../../services/inventory.service';
import { Product, ProductCategory } from '../../models/product.model';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorHandler } from '../../utils/error-handler.util';
import { StatusHelpers } from '../../utils/status-helpers.util';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  searchTerm = '';
  selectedCategory = '';
  showDamagedOnly = false;
  showPerishableOnly = false;

  displayedColumns: string[] = ['sku', 'name', 'category', 'quantity', 'unitPrice', 'status', 'actions'];
  categories = Object.values(ProductCategory);

  constructor(
    private inventoryService: InventoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.inventoryService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesDamaged = !this.showDamagedOnly || product.isDamaged;
      const matchesPerishable = !this.showPerishableOnly || product.isPerishable;

      return matchesSearch && matchesCategory && matchesDamaged && matchesPerishable;
    });
  }

  onSearchChange = (): void => this.applyFilters();
  onCategoryChange = (): void => this.applyFilters();
  onDamagedFilterChange = (): void => this.applyFilters();
  onPerishableFilterChange = (): void => this.applyFilters();

  openProductForm(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '600px',
      data: product || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  getStatusBadge(product: Product): string {
    return StatusHelpers.getProductStatus(product).class;
  }

  getStatusText(product: Product): string {
    return StatusHelpers.getProductStatus(product).text;
  }

  getStatusClass(product: Product): string {
    const statusClass = StatusHelpers.getProductStatus(product).class;
    return `status-${statusClass}`;
  }

  isExpiringSoon(product: Product): boolean {
    return StatusHelpers.isExpiringSoon(product);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
      this.snackBar.open('Please select a valid CSV file', 'Close', { duration: 3000 });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('File size must be less than 5MB', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.snackBar.open('Uploading file...', 'Close', { duration: 2000 });

    this.inventoryService.uploadInventoryFile(file).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open(response || 'File uploaded successfully', 'Close', { duration: 5000 });
        this.loadProducts();
        // Clear the file input
        event.target.value = '';
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(ErrorHandler.extractMessage(error), 'Close', { duration: 5000 });
        event.target.value = '';
      }
    });
  }

   downloadTemplate(): void {
     this.inventoryService.downloadTemplate().subscribe({
       next: (response) => {
         // Create blob and download
         const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = 'inventory_template.xlsx';
         a.click();
         window.URL.revokeObjectURL(url);

        this.snackBar.open('Template downloaded successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error downloading template:', error);
        this.snackBar.open('Error downloading template', 'Close', { duration: 3000 });
      }
    });
  }

  deleteProduct(product: Product): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Delete Product',
      message: `Are you sure you want to delete <strong>"${product.name}"</strong> (SKU: ${product.sku})?<br><br>This will also delete all inventory movement history for this product.<br><br><strong>This action cannot be undone.</strong>`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: dialogData,
      disableClose: true,
      hasBackdrop: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && product.id) {
        this.inventoryService.deleteProduct(product.id).subscribe({
          next: () => {
            this.snackBar.open(`Product "${product.name}" deleted successfully`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadProducts(); // Reload the product list
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            const errorDialogData: ConfirmationDialogData = {
              title: 'Delete Failed',
              message: `<strong>Unable to delete "${product.name}"</strong><br><br>${ErrorHandler.extractMessage(error)}`,
              confirmText: 'OK',
              type: 'danger'
            };

            this.dialog.open(ConfirmationDialogComponent, {
              width: '600px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              data: errorDialogData,
              panelClass: 'custom-dialog-container'
            });
          }
        });
      }
    });
  }
}
