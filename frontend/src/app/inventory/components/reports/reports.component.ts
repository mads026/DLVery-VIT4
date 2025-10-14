 import { Component, OnInit } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { FormsModule } from '@angular/forms';
 import { MatButtonModule } from '@angular/material/button';
 import { MatIconModule } from '@angular/material/icon';
 import { MatFormFieldModule } from '@angular/material/form-field';
 import { MatInputModule } from '@angular/material/input';
 import { MatSelectModule } from '@angular/material/select';
 import { MatDatepickerModule } from '@angular/material/datepicker';
 import { MatNativeDateModule } from '@angular/material/core';
 import { InventoryService } from '../../services/inventory.service';
 import { Delivery, DeliveryStatus } from '../../models/delivery.model';
 import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
    // Filter properties
    fromDate: Date;
    toDate: Date = new Date();   // Today
    selectedAgent: string = '';
    availableAgents: string[] = [];
    agentNameMap: Map<string, string> = new Map(); // Map email to name

  constructor(private inventoryService: InventoryService) {
    // Set fromDate to 30 days ago by default
    this.fromDate = new Date();
    this.fromDate.setDate(this.fromDate.getDate() - 30);
  }

  // Tab management
  activeTab: string = 'delivery';

   // Data properties
   filteredDeliveries: Delivery[] = [];
   damagedDeliveries: Delivery[] = [];
   pendingDeliveries: Delivery[] = [];
   loading = false;

   ngOnInit(): void {
     this.loadData();
   }

   loadData(): void {
     this.loading = true;
     this.loadAgents();
     this.loadFilteredData();
   }

    loadAgents(): void {
      this.inventoryService.getDeliveryAgentOptions().subscribe({
        next: (agents) => {
          // Build map of email to display name
          agents.forEach(agent => {
            this.agentNameMap.set(agent.username, agent.displayName || agent.username);
          });
          // Get unique agent emails from deliveries
          this.inventoryService.getAllDeliveries().subscribe({
            next: (deliveries: Delivery[]) => {
              const agentSet = new Set(deliveries.map(d => d.deliveryAgent));
              this.availableAgents = Array.from(agentSet).sort();
            },
            error: (error) => {
              console.error('Error loading agents:', error);
            }
          });
        },
        error: (error) => {
          console.error('Error loading agent options:', error);
        }
      });
    }

   loadFilteredData(): void {
     if (this.activeTab === 'delivery') {
       this.loadDeliveredDeliveries();
     } else if (this.activeTab === 'damaged') {
       this.loadDamagedDeliveries();
     } else if (this.activeTab === 'pending') {
       this.loadPendingDeliveries();
     }
   }

   loadDeliveredDeliveries(): void {
     this.loading = true;
     
     // Load all deliveries and filter for delivered status
     this.inventoryService.getAllDeliveries().subscribe({
       next: (allDeliveries) => {
         // Filter for delivered status
         let deliveredDeliveries = allDeliveries.filter(d => d.status === DeliveryStatus.DELIVERED);
         
         // Filter by date range if we have delivered deliveries
         if (deliveredDeliveries.length > 0) {
           const startDate = new Date(this.fromDate);
           startDate.setHours(0, 0, 0, 0);
           
           const endDate = new Date(this.toDate);
           endDate.setHours(23, 59, 59, 999);
           
           deliveredDeliveries = deliveredDeliveries.filter(d => {
             if (!d.deliveredAt) return false;
             const deliveredDate = new Date(d.deliveredAt);
             return deliveredDate >= startDate && deliveredDate <= endDate;
           });
         }
         
         // Filter by selected agent if one is selected
         if (this.selectedAgent) {
           this.filteredDeliveries = deliveredDeliveries.filter(d => d.deliveryAgent === this.selectedAgent);
         } else {
           this.filteredDeliveries = deliveredDeliveries;
         }
         this.loading = false;
       },
       error: (error) => {
         console.error('Error loading delivered deliveries:', error);
         this.loading = false;
       }
     });
   }

   loadDamagedDeliveries(): void {
     this.loading = true;
     this.inventoryService.getDamagedDeliveries().subscribe({
       next: (deliveries) => {
         // Filter by selected agent if one is selected
         if (this.selectedAgent) {
           this.damagedDeliveries = deliveries.filter(d => d.deliveryAgent === this.selectedAgent);
         } else {
           this.damagedDeliveries = deliveries;
         }
         this.loading = false;
       },
       error: (error) => {
         console.error('Error loading damaged deliveries:', error);
         this.loading = false;
       }
     });
   }

   loadPendingDeliveries(): void {
     this.loading = true;
     // Load all deliveries and filter for pending statuses
     this.inventoryService.getAllDeliveries().subscribe({
       next: (deliveries) => {
         // Filter for pending statuses (PENDING, ASSIGNED, IN_TRANSIT)
         let pending = deliveries.filter(d => 
           d.status === DeliveryStatus.PENDING || 
           d.status === DeliveryStatus.IN_TRANSIT ||
           d.status === DeliveryStatus.ASSIGNED
         );
         
         // Further filter by selected agent if one is selected
         if (this.selectedAgent) {
           this.pendingDeliveries = pending.filter(d => d.deliveryAgent === this.selectedAgent);
         } else {
           this.pendingDeliveries = pending;
         }
         this.loading = false;
       },
       error: (error) => {
         console.error('Error loading pending deliveries:', error);
         this.loading = false;
       }
     });
   }



   onDateChange(): void {
     if (this.activeTab === 'delivery') {
       this.loadDeliveredDeliveries();
     }
   }

   onAgentChange(): void {
     // Reload data for all tabs when agent changes
     this.loadFilteredData();
   }

   setActiveTab(tab: string): void {
     this.activeTab = tab;
     this.loadFilteredData();
   }

  // Helper methods for table display
  getFirstProductName(delivery: Delivery): string {
    return delivery.items && delivery.items.length > 0 ? delivery.items[0].productName : 'N/A';
  }

  getFirstProductSku(delivery: Delivery): string {
    return delivery.items && delivery.items.length > 0 ? delivery.items[0].productSku : 'N/A';
  }

  getTotalItems(delivery: Delivery): number {
    return delivery.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  getDeliveredDate(delivery: Delivery): string {
    if (delivery.status === DeliveryStatus.DELIVERED && delivery.deliveredAt) {
      return new Date(delivery.deliveredAt).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return '—';
  }

  formatStatus(status: DeliveryStatus): string {
    switch (status) {
      case DeliveryStatus.PENDING: return 'PENDING';
      case DeliveryStatus.IN_TRANSIT: return 'IN TRANSIT';
      case DeliveryStatus.DELIVERED: return 'DELIVERED';
      case DeliveryStatus.DAMAGED_IN_TRANSIT: return 'DAMAGED';
      case DeliveryStatus.CANCELLED: return 'CANCELLED';
      case DeliveryStatus.RETURNED: return 'RETURNED';
      default: return (status as string).replace('_', ' ');
    }
  }

  getStatusClass(status: DeliveryStatus): string {
    switch (status) {
      case DeliveryStatus.PENDING: return 'pending';
      case DeliveryStatus.IN_TRANSIT: return 'in-transit';
      case DeliveryStatus.DELIVERED: return 'delivered';
      case DeliveryStatus.DAMAGED_IN_TRANSIT: return 'damaged';
      case DeliveryStatus.CANCELLED: return 'cancelled';
      case DeliveryStatus.RETURNED: return 'returned';
      default: return 'default';
    }
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getAgentName(agentEmail: string): string {
    return this.agentNameMap.get(agentEmail) || agentEmail;
  }

   // Export functions
   exportDeliveryReport(): void {
      const exportData = this.filteredDeliveries.map(d => ({
        'Delivery ID': d.id,
        'Product': this.getFirstProductName(d),
        'SKU': this.getFirstProductSku(d),
        'Agent': this.getAgentName(d.deliveryAgent),
        'Quantity': this.getTotalItems(d),
        'Status': this.formatStatus(d.status),
        'Scheduled Date': new Date(d.createdAt).toLocaleDateString(),
        'Delivered Date': this.getDeliveredDate(d)
      }));
      this.exportToXLSX(exportData, 'delivered-goods-report');
   }

   exportDamagedReport(): void {
      const exportData = this.damagedDeliveries.map(d => ({
        'Delivery ID': d.id,
        'Product': this.getFirstProductName(d),
        'SKU': this.getFirstProductSku(d),
        'Agent': this.getAgentName(d.deliveryAgent),
        'Quantity': this.getTotalItems(d),
        'Status': 'DAMAGED',
        'Scheduled Date': new Date(d.createdAt).toLocaleDateString(),
        'Delivered Date': '—'
      }));
     this.exportToXLSX(exportData, 'damaged-goods-report');
   }

   exportPendingReport(): void {
      const exportData = this.pendingDeliveries.map(d => ({
        'Delivery ID': d.id,
        'Product': this.getFirstProductName(d),
        'SKU': this.getFirstProductSku(d),
        'Agent': this.getAgentName(d.deliveryAgent),
        'Quantity': this.getTotalItems(d),
        'Status': this.formatStatus(d.status),
        'Scheduled Date': new Date(d.createdAt).toLocaleDateString(),
        'Delivered Date': '—'
      }));
     this.exportToXLSX(exportData, 'pending-deliveries-report');
   }

   private exportToXLSX(data: any[], filename: string): void {
     if (data.length === 0) return;

     const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
     const wb: XLSX.WorkBook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, 'Report');

     XLSX.writeFile(wb, `${filename}.xlsx`);
   }
}
