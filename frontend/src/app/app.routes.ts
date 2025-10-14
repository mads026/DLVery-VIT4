import { Routes } from '@angular/router';
import { PreloadAllModules } from '@angular/router';
import { inventoryGuard } from './guards/inventory.guard';
import { deliveryGuard } from './guards/delivery.guard';
import { DeliveryProfileGuard } from './guards/delivery-profile.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'auth/callback', loadComponent: () => import('./components/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent) },
  { path: 'verify-email', loadComponent: () => import('./components/email-verification/email-verification.component').then(m => m.EmailVerificationComponent) },
  { path: 'verification-pending', loadComponent: () => import('./components/verification-pending/verification-pending.component').then(m => m.VerificationPendingComponent) },
  {
    path: 'inventory',
    loadChildren: () => import('./inventory/inventory.module').then(m => m.inventoryRoutes),
    canActivate: [inventoryGuard]
  },
  {
    path: 'delivery/profile-setup',
    loadComponent: () => import('./components/delivery-profile-setup/delivery-profile-setup.component').then(m => m.DeliveryProfileSetupComponent),
    canActivate: [deliveryGuard]
  },
  {
    path: 'delivery/dashboard',
    loadComponent: () => import('./components/delivery-dashboard/delivery-dashboard.component').then(m => m.DeliveryDashboardComponent),
    canActivate: [deliveryGuard, DeliveryProfileGuard]
  },
  { path: '**', redirectTo: '/login' }
];
