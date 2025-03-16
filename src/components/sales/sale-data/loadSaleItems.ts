
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
  sku?: string;
}

/**
 * Load items for a specific sale
 */
export async function loadSaleItems(saleId: string): Promise<SaleItemWithInventory[]> {
  try {
    console.log(`Loading sale items for sale ID: ${saleId}`);
    
    const { data, error } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId);
      
    if (error) {
      console.error('Error loading sale items:', error);
      throw error;
    }
    
    console.log(`Loaded ${data?.length || 0} sale items`);
    return data as SaleItemWithInventory[] || [];
  } catch (error) {
    console.error('Error in loadSaleItems:', error);
    throw error;
  }
}
