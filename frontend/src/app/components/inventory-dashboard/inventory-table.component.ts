import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-inventory-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  template: `
  <div class="inventory-wrapper">
    <div class="table-header">
      <div>
        <h3 class="title">Inventory Table</h3>
        <p class="subtitle">View and filter current inventory items</p>
      </div>
      <button mat-raised-button color="accent" (click)="exportCSV()">Export CSV</button>
    </div>

    <div class="filters">
      <mat-form-field appearance="outline">
        <mat-label>Filter by Damaged</mat-label>
        <mat-select [(ngModel)]="filterDamaged">
          <mat-option [value]="null">All</mat-option>
          <mat-option [value]="true">Damaged</mat-option>
          <mat-option [value]="false">Not Damaged</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Filter by Perishable</mat-label>
        <mat-select [(ngModel)]="filterPerishable">
          <mat-option [value]="null">All</mat-option>
          <mat-option value="Perishable">Perishable</mat-option>
          <mat-option value="Non-Perishable">Non-Perishable</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <div class="table-container mat-elevation-z2">
      <table mat-table [dataSource]="filteredData()" class="custom-table">

        <ng-container matColumnDef="product">
          <th mat-header-cell *matHeaderCellDef> Product </th>
          <td mat-cell *matCellDef="let item">{{item.productName}}</td>
        </ng-container>

        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef> Category </th>
          <td mat-cell *matCellDef="let item">{{item.category}}</td>
        </ng-container>

        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef> Quantity </th>
          <td mat-cell *matCellDef="let item">{{item.quantity}}</td>
        </ng-container>

        <ng-container matColumnDef="damaged">
          <th mat-header-cell *matHeaderCellDef> Damaged </th>
          <td mat-cell *matCellDef="let item">
            <span class="chip" [ngClass]="item.damaged ? 'chip-danger' : 'chip-success'">
              {{ item.damaged ? 'Yes' : 'No' }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="expiry">
          <th mat-header-cell *matHeaderCellDef> Expiry </th>
          <td mat-cell *matCellDef="let item">{{item.expiryDate}}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="row-hover"></tr>
      </table>
    </div>
  </div>
  `,
  styles: [`
    .inventory-wrapper { padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
    .table-header { display: flex; justify-content: space-between; align-items: center; }
    .title { margin: 0; font-weight: 600; color: #37474f; }
    .subtitle { margin: 0; color: #666; font-size: 0.9rem; }
    .filters { display: flex;flex-wrap: wrap; gap: 1rem; }
    .filters mat-form-field { width: 220px; }
    .table-container { background: #fff; border-radius: 12px; overflow: hidden; }
    .custom-table { width: 100%; border-collapse: collapse; }
    ::ng-deep .mat-mdc-header-cell {
      background: #3f51b5 !important;
      color: #ffffff !important;
      font-weight: 600;
      text-transform: uppercase;
    }
    td.mat-cell { padding: 0.8rem; }
    .row-hover:hover { background: #f5f5f5; transition: background 0.3s; }
    .chip { padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500; }
    .chip-success { background: #e6f6ec; color: #2e7d32; }
    .chip-danger { background: #fdecea; color: #d32f2f; }
  `]
})
export class InventoryTableComponent {
  filterDamaged: boolean | null = null;
  filterPerishable: string | null = null;
  displayedColumns = ['product', 'category', 'quantity', 'damaged', 'expiry'];

  data = [
    { productName: 'Milk', category: 'Perishable', quantity: 10, damaged: false, expiryDate: '2025-10-01' },
    { productName: 'Rice', category: 'Non-Perishable', quantity: 25, damaged: true,  expiryDate: '2026-01-01' },
    { productName: 'Bread', category: 'Perishable', quantity: 50, damaged: false, expiryDate: '2025-09-30' },
    { productName: 'Sugar', category: 'Non-Perishable', quantity: 100, damaged: false, expiryDate: '2027-12-31' }
  ];

  filteredData() {
    return this.data.filter(item =>
      (this.filterDamaged === null || item.damaged === this.filterDamaged) &&
      (this.filterPerishable === null || item.category === this.filterPerishable)
    );
  }

  exportCSV() {
    const rows = this.filteredData();
    const csvContent =
      'Product,Category,Quantity,Damaged,Expiry\n' +
      rows.map(r =>
        `${r.productName},${r.category},${r.quantity},${r.damaged ? 'Yes' : 'No'},${r.expiryDate}`
      ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
