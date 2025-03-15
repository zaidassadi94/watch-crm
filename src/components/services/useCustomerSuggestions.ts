
import { useState, useEffect } from 'react';
import { CustomerSuggestion, CustomerWatchDetails } from '@/types/inventory';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export function useCustomerSuggestions(user: User | null) {
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (searchTerm.length < 2 || !user || !showCustomerSuggestions) {
      return;
    }
    
    const loadCustomerSuggestions = async () => {
      try {
        const { data: serviceData, error: serviceError } = await supabase
          .from('service_requests')
          .select('customer_name, customer_email, customer_phone, watch_brand, watch_model, serial_number')
          .eq('user_id', user.id)
          .or(`customer_name.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false });
          
        if (serviceError) throw serviceError;
        
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('customer_name, customer_email, customer_phone')
          .eq('user_id', user.id)
          .or(`customer_name.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false });
          
        if (salesError) throw salesError;
        
        const combinedData = [...(serviceData || []), ...(salesData || [])];
        const uniqueCustomers: CustomerSuggestion[] = [];
        
        combinedData.forEach(item => {
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
              email: item.customer_email,
              phone: item.customer_phone,
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
      }
    };
    
    loadCustomerSuggestions();
  }, [searchTerm, user, showCustomerSuggestions]);

  return {
    customerSuggestions,
    showCustomerSuggestions,
    setShowCustomerSuggestions,
    searchTerm,
    setSearchTerm
  };
}
