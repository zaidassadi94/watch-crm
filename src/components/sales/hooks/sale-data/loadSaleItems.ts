
import { supabase } from '@/integrations/supabase/client';

export interface SaleItemWithInventory {
  id: string;
  sale_id: string;
  product_name: string;
  quantity: number;
  price: number;
  cost_price: number | null;
  subtotal: number;
  created_at: string;
  inventory_id?: string;
}

/**
 * Loads sale items for a given sale
 */
export async function loadSaleItems(saleId: string) {
  try {
    const { data, error } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId);

    if (error) throw error;
    return data as SaleItemWithInventory[];
  } catch (error) {
    console.error('Error loading sale items:', error);
    throw error;
  }
}
