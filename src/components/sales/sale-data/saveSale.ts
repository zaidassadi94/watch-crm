
import { supabase } from '@/integrations/supabase/client';
import { Sale } from '@/types/sales';
import { SaleFormValues } from '../saleFormSchema';
import { SaleItemInternal } from '../saleFormSchema';
import { calculateSaleTotals, generateInvoiceNumber } from '../hooks/calculations';
import { 
  createSale, 
  updateSale, 
  deleteSaleItems, 
  addSaleItems,
  getOriginalSaleItems 
} from './saleOperations';
import { 
  updateInventoryForCompletedSale, 
  restoreInventoryForItems 
} from './inventoryHandler';

/**
 * Save or update a sale in the database
 */
export async function saveSale(
  data: SaleFormValues, 
  userId: string, 
  existingSale: Sale | null = null
) {
  if (!userId) {
    throw new Error('User ID is required to save a sale');
  }
  
  console.log("Saving sale:", { 
    isUpdate: !!existingSale,
    userId,
    itemsCount: data.items.length,
    status: data.status
  });
  
  // Calculate sale totals
  const saleItems: SaleItemInternal[] = data.items.map(item => ({
    product_name: item.product_name,
    quantity: item.quantity,
    price: item.price,
    cost_price: item.cost_price || 0,
    inventory_id: item.inventory_id
  }));
  
  const calculation = calculateSaleTotals(saleItems);
  const totalAmount = calculation.totalPrice;
  const totalProfit = calculation.totalProfit;
  
  // Generate invoice number if needed
  let invoiceNumber = data.invoice_number;
  if (data.status === 'completed' && !invoiceNumber) {
    invoiceNumber = await generateInvoiceNumber(supabase);
  }

  // Handle existing sale
  if (existingSale) {
    // Load original status before updating
    const originalStatus = existingSale.status;
    const originalItems = await getOriginalSaleItems(existingSale.id);
    
    // Update the sale record
    await updateSale(data, existingSale, totalAmount, totalProfit, invoiceNumber);
    
    // Update sale items
    await deleteSaleItems(existingSale.id);
    await addSaleItems(existingSale.id, data.items);
    
    // Handle inventory updates based on sale status changes
    
    // If original status was 'completed', restore inventory first
    if (originalStatus === 'completed') {
      await restoreInventoryForItems(originalItems);
    }
    
    // If new status is 'completed', update inventory with new quantities
    if (data.status === 'completed') {
      await updateInventoryForCompletedSale(data.items);
    }
    
    return existingSale.id;
  } 
  // Handle new sale
  else {
    // Create new sale record
    const newSale = await createSale(data, userId, totalAmount, totalProfit, invoiceNumber);
    
    // Add sale items
    await addSaleItems(newSale.id, data.items);
    
    // Update inventory if new sale is completed
    if (data.status === 'completed') {
      await updateInventoryForCompletedSale(data.items);
    }
    
    return newSale.id;
  }
}
