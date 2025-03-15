
import { supabase } from '@/integrations/supabase/client';
import { getStockStatusBasedOnLevel } from '../hooks/calculations/getStockStatus';

/**
 * Update inventory stock when a sale is completed or returned
 */
export async function updateInventoryStock(
  item: {
    product_name: string;
    quantity: number;
    price: number;
    cost_price: number;
    inventory_id?: string;
  },
  isSale: boolean
) {
  if (!item.inventory_id) return;
  
  try {
    // First, get current stock level
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('stock_level')
      .eq('id', item.inventory_id)
      .single();
      
    if (inventoryError) throw inventoryError;
    
    // If it's a sale, decrease stock. If it's a return, increase stock
    const newStockLevel = isSale 
      ? Math.max(0, (inventoryData?.stock_level || 0) - item.quantity)
      : (inventoryData?.stock_level || 0) + item.quantity;
    
    // Get the stock status based on the new stock level
    const newStockStatus = getStockStatusBasedOnLevel(newStockLevel);
      
    // Update stock level
    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        stock_level: newStockLevel,
        stock_status: newStockStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.inventory_id);
      
    if (updateError) throw updateError;
    
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    // Don't throw here to prevent blocking the sale process
  }
}
