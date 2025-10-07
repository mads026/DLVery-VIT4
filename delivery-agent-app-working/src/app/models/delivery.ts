export type DeliveryPriority = 'EMERGENCY' | 'PERISHABLE' | 'ESSENTIAL' | 'NORMAL';
export type DeliveryStatus = 'ASSIGNED' | 'DELIVERED' | 'DOOR_LOCK' | 'DAMAGED' | 'RETURNED';

export interface Delivery {
  id: string;
  customerName: string;
  address: string;
  phone?: string;
  expectedBy: string;
  priority: DeliveryPriority;
  status: DeliveryStatus;
  pastPending?: boolean;
  items: Array<{ sku: string; name: string; qty: number }>;
  customerSignatureDataUrl?: string;
  deliveredAt?: string;
  notes?: string;
}
