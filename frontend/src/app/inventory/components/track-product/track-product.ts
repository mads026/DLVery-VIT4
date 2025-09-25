import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, startWith, map } from 'rxjs';
import { InventoryService } from '../../services/inventory.service';
import { Delivery, DeliveryStatus } from '../../models/delivery.model';

@Component({
  selector: 'app-track-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  templateUrl: './track-product.html',
  styleUrl: './track-product.scss'
})
export class TrackProductComponent implements OnInit {
  private readonly STATUS_CLASSES: { [key: string]: string } = {
    [DeliveryStatus.DELIVERED]: 'status-delivered',
    [DeliveryStatus.IN_TRANSIT]: 'status-in-transit',
    [DeliveryStatus.PENDING]: 'status-pending',
    [DeliveryStatus.CANCELLED]: 'status-cancelled',
    [DeliveryStatus.RETURNED]: 'status-returned',
    [DeliveryStatus.DAMAGED_IN_TRANSIT]: 'status-damaged'
  };

  trackForm: FormGroup;
  deliveries: Delivery[] = [];
  loading = false;
  displayedColumns: string[] = ['deliveryId', 'agent', 'status', 'createdAt', 'items'];

  allSkus: string[] = [];
  allAgents: string[] = [];
  filteredSkus!: Observable<string[]>;
  filteredAgents!: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService
  ) {
    this.trackForm = this.fb.group({
      sku: [''],
      agent: ['']
    });
  }

  ngOnInit(): void {
    this.loadSuggestions();

    this.filteredSkus = this.trackForm.get('sku')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.allSkus))
    );

    this.filteredAgents = this.trackForm.get('agent')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.allAgents))
    );
  }

  private loadSuggestions(): void {
    this.inventoryService.getAllSkus().subscribe(skus => {
      this.allSkus = skus;
    });

    this.inventoryService.getAllDeliveryAgents().subscribe(agents => {
      this.allAgents = agents;
    });
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  onTrack(): void {
    const { sku, agent } = this.trackForm.value;
    if (!sku && !agent) {
      return;
    }

    this.loading = true;
    this.inventoryService.trackDeliveries(sku || undefined, agent || undefined)
      .subscribe({
        next: (deliveries) => {
          this.deliveries = deliveries;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error tracking deliveries:', error);
          this.loading = false;
        }
      });
  }

  getStatusClass(status: DeliveryStatus): string {
    return this.STATUS_CLASSES[status] || 'status-default';
  }

  getItemSummary(items: any[]): string {
    if (!items || items.length === 0) return 'No items';
    return items.map(item => `${item.productName} (${item.quantity})`).join(', ');
  }
}
