import { Routes } from '@angular/router';
import { inventoryGuard } from './guards/inventory.guard';
import { deliveryGuard } from './guards/delivery.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'auth/callback', loadComponent: () => import('./components/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent) },
  { path: 'verify-email', loadComponent: () => import('./components/email-verification/email-verification.component').then(m => m.EmailVerificationComponent) },
  {
    path: 'inventory',
    loadChildren: () => import('./inventory/inventory.module').then(m => m.inventoryRoutes),
    canActivate: [inventoryGuard]
  },
  {
    path: 'delivery/dashboard',
    loadComponent: () => import('./components/delivery-dashboard/delivery-dashboard.component').then(m => m.DeliveryDashboardComponent),
    canActivate: [deliveryGuard]
  },
  { path: '**', redirectTo: '/login' }
];
