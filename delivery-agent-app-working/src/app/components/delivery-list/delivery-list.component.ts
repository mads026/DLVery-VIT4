import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DeliveryService } from '../../services/delivery.service';
import { Delivery } from '../../models/delivery';

@Component({
  standalone: true,
  selector: 'app-delivery-list',
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./delivery-list.component.css'],
  templateUrl: './delivery-list.component.html'
})
export class DeliveryListComponent {
  constructor(private deliveryService: DeliveryService) {}
  query = signal('');
  deliveries = signal<Delivery[]>(this.deliveryService.list());
  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.deliveries();
    return this.deliveries().filter(d =>
      d.id.toLowerCase().includes(q) ||
      d.customerName.toLowerCase().includes(q) ||
      d.address.toLowerCase().includes(q)
    );
  });
  priorityChipColor(p: Delivery['priority']) {
    return {EMERGENCY:'bg-red-600 text-white',PERISHABLE:'bg-orange-500 text-white',ESSENTIAL:'bg-emerald-600 text-white',NORMAL:'bg-gray-600 text-white'}[p];
  }
  statusColor(s: Delivery['status']) {
    return {ASSIGNED:'text-yellow-700',DELIVERED:'text-green-700',DOOR_LOCK:'text-gray-600',DAMAGED:'text-red-700',RETURNED:'text-purple-700'}[s];
  }
  refresh() {
  this.deliveries.set(this.deliveryService.list());
}
}
