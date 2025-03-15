
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
  cost_price: number;
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
  cost_price: number;
  stock_level: number;
  stock_status: string;
  category: string;
}

export interface SaleItem {
  product_name: string;
  quantity: number;
  price: number;
  cost_price: number;
  subtotal?: number;
}

export interface CustomerWatchDetails {
  brand: string;
  model: string | null;
  serial: string | null;
}

export interface CustomerSuggestion {
  name: string;
  email: string | null;
  phone: string | null;
  watches?: CustomerWatchDetails[];
}
