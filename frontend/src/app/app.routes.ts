import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'auth/callback', loadComponent: () => import('./components/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent) },
  { path: 'verify-email', loadComponent: () => import('./components/email-verification/email-verification.component').then(m => m.EmailVerificationComponent) },
  { 
    path: 'inventory/dashboard', 
    loadComponent: () => import('./components/inventory-dashboard/inventory-dashboard.component').then(m => m.InventoryDashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'delivery/dashboard', 
    loadComponent: () => import('./components/delivery-dashboard/delivery-dashboard.component').then(m => m.DeliveryDashboardComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];