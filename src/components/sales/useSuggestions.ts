
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductSuggestion, CustomerSuggestion } from '@/types/inventory';

export function useSuggestions(userId: string | undefined) {
  const [productSuggestions, setProductSuggestions] = useState<ProductSuggestion[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState<number | null>(null);
  const [productSearchTerms, setProductSearchTerms] = useState<string[]>(['']);
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");

  // Product suggestions
  useEffect(() => {
    const index = showProductSuggestions;
    if (index === null || !productSearchTerms[index] || productSearchTerms[index].length < 2 || !userId) {
      setProductSuggestions([]);
      return;
    }
    
    const loadProductSuggestions = async () => {
      try {
        const searchTerm = productSearchTerms[index];
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('user_id', userId)
          .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        setProductSuggestions(data || []);
      } catch (error) {
        console.error("Error fetching product suggestions:", error);
      }
    };
    
    loadProductSuggestions();
  }, [showProductSuggestions, productSearchTerms, userId]);

  // Customer suggestions - fixed dependency array to prevent infinite loop
  useEffect(() => {
    if (customerSearchTerm.length < 2 || !userId || !showCustomerSuggestions) {
      return;
    }
    
    const loadCustomerSuggestions = async () => {
      try {
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('customer_name, customer_email, customer_phone')
          .eq('user_id', userId)
          .or(`customer_name.ilike.%${customerSearchTerm}%,customer_phone.ilike.%${customerSearchTerm}%,customer_email.ilike.%${customerSearchTerm}%`)
          .order('created_at', { ascending: false });
          
        if (salesError) throw salesError;
        
        const { data: serviceData, error: serviceError } = await supabase
          .from('service_requests')
          .select('customer_name, customer_email, customer_phone')
          .eq('user_id', userId)
          .or(`customer_name.ilike.%${customerSearchTerm}%,customer_phone.ilike.%${customerSearchTerm}%,customer_email.ilike.%${customerSearchTerm}%`)
          .order('created_at', { ascending: false });
          
        if (serviceError) throw serviceError;
        
        const combinedData = [...(salesData || []), ...(serviceData || [])];
        const uniqueCustomers: CustomerSuggestion[] = [];
        
        combinedData.forEach(item => {
          const exists = uniqueCustomers.some(c => 
            c.name === item.customer_name && 
            c.email === item.customer_email && 
            c.phone === item.customer_phone
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
  }, [customerSearchTerm, userId, showCustomerSuggestions]); // Added showCustomerSuggestions to dependency array

  const handleProductSearch = (value: string, index: number) => {
    const newSearchTerms = [...productSearchTerms];
    newSearchTerms[index] = value;
    setProductSearchTerms(newSearchTerms);
  };

  const updateProductSearchTerms = (terms: string[]) => {
    setProductSearchTerms(terms);
  };

  return {
    productSuggestions,
    showProductSuggestions,
    setShowProductSuggestions,
    productSearchTerms,
    updateProductSearchTerms,
    handleProductSearch,
    customerSuggestions,
    showCustomerSuggestions,
    setCustomerSearchTerm,
    setShowCustomerSuggestions
  };
}
