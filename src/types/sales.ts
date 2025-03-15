
export interface Sale {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  total_amount: number;
  total_profit: number;
  status: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  invoice_number: string | null;
}
