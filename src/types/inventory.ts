
export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  brand: string;
  sku: string;
  category: string;
  stock_level: number;
  stock_status: string;
  price: number;
  date_added: string;
  updated_at: string;
  image_url: string | null;
  description: string | null;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  brand: string;
  sku: string;
  price: number;
  stock_level: number;
  stock_status: string;
  category: string;
}

export interface SaleItem {
  product_name: string;
  price: number;
  quantity: number;
  subtotal?: number;
}
