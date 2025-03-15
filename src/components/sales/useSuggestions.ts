
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductSuggestion, CustomerSuggestion } from '@/types/inventory';

export function useSuggestions(userId: string | undefined) {
  const [productSuggestions, setProductSuggestions] = useState<ProductSuggestion[]>([]);
  const [productSearchTerms, setProductSearchTerms] = useState<string[]>(['']);
  const [showProductSuggestions, setShowProductSuggestions] = useState<number | null>(null);
  
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  
  const updateProductSearchTerms = useCallback((terms: string[]) => {
    setProductSearchTerms(terms);
  }, []);

  const handleProductSearch = useCallback(async (term: string, index: number) => {
    const newSearchTerms = [...productSearchTerms];
    newSearchTerms[index] = term;
    setProductSearchTerms(newSearchTerms);
    
    if (!userId || term.length < 2) {
      setProductSuggestions([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('id, name, brand, sku, price, cost_price, stock_level, stock_status, category')
        .eq('user_id', userId)
        .or(`name.ilike.%${term}%,sku.ilike.%${term}%,brand.ilike.%${term}%`)
        .order('name')
        .limit(10);
        
      if (error) throw error;
      
      setProductSuggestions(data as ProductSuggestion[]);
    } catch (error) {
      console.error('Error searching products:', error);
      setProductSuggestions([]);
    }
  }, [userId, productSearchTerms]);

  useMemo(() => {
    const searchCustomers = async (term: string) => {
      if (!userId || term.length < 2) {
        setCustomerSuggestions([]);
        return;
      }
      
      try {
        // In a real app, this would search a customers table
        // For now, simulate pulling from past sales
        const { data, error } = await supabase
          .from('sales')
          .select('customer_name, customer_email, customer_phone')
          .eq('user_id', userId)
          .ilike('customer_name', `%${term}%`)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        // Remove duplicates based on customer name
        const uniqueCustomers = Array.from(
          new Map(data.map(item => 
            [item.customer_name, { 
              name: item.customer_name, 
              email: item.customer_email, 
              phone: item.customer_phone 
            }]
          )).values()
        );
        
        setCustomerSuggestions(uniqueCustomers);
      } catch (error) {
        console.error('Error searching customers:', error);
        setCustomerSuggestions([]);
      }
    };
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (customerSearchTerm) {
        searchCustomers(customerSearchTerm);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [customerSearchTerm, userId]);

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
    setCustomerSearchTerm
  };
}
