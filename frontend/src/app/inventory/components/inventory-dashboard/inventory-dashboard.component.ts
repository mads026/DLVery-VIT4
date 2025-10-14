import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventoryService } from '../../services/inventory.service';
import { DashboardStats } from '../../models/delivery.model';
import { Product } from '../../models/product.model';
import { StatusHelpers } from '../../utils/status-helpers.util';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './inventory-dashboard.component.html',
  styleUrls: ['./inventory-dashboard.component.css']
})
export class InventoryDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';

  // All inventory items (from backend)
  allInventoryItems: any[] = [];

  // Filtered inventory items (what's displayed in the table)
  filteredInventoryItems: any[] = [];

  // Available categories for the filter dropdown
  availableCategories: string[] = [];

  // Delivery data for KPI calculations
  allDeliveries: any[] = [];

  // Loading states
  private productsLoaded = false;
  private deliveriesLoaded = false;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadProducts();
    this.loadDeliveries();
  }

  loadDashboardStats(): void {
    this.inventoryService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.loading = false;
      }
    });
  }

  loadProducts(): void {
    this.inventoryService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        // Transform products to match the dashboard item format
        this.allInventoryItems = products.map(product => {
          const statusInfo = StatusHelpers.getProductStatus(product);
          return {
            sku: product.sku,
            name: product.name,
            category: product.category.replace('_', ' '),
            quantity: product.quantity,
            location: 'A-1-01', // Default location
            status: statusInfo.status,
            statusClass: statusInfo.class,
            expiryDate: product.expiryDate || 'N/A',
            unitPrice: product.unitPrice
          };
        });

        this.filteredInventoryItems = [...this.allInventoryItems];
        this.availableCategories = [...new Set(products.map(p => p.category.replace('_', ' ')))];
        this.productsLoaded = true;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.allInventoryItems = [];
        this.filteredInventoryItems = [];
        this.productsLoaded = true;
        this.checkLoadingComplete();
      }
    });
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  calculateTotalValue = (): number =>
    this.allInventoryItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);

  calculateTotalProducts = (): number => this.allInventoryItems.length;

  calculateDamagedProducts = (): number =>
    this.allInventoryItems.filter(item => item.status === 'Damaged' || item.quantity === 0).length;

  calculateExpiringProducts = (): number =>
    this.allInventoryItems.filter(item => item.status === 'Expiring Soon').length;

  calculatePendingDeliveries = (): number =>
    this.allDeliveries.filter(d => d.status === 'PENDING' || d.status === 'IN_TRANSIT').length;

  calculateSuccessfulDeliveries = (): number =>
    this.allDeliveries.filter(d => d.status === 'DELIVERED').length;

  loadDeliveries(): void {
    this.inventoryService.getAllDeliveries().subscribe({
      next: (deliveries) => {
        this.allDeliveries = deliveries;
        this.deliveriesLoaded = true;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading deliveries:', error);
        this.allDeliveries = [];
        this.deliveriesLoaded = true;
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    if (this.productsLoaded && this.deliveriesLoaded) {
      this.loading = false;
    }
  }

  onSearchChange = (): void => this.applyFilters();
  onCategoryChange = (): void => this.applyFilters();
  onStatusChange = (): void => this.applyFilters();

  applyFilters(): void {
    let filtered = [...this.allInventoryItems];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.sku.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    // Apply status filter
    if (this.selectedStatus) {
      const statusFilters: { [key: string]: (item: any) => boolean } = {
        'good': (item) => item.status === 'Good' && item.quantity > 0,
        'damaged': (item) => item.status === 'Damaged' || item.quantity === 0,
        'expiring': (item) => item.status === 'Expiring Soon'
      };

      const filterFn = statusFilters[this.selectedStatus];
      if (filterFn) {
        filtered = filtered.filter(filterFn);
      }
    }

    this.filteredInventoryItems = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  getFilteredItemsCount = (): number => this.filteredInventoryItems.length;
  getTotalItemsCount = (): number => this.allInventoryItems.length;
  getProductTotal = (item: any): number => item.quantity * item.unitPrice;
}
