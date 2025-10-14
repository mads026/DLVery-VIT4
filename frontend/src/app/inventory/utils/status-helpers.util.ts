import { Product } from '../models/product.model';
import { DeliveryStatus } from '../models/delivery.model';

/**
 * Product status information
 */
export interface ProductStatusInfo {
  status: string;
  class: string;
  text: string;
}

/**
 * Delivery status configuration
 */
export interface StatusConfig {
  color: string;
  formatted: string;
  class: string;
  icon: string;
}

/**
 * Centralized status helper utilities
 */
export class StatusHelpers {
  /**
   * Determines if a product is expiring soon (within 7 days)
   */
  static isExpiringSoon(product: Product): boolean {
    if (!product.isPerishable || !product.expiryDate) return false;

    const expiryDate = new Date(product.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  }

  /**
   * Gets comprehensive product status information
   */
  static getProductStatus(product: Product): ProductStatusInfo {
    if (product.quantity === 0) {
      return { status: 'Out of Stock', class: 'damaged', text: 'OUT OF STOCK' };
    }
    if (product.isDamaged) {
      return { status: 'Damaged', class: 'damaged', text: 'DAMAGED' };
    }
    if (this.isExpiringSoon(product)) {
      return { status: 'Expiring Soon', class: 'expiring', text: 'EXPIRING SOON' };
    }
    if (product.quantity < 10) {
      return { status: 'Low Stock', class: 'low-stock', text: 'LOW STOCK' };
    }
    return { status: 'Good', class: 'good', text: 'IN STOCK' };
  }

  /**
   * Delivery status configuration map
   */
  static readonly DELIVERY_STATUS_CONFIG: { [key: string]: StatusConfig } = {
    [DeliveryStatus.PENDING]: {
      color: 'bg-yellow-100 text-yellow-800',
      formatted: 'PENDING',
      class: 'pending',
      icon: 'schedule'
    },
    [DeliveryStatus.ASSIGNED]: {
      color: 'bg-blue-100 text-blue-800',
      formatted: 'ASSIGNED',
      class: 'assigned',
      icon: 'assignment'
    },
    [DeliveryStatus.IN_TRANSIT]: {
      color: 'bg-purple-100 text-purple-800',
      formatted: 'IN TRANSIT',
      class: 'in-transit',
      icon: 'local_shipping'
    },
    [DeliveryStatus.DELIVERED]: {
      color: 'bg-green-100 text-green-800',
      formatted: 'DELIVERED',
      class: 'delivered',
      icon: 'check_circle'
    },
    [DeliveryStatus.DOOR_LOCKED]: {
      color: 'bg-orange-100 text-orange-800',
      formatted: 'DOOR LOCKED',
      class: 'door-locked',
      icon: 'lock'
    },
    [DeliveryStatus.DAMAGED_IN_TRANSIT]: {
      color: 'bg-red-100 text-red-800',
      formatted: 'DAMAGED',
      class: 'damaged',
      icon: 'warning'
    },
    [DeliveryStatus.RETURNED]: {
      color: 'bg-amber-100 text-amber-800',
      formatted: 'RETURNED',
      class: 'returned',
      icon: 'keyboard_return'
    },
    [DeliveryStatus.CANCELLED]: {
      color: 'bg-gray-100 text-gray-800',
      formatted: 'CANCELLED',
      class: 'cancelled',
      icon: 'cancel'
    }
  };

  /**
   * Gets available status transitions for a delivery
   */
  static getAvailableDeliveryStatuses(currentStatus: DeliveryStatus): DeliveryStatus[] {
    switch (currentStatus) {
      case DeliveryStatus.PENDING:
        return [DeliveryStatus.IN_TRANSIT, DeliveryStatus.CANCELLED];
      case DeliveryStatus.IN_TRANSIT:
        return [DeliveryStatus.DELIVERED, DeliveryStatus.DAMAGED_IN_TRANSIT, DeliveryStatus.DOOR_LOCKED, DeliveryStatus.RETURNED];
      case DeliveryStatus.DELIVERED:
      case DeliveryStatus.DAMAGED_IN_TRANSIT:
      case DeliveryStatus.DOOR_LOCKED:
      case DeliveryStatus.RETURNED:
      case DeliveryStatus.CANCELLED:
        return []; // Final statuses
      default:
        return [];
    }
  }

  /**
   * Formats delivery status for display
   */
  static formatDeliveryStatus(status: DeliveryStatus): string {
    return this.DELIVERY_STATUS_CONFIG[status]?.formatted || (status as string).replace('_', ' ');
  }

  /**
   * Gets status CSS class
   */
  static getDeliveryStatusClass(status: DeliveryStatus): string {
    return this.DELIVERY_STATUS_CONFIG[status]?.class || 'default';
  }

  /**
   * Gets status icon
   */
  static getDeliveryStatusIcon(status: DeliveryStatus): string {
    return this.DELIVERY_STATUS_CONFIG[status]?.icon || 'help';
  }
}
