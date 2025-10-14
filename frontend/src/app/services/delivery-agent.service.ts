import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DeliveryItem, DeliveryStatus, DeliveryPriority } from '../inventory/models/delivery.model';

export interface DeliveryAgentDto {
  id: number;
  deliveryId: string;
  status: DeliveryStatus;
  priority: DeliveryPriority;
  scheduledDate: string;
  assignedAt?: string;
  deliveredAt?: string;
  customerName?: string;
  customerAddress: string;
  customerPhone: string;
  items: DeliveryItem[];
  notes?: string;
  statusReason?: string;
  customerSignature?: string;
  isOverdue: boolean;
  totalItems: number;
  priorityDescription: string;
}

export interface DeliveryUpdateRequest {
  deliveryId: number;
  status: DeliveryStatus;
  customerName?: string;
  statusReason?: string;
  notes?: string;
  signatureBase64?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryAgentService {
  private readonly API_URL = `${environment.apiBaseUrl}/delivery-agent`;

  constructor(private http: HttpClient) { }

  getTodaysDeliveries(): Observable<DeliveryAgentDto[]> {
    return this.http.get<DeliveryAgentDto[]>(`${this.API_URL}/today`);
  }

  getPendingDeliveries(): Observable<DeliveryAgentDto[]> {
    return this.http.get<DeliveryAgentDto[]>(`${this.API_URL}/pending`);
  }

  updateDelivery(request: DeliveryUpdateRequest): Observable<DeliveryAgentDto> {
    return this.http.put<DeliveryAgentDto>(`${this.API_URL}/update`, request);
  }

  getDeliveryDetails(deliveryId: number): Observable<DeliveryAgentDto> {
    return this.http.get<DeliveryAgentDto>(`${this.API_URL}/delivery/${deliveryId}`);
  }

  getDeliveredDeliveries(): Observable<DeliveryAgentDto[]> {
    return this.http.get<DeliveryAgentDto[]>(`${this.API_URL}/delivered`);
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'EMERGENCY': return '#f44336';
      case 'PERISHABLE': return '#ff9800';
      case 'ESSENTIAL': return '#2196f3';
      case 'STANDARD': return '#4caf50';
      case 'LOW': return '#9e9e9e';
      default: return '#4caf50';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return '#ff9800';
      case 'ASSIGNED': return '#2196f3';
      case 'IN_TRANSIT': return '#9c27b0';
      case 'DELIVERED': return '#4caf50';
      case 'DOOR_LOCKED': return '#ff5722';
      case 'DAMAGED_IN_TRANSIT': return '#f44336';
      case 'RETURNED': return '#795548';
      case 'CANCELLED': return '#607d8b';
      default: return '#9e9e9e';
    }
  }
}
