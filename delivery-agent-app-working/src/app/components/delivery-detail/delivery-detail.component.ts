import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DeliveryService } from '../../services/delivery.service';
import { Delivery } from '../../models/delivery';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';

@Component({
  standalone: true,
  selector: 'app-delivery-detail',
  imports: [CommonModule, RouterLink, SignaturePadComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./delivery-detail.component.css'],
  templateUrl: './delivery-detail.component.html'
})
export class DeliveryDetailComponent {
  delivery?: Delivery | null;
  notes = '';
  customerName = '';
  @ViewChild(SignaturePadComponent) sig?: SignaturePadComponent;
  constructor(private route: ActivatedRoute, private router: Router, private deliveryService: DeliveryService) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.delivery = this.deliveryService.getById(id);
  }
  markDelivered() {
    if (!this.delivery) return;
    const signature = this.sig?.toDataUrl() || undefined;
    if (!this.customerName.trim() || !signature) { alert('Name and signature required.'); return; }
    this.deliveryService.updateStatus(this.delivery.id, 'DELIVERED', this.notes, signature);
    this.router.navigate(['/deliveries']);
  }
  markDoorLock(){ if(!this.delivery) return; this.deliveryService.updateStatus(this.delivery.id,'DOOR_LOCK',this.notes); this.router.navigate(['/deliveries']); }
  markDamaged(){ if(!this.delivery) return; this.deliveryService.updateStatus(this.delivery.id,'DAMAGED',this.notes); this.router.navigate(['/deliveries']); }
  markReturned(){ if(!this.delivery) return; this.deliveryService.updateStatus(this.delivery.id,'RETURNED',this.notes); this.router.navigate(['/deliveries']); }
}
