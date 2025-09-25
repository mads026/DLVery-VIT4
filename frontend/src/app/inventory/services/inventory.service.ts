import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, InventoryMovement, MovementType } from '../models/product.model';
import { Delivery, DeliveryStatus, DashboardStats } from '../models/delivery.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private buildHttpParams(params: { [key: string]: string | number | undefined }): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return httpParams;
  }

  // Product operations
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/inventory/products`);
  }

  getAvailableProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/inventory/products/available`);
  }

  getProductBySku(sku: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/inventory/products/${sku}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/inventory/products`, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/inventory/products/${id}`, product);
  }

  recordMovement(sku: string, type: MovementType, quantity: number, reason: string, reference?: string, performedBy?: string): Observable<string> {
    const params = this.buildHttpParams({
      type,
      quantity,
      reason,
      reference,
      performedBy: performedBy || 'System'
    });

    return this.http.post<string>(`${this.baseUrl}/inventory/products/${sku}/movement`, null, { params });
  }

  getMovementHistory(sku: string): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovement[]>(`${this.baseUrl}/inventory/products/${sku}/movements`);
  }

  uploadInventoryFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/inventory/upload`, formData, {
      responseType: 'text'
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/inventory/dashboard/stats`);
  }

   downloadTemplate(): Observable<Blob> {
     return this.http.get(`${this.baseUrl}/inventory/template`, { responseType: 'blob' });
   }

  deleteProduct(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/inventory/products/${id}`, { responseType: 'text' });
  }

  // Delivery operations
  getAllDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.baseUrl}/deliveries`);
  }

  createDelivery(delivery: Delivery): Observable<Delivery> {
    return this.http.post<Delivery>(`${this.baseUrl}/deliveries`, delivery);
  }

  getDeliveriesByAgent(agent: string): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.baseUrl}/deliveries/agent/${agent}`);
  }

  getPendingDeliveriesByAgent(agent: string): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.baseUrl}/deliveries/agent/${agent}/pending`);
  }

  getDeliveriesByProductSku(sku: string): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.baseUrl}/deliveries/product/${sku}`);
  }

   getDeliveriesByDateRange(startDate: Date, endDate: Date): Observable<Delivery[]> {
     const params = this.buildHttpParams({
       startDate: startDate.toISOString(),
       endDate: endDate.toISOString()
     });
     return this.http.get<Delivery[]>(`${this.baseUrl}/deliveries/date-range`, { params });
   }

   getDamagedDeliveries(): Observable<Delivery[]> {
     return this.http.get<Delivery[]>(`${this.baseUrl}/deliveries/damaged`);
   }

   getDeliveredDeliveriesByDateRange(startDate: Date, endDate: Date): Observable<Delivery[]> {
     const params = this.buildHttpParams({
       startDate: startDate.toISOString(),
       endDate: endDate.toISOString()
     });
     return this.http.get<Delivery[]>(`${this.baseUrl}/deliveries/delivered/date-range`, { params });
   }

  trackDeliveries(sku?: string, agent?: string): Observable<Delivery[]> {
    const params = this.buildHttpParams({ sku, agent });
    return this.http.get<Delivery[]>(`${this.baseUrl}/deliveries/track`, { params });
  }

  getAllSkus(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/inventory/skus`);
  }

  getAllDeliveryAgents(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/inventory/agents`);
  }

  updateDeliveryStatus(id: number, status: DeliveryStatus): Observable<Delivery> {
    const params = this.buildHttpParams({ status });
    return this.http.put<Delivery>(`${this.baseUrl}/deliveries/${id}/status`, null, { params });
  }
}
