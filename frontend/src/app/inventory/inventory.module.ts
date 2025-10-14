import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/inventory-dashboard/inventory-dashboard.component').then(m => m.InventoryDashboardComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./components/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'track',
    loadComponent: () => import('./components/track-product/track-product').then(m => m.TrackProductComponent)
  },
  {
    path: 'deliveries',
    loadComponent: () => import('./components/delivery-list/delivery-list.component').then(m => m.DeliveryListComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
  }
];
