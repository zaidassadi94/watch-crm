
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sale } from '@/pages/Sales';
import { SaleFormValues, SaleItemInternal } from '../saleFormSchema';
import { calculateSaleTotals, generateInvoiceNumber } from './useSaleCalculations';
import { useToast } from '@/components/ui/use-toast';

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
  
  let invoiceNumber = data.invoice_number;
  if (data.status === 'completed' && !invoiceNumber) {
    invoiceNumber = await generateInvoiceNumber(supabase);
  }

  // Update existing sale
  if (existingSale) {
    let originalItems: SaleItemWithInventory[] = [];
    
    if (existingSale.status !== 'completed' && data.status === 'completed') {
      try {
        const { data: itemsData } = await supabase
          .from('sale_items')
          .select('*')
          .eq('sale_id', existingSale.id);
          
        originalItems = itemsData || [];
      } catch (error) {
        console.error('Error fetching original sale items:', error);
      }
    }
    
    const { error } = await supabase
      .from('sales')
      .update({
        customer_name: data.customer_name,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone || null,
        total_amount: totalAmount,
        total_profit: totalProfit,
        status: data.status,
        payment_method: data.payment_method || null,
        notes: data.notes || null,
        invoice_number: invoiceNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSale.id);

    if (error) throw error;

    // Delete existing items
    const { error: deleteError } = await supabase
      .from('sale_items')
      .delete()
      .eq('sale_id', existingSale.id);

    if (deleteError) throw deleteError;

    // Insert new items
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(
        data.items.map(item => ({
          sale_id: existingSale.id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          cost_price: item.cost_price || 0,
          subtotal: item.quantity * item.price,
          inventory_id: item.inventory_id
        }))
      );

    if (itemsError) throw itemsError;
    
    // Update inventory if status changed to completed
    if (existingSale.status !== 'completed' && data.status === 'completed') {
      for (const item of data.items) {
        if (item.inventory_id && item.product_name) {
          await updateInventoryStock({
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            cost_price: item.cost_price || 0,
            inventory_id: item.inventory_id
          }, true);
        }
      }
    }
    
    return existingSale.id;
  } else {
    // Create new sale
    const { data: newSale, error } = await supabase
      .from('sales')
      .insert({
        user_id: userId,
        customer_name: data.customer_name,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone || null,
        total_amount: totalAmount,
        total_profit: totalProfit,
        status: data.status,
        payment_method: data.payment_method || null,
        notes: data.notes || null,
        invoice_number: invoiceNumber,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert new items
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(
        data.items.map(item => ({
          sale_id: newSale.id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          cost_price: item.cost_price || 0,
          subtotal: item.quantity * item.price,
          inventory_id: item.inventory_id
        }))
      );

    if (itemsError) throw itemsError;
    
    // Update inventory if new sale is completed
    if (data.status === 'completed') {
      for (const item of data.items) {
        if (item.inventory_id && item.product_name) {
          await updateInventoryStock({
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            cost_price: item.cost_price || 0,
            inventory_id: item.inventory_id
          }, true);
        }
      }
    }
    
    return newSale.id;
  }
}

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
      
    // Update stock level
    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        stock_level: newStockLevel,
        stock_status: newStockLevel <= 0 ? 'Out of Stock' : 
                      newStockLevel <= 5 ? 'Low Stock' : 'In Stock',
        updated_at: new Date().toISOString()
      })
      .eq('id', item.inventory_id);
      
    if (updateError) throw updateError;
    
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    // Don't throw here to prevent blocking the sale process
  }
}
