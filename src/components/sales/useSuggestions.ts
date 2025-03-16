
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductSuggestion, CustomerSuggestion } from '@/types/inventory';
import { useInventoryData } from '@/hooks/useInventoryData';

export function useSuggestions(userId: string | undefined) {
  const [productSuggestions, setProductSuggestions] = useState<ProductSuggestion[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState<number | null>(null);
  const [productSearchTerms, setProductSearchTerms] = useState<string[]>(['']);
  
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  const { inventory } = useInventoryData();
  
  // Load inventory for product suggestions
  useEffect(() => {
    if (inventory.length > 0) {
      // Format inventory as product suggestions
      const suggestions: ProductSuggestion[] = inventory.map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        sku: item.sku,
        price: Number(item.price),
        cost_price: Number(item.cost_price),
        stock_level: item.stock_level,
        stock_status: item.stock_status,
        category: item.category
      }));
      
      // Start with all inventory items as suggestions
      setProductSuggestions(suggestions);
    }
  }, [inventory]);

  // Update product search terms
  const updateProductSearchTerms = useCallback((terms: string[]) => {
    setProductSearchTerms(terms);
  }, []);

  // Handle product search
  const handleProductSearch = useCallback((value: string, index: number) => {
    // Update search term
    const newTerms = [...productSearchTerms];
    newTerms[index] = value;
    setProductSearchTerms(newTerms);
    
    // Filter product suggestions based on search term
    if (value.trim() === '') {
      // If search term is empty, show all products
      const suggestions: ProductSuggestion[] = inventory.map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        sku: item.sku,
        price: Number(item.price),
        cost_price: Number(item.cost_price),
        stock_level: item.stock_level,
        stock_status: item.stock_status,
        category: item.category
      }));
      
      setProductSuggestions(suggestions);
    } else {
      // Filter inventory based on search term
      const searchLower = value.toLowerCase();
      const filtered = inventory.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        item.brand.toLowerCase().includes(searchLower) || 
        item.sku.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
      
      // If it's shown from a SKU field (index >= 100), prioritize SKU matches
      if (index >= 100) {
        filtered.sort((a, b) => {
          const aStartsWithSku = a.sku.toLowerCase().startsWith(searchLower);
          const bStartsWithSku = b.sku.toLowerCase().startsWith(searchLower);
          
          if (aStartsWithSku && !bStartsWithSku) return -1;
          if (!aStartsWithSku && bStartsWithSku) return 1;
          return 0;
        });
      }
      
      // Format filtered inventory as product suggestions
      const suggestions: ProductSuggestion[] = filtered.map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        sku: item.sku,
        price: Number(item.price),
        cost_price: Number(item.cost_price),
        stock_level: item.stock_level,
        stock_status: item.stock_status,
        category: item.category
      }));
      
      setProductSuggestions(suggestions);
    }
  }, [inventory, productSearchTerms]);

  // Handle customer search - now prioritize phone number search
  useEffect(() => {
    if (!userId || !showCustomerSuggestions) return;
    
    const fetchCustomers = async () => {
      const query = supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId);
        
      if (customerSearchTerm) {
        query.or(`phone.ilike.%${customerSearchTerm}%,name.ilike.%${customerSearchTerm}%,email.ilike.%${customerSearchTerm}%`);
      }
      
      query.limit(10);
      
      const { data, error } = await query;
      
      if (error) console.error('Error fetching customers:', error);
      else {
        setCustomerSuggestions(data.map(customer => ({
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        })));
      }
    };
    
    fetchCustomers();
  }, [userId, customerSearchTerm, showCustomerSuggestions]);

  return {
    productSuggestions,
    showProductSuggestions,
    setShowProductSuggestions,
    productSearchTerms,
    updateProductSearchTerms,
    handleProductSearch,
    customerSuggestions,
    showCustomerSuggestions,
    setShowCustomerSuggestions,
    customerSearchTerm,
    setCustomerSearchTerm
  };
}
