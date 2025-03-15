
import { supabase } from '@/integrations/supabase/client';
import { getStockStatusBasedOnLevel } from '../hooks/calculations';
import { useToast } from '@/components/ui/use-toast';

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
  if (!item.inventory_id) {
    console.log("Skipping inventory update - no inventory_id provided", item);
    return;
  }
  
  try {
    console.log(`Updating inventory for item ${item.product_name}:`, { 
      inventory_id: item.inventory_id,
      quantity: item.quantity,
      isSale 
    });
    
    // First, get current stock level
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('stock_level, stock_status')
      .eq('id', item.inventory_id)
      .single();
      
    if (inventoryError) {
      console.error("Error getting current inventory:", inventoryError);
      throw inventoryError;
    }
    
    console.log("Current inventory data:", inventoryData);
    
    // If it's a sale, decrease stock. If it's a return, increase stock
    const newStockLevel = isSale 
      ? Math.max(0, (inventoryData?.stock_level || 0) - item.quantity)
      : (inventoryData?.stock_level || 0) + item.quantity;
    
    // Get the stock status based on the new stock level
    const newStockStatus = getStockStatusBasedOnLevel(newStockLevel);
    
    console.log("Updating stock:", {
      oldLevel: inventoryData?.stock_level,
      newLevel: newStockLevel,
      newStatus: newStockStatus
    });
      
    // Update stock level
    const { data: updateData, error: updateError } = await supabase
      .from('inventory')
      .update({
        stock_level: newStockLevel,
        stock_status: newStockStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.inventory_id)
      .select();
      
    if (updateError) {
      console.error("Error updating inventory:", updateError);
      throw updateError;
    }
    
    console.log("Inventory update successful:", updateData);
    
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    // Don't throw here to prevent blocking the sale process
  }
}
