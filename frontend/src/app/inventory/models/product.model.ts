export interface Product {
  id?: number;
  sku: string;
  name: string;
  description?: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
  isDamaged: boolean;
  isPerishable: boolean;
  expiryDate?: string;
}

export enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  FOOD_BEVERAGES = 'FOOD_BEVERAGES',
  HOME_GARDEN = 'HOME_GARDEN',
  BOOKS = 'BOOKS',
  TOYS_GAMES = 'TOYS_GAMES',
  HEALTH_BEAUTY = 'HEALTH_BEAUTY',
  SPORTS_OUTDOORS = 'SPORTS_OUTDOORS',
  AUTOMOTIVE = 'AUTOMOTIVE',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  PHARMACEUTICALS = 'PHARMACEUTICALS',
  FROZEN_GOODS = 'FROZEN_GOODS',
  FRESH_PRODUCE = 'FRESH_PRODUCE',
  OTHER = 'OTHER'
}

export interface InventoryMovement {
  id?: number;
  productSku: string;
  productName: string;
  movementType: MovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  movementDate: string;
  performedBy: string;
}

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED',
  DELIVERY = 'DELIVERY'
}