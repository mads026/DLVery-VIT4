import { Injectable } from '@angular/core';
import { Delivery, DeliveryStatus } from '../models/delivery';

const LS_KEY = 'delivery_agent_mock_deliveries_v1';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private data: Delivery[] = [];

  constructor() {
    const existing = localStorage.getItem(LS_KEY);
    if (existing) {
      this.data = JSON.parse(existing);
    } else {
      this.data = this.seed();
      this.persist();
    }
  }

  private seed(): Delivery[] {
    const today = new Date();
    const iso = (d: Date) => d.toISOString();
    return [
      {
        id: 'DLV-1001',
        customerName: 'Ananya Sharma',
        address: '12, MG Road, Bengaluru',
        phone: '9xxxx xxxxx',
        expectedBy: iso(new Date(today.getTime() + 2 * 60 * 60 * 1000)),
        priority: 'EMERGENCY',
        status: 'ASSIGNED',
        items: [{ sku: 'MED-001', name: 'Emergency Medicine', qty: 1 }]
      },
      {
        id: 'DLV-1002',
        customerName: 'Rahul Verma',
        address: 'DLF Phase 3, Gurugram',
        phone: '9xxxx xxxxx',
        expectedBy: iso(new Date(today.getTime() + 5 * 60 * 60 * 1000)),
        priority: 'PERISHABLE',
        status: 'ASSIGNED',
        items: [
          { sku: 'GROC-23', name: 'Fresh Milk', qty: 2 },
          { sku: 'GROC-07', name: 'Leafy Greens', qty: 1 }
        ]
      },
      {
        id: 'DLV-0995',
        customerName: 'Priya Menon',
        address: 'Jubilee Hills, Hyderabad',
        phone: '9xxxx xxxxx',
        expectedBy: iso(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
        priority: 'ESSENTIAL',
        status: 'ASSIGNED',
        pastPending: true,
        items: [
          { sku: 'HYG-10', name: 'Baby Diapers', qty: 1 },
          { sku: 'HYG-12', name: 'Sanitizer', qty: 2 }
        ]
      }
    ];
  }

  private persist() {
    localStorage.setItem(LS_KEY, JSON.stringify(this.data));
  }

  list() {
    return this.data.slice().sort((a, b) => {
      const prio = this.priorityScore(b.priority) - this.priorityScore(a.priority);
      if (prio !== 0) return prio;
      return new Date(a.expectedBy).getTime() - new Date(b.expectedBy).getTime();
    });
  }

  getById(id: string) {
    return this.data.find(d => d.id === id) || null;
  }

  updateStatus(id: string, status: DeliveryStatus, notes?: string, signature?: string) {
    const d = this.getById(id);
    if (!d) return;
    d.status = status;
    d.notes = notes;
    if (status === 'DELIVERED') {
      d.deliveredAt = new Date().toISOString();
      d.customerSignatureDataUrl = signature;
    }
    this.persist();
  }

  private priorityScore(p: Delivery['priority']) {
    switch (p) {
      case 'EMERGENCY': return 100;
      case 'PERISHABLE': return 80;
      case 'ESSENTIAL': return 60;
      default: return 40;
    }
  }
}
