
import { useState, useEffect, useCallback } from 'react';
import { CustomerSuggestion, CustomerWatchDetails } from '@/types/inventory';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export function useCustomerSuggestions(user: User | null) {
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Add debounce mechanism for search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Debounce search term
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce time
    
    setDebounceTimer(timerId);
    
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Cleanup function that will be exposed to parent components
  const cleanupCustomerSuggestions = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setShowCustomerSuggestions(false);
    setCustomerSuggestions([]);
    setIsLoading(false);
  }, [debounceTimer]);

  // Memoize the loadCustomerSuggestions function to prevent recreating on every render
  const loadCustomerSuggestions = useCallback(async (term: string) => {
    if (!term || term.length < 2 || !user) {
      setCustomerSuggestions([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data: serviceData, error: serviceError } = await supabase
        .from('service_requests')
        .select('customer_name, customer_email, customer_phone, watch_brand, watch_model, serial_number')
        .eq('user_id', user.id)
        .or(`customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%,customer_email.ilike.%${term}%`)
        .order('created_at', { ascending: false })
        .limit(10); // Limit results for better performance
        
      if (serviceError) {
        console.error("Error fetching service data:", serviceError);
        setCustomerSuggestions([]);
        setIsLoading(false);
        return;
      }
      
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('customer_name, customer_email, customer_phone')
        .eq('user_id', user.id)
        .or(`customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%,customer_email.ilike.%${term}%`)
        .order('created_at', { ascending: false })
        .limit(10); // Limit results for better performance
        
      if (salesError) {
        console.error("Error fetching sales data:", salesError);
        // Continue with service data only
      }
      
      const combinedData = [...(serviceData || []), ...(salesData || [])];
      const uniqueCustomers: CustomerSuggestion[] = [];
      
      combinedData.forEach(item => {
        // Skip items without a customer name
        if (!item.customer_name) return;
        
        const existingCustomer = uniqueCustomers.find(c => 
          c.name === item.customer_name &&
          c.email === item.customer_email &&
          c.phone === item.customer_phone
        );
        
        if (existingCustomer) {
          if ('watch_brand' in item && item.watch_brand) {
            if (!existingCustomer.watches) {
              existingCustomer.watches = [];
            }
            
            const watchItem = item as {
              watch_brand: string;
              watch_model?: string | null;
              serial_number?: string | null;
            };
            
            const watch: CustomerWatchDetails = {
              brand: watchItem.watch_brand,
              model: watchItem.watch_model || null,
              serial: watchItem.serial_number || null
            };
            
            const existingWatch = existingCustomer.watches.find(w => 
              w.brand === watch.brand && 
              w.model === watch.model && 
              w.serial === watch.serial
            );
            
            if (!existingWatch) {
              existingCustomer.watches.push(watch);
            }
          }
        } else {
          const newCustomer: CustomerSuggestion = {
            name: item.customer_name,
            email: item.customer_email || null,
            phone: item.customer_phone || null,
          };
          
          if ('watch_brand' in item && item.watch_brand) {
            const watchItem = item as {
              watch_brand: string;
              watch_model?: string | null;
              serial_number?: string | null;
            };
            
            newCustomer.watches = [{
              brand: watchItem.watch_brand,
              model: watchItem.watch_model || null,
              serial: watchItem.serial_number || null
            }];
          }
          
          uniqueCustomers.push(newCustomer);
        }
      });
      
      setCustomerSuggestions(uniqueCustomers);
    } catch (error) {
      console.error("Error fetching customer suggestions:", error);
      setCustomerSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Use debounced search term for data fetching
  useEffect(() => {
    if (!showCustomerSuggestions) {
      return;
    }
    
    loadCustomerSuggestions(debouncedSearchTerm);
    
    // Cleanup on unmount
    return () => {
      setCustomerSuggestions([]);
      setIsLoading(false);
    };
  }, [debouncedSearchTerm, user, showCustomerSuggestions, loadCustomerSuggestions]);

  return {
    customerSuggestions,
    showCustomerSuggestions,
    setShowCustomerSuggestions,
    searchTerm,
    setSearchTerm,
    isLoading,
    cleanupCustomerSuggestions
  };
}
