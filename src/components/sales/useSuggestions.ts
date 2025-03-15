
import { useState, useEffect, useCallback } from 'react';
import { ProductSuggestion, CustomerSuggestion } from '@/types/inventory';
import { supabase } from '@/integrations/supabase/client';

export function useSuggestions(userId: string | undefined) {
  const [productSuggestions, setProductSuggestions] = useState<ProductSuggestion[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState<number | null>(null);
  const [productSearchTerms, setProductSearchTerms] = useState<string[]>(['']);
  
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  const updateProductSearchTerms = useCallback((terms: string[]) => {
    setProductSearchTerms(terms);
  }, []);

  // Product search effect
  useEffect(() => {
    if (showProductSuggestions === null || !userId) return;
    
    const searchTerm = productSearchTerms[showProductSuggestions];
    if (!searchTerm || searchTerm.length < 2) {
      setProductSuggestions([]);
      return;
    }

    const loadProductSuggestions = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('id, name, brand, sku, price, stock_level, stock_status, category')
          .eq('user_id', userId)
          .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        setProductSuggestions(data || []);
      } catch (error) {
        console.error("Error fetching product suggestions:", error);
      }
    };
    
    loadProductSuggestions();
  }, [showProductSuggestions, productSearchTerms, userId]);

  // Customer search effect
  useEffect(() => {
    if (!showCustomerSuggestions || !userId || customerSearchTerm.length < 2) {
      setCustomerSuggestions([]);
      return;
    }
    
    const loadCustomerSuggestions = async () => {
      try {
        // Search in sales
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('customer_name, customer_email, customer_phone')
          .eq('user_id', userId)
          .or(`customer_name.ilike.%${customerSearchTerm}%,customer_phone.ilike.%${customerSearchTerm}%,customer_email.ilike.%${customerSearchTerm}%`)
          .order('created_at', { ascending: false });
          
        if (salesError) throw salesError;
        
        // Search in service_requests
        const { data: serviceData, error: serviceError } = await supabase
          .from('service_requests')
          .select('customer_name, customer_email, customer_phone')
          .eq('user_id', userId)
          .or(`customer_name.ilike.%${customerSearchTerm}%,customer_phone.ilike.%${customerSearchTerm}%,customer_email.ilike.%${customerSearchTerm}%`)
          .order('created_at', { ascending: false });
          
        if (serviceError) throw serviceError;
        
        // Combine and deduplicate results
        const combinedData = [...(salesData || []), ...(serviceData || [])];
        const uniqueCustomers: CustomerSuggestion[] = [];
        
        combinedData.forEach(item => {
          const exists = uniqueCustomers.some(customer => 
            customer.name === item.customer_name && 
            customer.email === item.customer_email && 
            customer.phone === item.customer_phone
          );
          
          if (!exists) {
            uniqueCustomers.push({
              name: item.customer_name,
              email: item.customer_email,
              phone: item.customer_phone
            });
          }
        });
        
        setCustomerSuggestions(uniqueCustomers);
      } catch (error) {
        console.error("Error fetching customer suggestions:", error);
      }
    };
    
    loadCustomerSuggestions();
  }, [customerSearchTerm, userId, showCustomerSuggestions]);

  const handleProductSearch = useCallback((value: string, index: number) => {
    setProductSearchTerms(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    
    if (value.length >= 2) {
      setShowProductSuggestions(index);
    } else {
      setShowProductSuggestions(null);
    }
  }, []);

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
