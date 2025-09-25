export interface Delivery {
  id?: number;
  deliveryId: string;
  deliveryAgent: string;
  status: DeliveryStatus;
  createdAt: string;
  deliveredAt?: string;
  customerAddress: string;
  customerPhone: string;
  items: DeliveryItem[];
  notes?: string;
}

export interface DeliveryItem {
  id?: number;
  productSku: string;
  productName: string;
  quantity: number;
  isDamaged: boolean;
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  DAMAGED_IN_TRANSIT = 'DAMAGED_IN_TRANSIT',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export interface DashboardStats {
  totalProducts: number;
  availableProducts: number;
  damagedProducts: number;
  expiringProducts: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  productsByCategory: { [key: string]: number };
  deliveriesByAgent: { [key: string]: number };
  movementsByType: { [key: string]: number };
}