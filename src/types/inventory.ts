
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
  inventory_id?: string;
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

// Add the user settings interface
export interface UserSettings {
  id?: string;
  user_id: string;
  company_name: string;
  currency: string;
  language: string;
  date_format: string;
  enable_notifications: boolean;
  enable_dark_mode: boolean;
  gst_number?: string;
  gst_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ReturnItem {
  product_name: string;
  quantity: number;
  price: number;
  cost_price?: number;
  subtotal?: number;
  inventory_id?: string;
}

export interface Return {
  id: string;
  sale_id: string;
  user_id: string;
  return_date: string;
  reason?: string;
  total_amount: number;
  status: string;
  items?: ReturnItem[];
  sale?: {
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    invoice_number?: string;
  };
}
