
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { loadSaleItems, updateInventoryStock, saveSale, SaleItemWithInventory } from './sale-data';

// Export all the data access functions and types
export { loadSaleItems, updateInventoryStock, saveSale, type SaleItemWithInventory };
