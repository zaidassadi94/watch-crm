
import { SaleFormValues } from '../saleFormSchema';
import { updateInventoryStock } from './updateInventoryStock';
import { SaleItemWithInventory } from './loadSaleItems';

/**
 * Update inventory for items in a completed sale
 */
export async function updateInventoryForCompletedSale(items: SaleFormValues['items']) {
  console.log("Updating inventory for completed sale");
  
  for (const item of items) {
    if (item.inventory_id && item.product_name) {
      console.log("Updating inventory for item:", item);
      await updateInventoryStock({
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        cost_price: item.cost_price || 0,
        inventory_id: item.inventory_id
      }, true); // true for sale (decreases stock)
    } else {
      console.log("Skipping inventory update for item without inventory_id:", item);
    }
  }
}

/**
 * Restore inventory for items in a completed sale (treats them like returns)
 */
export async function restoreInventoryForItems(items: SaleItemWithInventory[]) {
  console.log("Restoring inventory for original items");
  
  for (const item of items) {
    if (item.inventory_id) {
      console.log("Restoring inventory for original item:", item);
      await updateInventoryStock({
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        cost_price: item.cost_price || 0,
        inventory_id: item.inventory_id
      }, false); // false = return (increases stock)
    }
  }
}
