
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
    
    if (!userId) {
      setProductSuggestions([]);
      return;
    }
    
    try {
      let query = supabase
        .from('inventory')
        .select('id, name, brand, sku, price, cost_price, stock_level, stock_status, category')
        .eq('user_id', userId)
        .order('name');
        
      // If search term provided, filter results
      if (term && term.length >= 2) {
        query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%,brand.ilike.%${term}%`);
      }
      
      // Limit results for better performance
      query = query.limit(50);
        
      const { data, error } = await query;
        
      if (error) throw error;
      
      setProductSuggestions(data as ProductSuggestion[]);
    } catch (error) {
      console.error('Error searching products:', error);
      setProductSuggestions([]);
    }
  }, [userId, productSearchTerms]);

  // Search for customers in the customers table first, then fall back to sales
  const searchCustomers = useCallback(async (term: string) => {
    if (!userId || term.length < 2) {
      setCustomerSuggestions([]);
      return;
    }
    
    try {
      // First try to get customers from the customers table
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('name, email, phone, type')
        .eq('user_id', userId)
        .ilike('name', `%${term}%`)
        .order('name')
        .limit(10);
        
      if (customersError && customersError.code !== '42P01') {
        throw customersError;
      }
      
      if (customersData && customersData.length > 0) {
        const suggestions = customersData.map(customer => ({
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        }));
        
        setCustomerSuggestions(suggestions);
        return;
      }
      
      // If no results from customers table, try sales table
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('customer_name, customer_email, customer_phone')
        .eq('user_id', userId)
        .ilike('customer_name', `%${term}%`)
        .order('created_at', { ascending: false })
        .limit(5);
          
      if (salesError) throw salesError;
      
      // Remove duplicates based on customer name
      const uniqueCustomers = Array.from(
        new Map(salesData.map(item => 
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
  }, [userId]);
  
  useMemo(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (customerSearchTerm) {
        searchCustomers(customerSearchTerm);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [customerSearchTerm, searchCustomers]);

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
