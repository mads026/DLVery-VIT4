import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

export interface InventoryItem {
  id: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  category: string;
  description: string;
  lastUpdated: Date;
  status: 'active' | 'low_stock' | 'out_of_stock';
}

@Component({
  selector: 'app-inventory-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    FormsModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Inventory Items</mat-card-title>
        <mat-card-subtitle>Current inventory status and details</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="table-controls">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Search products...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Filter by Category</mat-label>
            <mat-select (selectionChange)="applyCategoryFilter($event)">
              <mat-option value="">All Categories</mat-option>
              <mat-option value="electronics">Electronics</mat-option>
              <mat-option value="clothing">Clothing</mat-option>
              <mat-option value="books">Books</mat-option>
              <mat-option value="home">Home & Garden</mat-option>
              <mat-option value="sports">Sports</mat-option>
              <mat-option value="other">Other</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="inventory-table">
            <!-- Product Name Column -->
            <ng-container matColumnDef="productName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Product Name</th>
              <td mat-cell *matCellDef="let item">{{ item.productName }}</td>
            </ng-container>

            <!-- SKU Column -->
            <ng-container matColumnDef="sku">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>SKU</th>
              <td mat-cell *matCellDef="let item">{{ item.sku }}</td>
            </ng-container>

            <!-- Quantity Column -->
            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Quantity</th>
              <td mat-cell *matCellDef="let item">
                <span [ngClass]="getQuantityClass(item)">
                  {{ item.quantity }}
                </span>
              </td>
            </ng-container>

            <!-- Unit Price Column -->
            <ng-container matColumnDef="unitPrice">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Unit Price</th>
              <td mat-cell *matCellDef="let item">{{ item.unitPrice | currency }}</td>
            </ng-container>

            <!-- Category Column -->
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
              <td mat-cell *matCellDef="let item">
                <mat-chip [color]="getCategoryColor(item.category)">
                  {{ item.category }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let item">
                <mat-chip [color]="getStatusColor(item.status)">
                  {{ getStatusText(item.status) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Last Updated Column -->
            <ng-container matColumnDef="lastUpdated">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Updated</th>
              <td mat-cell *matCellDef="let item">{{ item.lastUpdated | date:'short' }}</td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let item">
                <button mat-icon-button (click)="editItem(item)" title="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteItem(item)" title="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [pageSizeOptions]="[5, 10, 20]"
            showFirstLastButtons>
          </mat-paginator>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .table-controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .table-container {
      overflow-x: auto;
    }
    .inventory-table {
      width: 100%;
      min-width: 800px;
    }
    .quantity-low {
      color: #ff9800;
      font-weight: 500;
    }
    .quantity-out {
      color: #f44336;
      font-weight: 500;
    }
    mat-chip {
      font-size: 0.75rem;
    }
    .mat-mdc-form-field {
      width: 250px;
    }
    @media (max-width: 768px) {
      .table-controls {
        flex-direction: column;
      }
      .mat-mdc-form-field {
        width: 100%;
      }
    }
  `]
})
export class InventoryTableComponent implements OnInit {
  displayedColumns: string[] = ['productName', 'sku', 'quantity', 'unitPrice', 'category', 'status', 'lastUpdated', 'actions'];
  dataSource = new MatTableDataSource<InventoryItem>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Sample data - in a real app, this would come from a service
  sampleData: InventoryItem[] = [
    {
      id: 1,
      productName: 'Wireless Headphones',
      sku: 'WH-001',
      quantity: 25,
      unitPrice: 99.99,
      category: 'electronics',
      description: 'High-quality wireless headphones with noise cancellation',
      lastUpdated: new Date('2024-01-15'),
      status: 'active'
    },
    {
      id: 2,
      productName: 'Cotton T-Shirt',
      sku: 'TS-002',
      quantity: 5,
      unitPrice: 19.99,
      category: 'clothing',
      description: 'Comfortable cotton t-shirt in various sizes',
      lastUpdated: new Date('2024-01-14'),
      status: 'low_stock'
    },
    {
      id: 3,
      productName: 'Programming Book',
      sku: 'BK-003',
      quantity: 0,
      unitPrice: 49.99,
      category: 'books',
      description: 'Comprehensive guide to modern programming',
      lastUpdated: new Date('2024-01-13'),
      status: 'out_of_stock'
    },
    {
      id: 4,
      productName: 'Garden Tools Set',
      sku: 'GT-004',
      quantity: 12,
      unitPrice: 79.99,
      category: 'home',
      description: 'Complete set of essential garden tools',
      lastUpdated: new Date('2024-01-12'),
      status: 'active'
    },
    {
      id: 5,
      productName: 'Tennis Racket',
      sku: 'TR-005',
      quantity: 8,
      unitPrice: 129.99,
      category: 'sports',
      description: 'Professional tennis racket for all skill levels',
      lastUpdated: new Date('2024-01-11'),
      status: 'active'
    }
  ];

  ngOnInit(): void {
    this.dataSource.data = this.sampleData;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyCategoryFilter(event: MatSelectChange): void {
    const category = event.value;
    if (category) {
      this.dataSource.filterPredicate = (data: InventoryItem, filter: string) => {
        return data.category.toLowerCase().includes(filter.toLowerCase());
      };
      this.dataSource.filter = category;
    } else {
      this.dataSource.filter = '';
    }

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getQuantityClass(item: InventoryItem): string {
    if (item.quantity === 0) return 'quantity-out';
    if (item.quantity <= 10) return 'quantity-low';
    return '';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      electronics: 'primary',
      clothing: 'accent',
      books: 'warn',
      home: 'accent',
      sports: 'primary',
      other: 'basic'
    };
    return colors[category] || 'basic';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: 'primary',
      low_stock: 'accent',
      out_of_stock: 'warn'
    };
    return colors[status] || 'basic';
  }

  getStatusText(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  editItem(item: InventoryItem): void {
    console.log('Edit item:', item);
    // Here you would typically open an edit dialog or navigate to edit form
  }

  deleteItem(item: InventoryItem): void {
    console.log('Delete item:', item);
    // Here you would typically show a confirmation dialog and delete the item
  }
}
