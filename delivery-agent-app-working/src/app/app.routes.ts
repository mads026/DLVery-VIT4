import { Routes } from '@angular/router';
import { DeliveryListComponent } from './components/delivery-list/delivery-list.component';
import { DeliveryDetailComponent } from './components/delivery-detail/delivery-detail.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'deliveries' },
  { path: 'deliveries', component: DeliveryListComponent, title: 'Today & Pending Deliveries' },
  { path: 'deliveries/:id', component: DeliveryDetailComponent, title: 'Delivery Detail' },
  { path: '**', redirectTo: 'deliveries' }
];
