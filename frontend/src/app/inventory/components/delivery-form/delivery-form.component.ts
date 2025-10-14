import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { InventoryService, DeliveryAgentOption } from '../../services/inventory.service';
import { Product } from '../../models/product.model';
import { Delivery, DeliveryItem } from '../../models/delivery.model';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-delivery-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  templateUrl: './delivery-form.component.html',
  styleUrls: ['./delivery-form.component.css']
})
export class DeliveryFormComponent implements OnInit {
  deliveryForm: FormGroup;
  availableProducts: Product[] = [];
  deliveryAgents: DeliveryAgentOption[] = [];
  filteredAgents!: Observable<DeliveryAgentOption[]>;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DeliveryFormComponent>
  ) {
    this.deliveryForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadAvailableProducts();
    this.loadDeliveryAgents();
    this.setupAgentFilter();
  }

  setupAgentFilter(): void {
    this.filteredAgents = this.deliveryForm.get('deliveryAgent')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = (value || '').toLowerCase();
        return this.deliveryAgents.filter(agent =>
          agent.displayName.toLowerCase().includes(filterValue) ||
          agent.username.toLowerCase().includes(filterValue)
        );
      })
    );
  }

  createForm(): FormGroup {
    const today = new Date().toISOString().split('T')[0];
    return this.fb.group({
      deliveryAgent: ['', [Validators.required]],
      priority: ['STANDARD', [Validators.required]],
      customerName: ['', [Validators.required]],
      customerAddress: ['', [Validators.required]],
      customerPhone: ['', [Validators.required]],
      scheduledDate: [today, [Validators.required]],
      notes: [''],
      items: this.fb.array([this.createItemForm()])
    });
  }

  createItemForm(): FormGroup {
    return this.fb.group({
      productSku: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  get items(): FormArray {
    return this.deliveryForm.get('items') as FormArray;
  }

  loadAvailableProducts(): void {
    this.inventoryService.getAvailableProducts().subscribe({
      next: (products) => {
        this.availableProducts = products.filter(p => p.quantity > 0);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
      }
    });
  }

  loadDeliveryAgents(): void {
    this.inventoryService.getDeliveryAgentOptions().subscribe({
      next: (agents) => {
        // Show all agents, not just available ones
        this.deliveryAgents = agents;
        this.setupAgentFilter();
      },
      error: (error) => {
        console.error('Error loading delivery agents:', error);
        this.snackBar.open('Error loading delivery agents', 'Close', { duration: 3000 });
      }
    });
  }

  displayAgentFn(username: string): string {
    if (!username) return '';
    const agent = this.deliveryAgents.find(a => a.username === username);
    return agent ? agent.displayName : username;
  }

  addItem(): void {
    this.items.push(this.createItemForm());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  getProductName = (sku: string): string =>
    this.availableProducts.find(p => p.sku === sku)?.name || '';

  getMaxQuantity = (sku: string): number =>
    this.availableProducts.find(p => p.sku === sku)?.quantity || 0;

  onProductChange(index: number): void {
    const item = this.items.at(index);
    const sku = item.get('productSku')?.value;
    const maxQuantity = this.getMaxQuantity(sku);

    // Update quantity validator
    const quantityControl = item.get('quantity');
    quantityControl?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(maxQuantity)
    ]);
    quantityControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.deliveryForm.valid) {
      this.loading = true;
      const formValue = this.deliveryForm.value;

      const delivery: Delivery = {
        ...formValue,
        items: formValue.items.map((item: any) => ({
          ...item,
          productName: this.getProductName(item.productSku)
        })),
        deliveryId: '',
        status: 'PENDING' as any,
        createdAt: new Date().toISOString()
      };

      this.inventoryService.createDelivery(delivery).subscribe({
        next: (createdDelivery) => {
          this.snackBar.open('Delivery created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating delivery:', error);
          this.snackBar.open('Error creating delivery', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
