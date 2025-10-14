export interface Delivery {
  id?: number;
  deliveryId: string;
  deliveryAgent: string;
  status: DeliveryStatus;
  priority?: DeliveryPriority;
  createdAt: string;
  scheduledDate?: string;
  assignedAt?: string;
  deliveredAt?: string;
  customerName?: string;
  customerAddress: string;
  customerPhone: string;
  items: DeliveryItem[];
  notes?: string;
  statusReason?: string;
  customerSignature?: string;
  deliveryNotes?: string;
}

export interface DeliveryItem {
  id?: number;
  productSku: string;
  productName: string;
  quantity: number;
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  DOOR_LOCKED = 'DOOR_LOCKED',
  DAMAGED_IN_TRANSIT = 'DAMAGED_IN_TRANSIT',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED'
}

export enum DeliveryPriority {
  EMERGENCY = 'EMERGENCY',
  PERISHABLE = 'PERISHABLE',
  ESSENTIAL = 'ESSENTIAL',
  STANDARD = 'STANDARD',
  LOW = 'LOW'
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
