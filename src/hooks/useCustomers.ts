
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Customer } from '@/components/customers/useCustomerManagement';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCustomers = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First try to get customers from the customers table
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
        
      if (customersError && customersError.code !== '42P01') {
        throw customersError;
      }
      
      if (customersData && customersData.length > 0) {
        // Convert from customers table format to Customer interface
        const mappedCustomers: Customer[] = customersData.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          type: customer.type,
          totalSpent: 0, // Will be updated below
          lastPurchase: customer.updated_at,
          status: customer.status,
          avatarUrl: undefined
        }));
        
        // Get the sales data to calculate total spent
        const { data: salesData } = await supabase
          .from('sales')
          .select('customer_name, customer_email, created_at, total_amount')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (salesData) {
          // Update the totalSpent and lastPurchase for each customer
          mappedCustomers.forEach(customer => {
            const customerSales = salesData.filter(sale => 
              sale.customer_name === customer.name || 
              (customer.email && sale.customer_email === customer.email)
            );
            
            if (customerSales.length > 0) {
              customer.totalSpent = customerSales.reduce(
                (sum, sale) => sum + Number(sale.total_amount), 0
              );
              
              // Find the most recent purchase
              const latestSale = customerSales.reduce((latest, current) => 
                new Date(current.created_at) > new Date(latest.created_at) ? current : latest
              );
              
              customer.lastPurchase = latestSale.created_at;
              
              // Update type based on total spent
              customer.type = customer.totalSpent > 5000 ? 'VIP' : 'Regular';
            }
          });
        }
        
        setCustomers(mappedCustomers);
        setIsLoading(false);
        return;
      }
      
      // Fallback: If no customers in customers table, get from sales and service requests
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('customer_name, customer_email, customer_phone, created_at, total_amount')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (salesError) throw salesError;
      
      const { data: serviceData, error: serviceError } = await supabase
        .from('service_requests')
        .select('customer_name, customer_email, customer_phone, created_at, price')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (serviceError) throw serviceError;
      
      // Combine and deduplicate customers
      const combinedData = [...(salesData || []), ...(serviceData || [])];
      const uniqueCustomers = new Map();
      
      combinedData.forEach(item => {
        const key = item.customer_name.toLowerCase();
        
        if (!uniqueCustomers.has(key)) {
          const amount = 'total_amount' in item ? Number(item.total_amount) : Number(item.price || 0);
          
          uniqueCustomers.set(key, {
            id: key, // Use name as ID for now
            name: item.customer_name,
            email: item.customer_email,
            phone: item.customer_phone,
            totalSpent: amount,
            lastPurchase: item.created_at,
            type: amount > 5000 ? 'VIP' : 'Regular',
            status: 'Active'
          });
        } else {
          // Update existing customer data
          const existingCustomer = uniqueCustomers.get(key);
          const amount = 'total_amount' in item ? Number(item.total_amount) : Number(item.price || 0);
          
          existingCustomer.totalSpent += amount;
          
          // Update last purchase if newer
          if (new Date(item.created_at) > new Date(existingCustomer.lastPurchase)) {
            existingCustomer.lastPurchase = item.created_at;
          }
          
          // Update type based on total spent
          existingCustomer.type = existingCustomer.totalSpent > 5000 ? 'VIP' : 'Regular';
        }
      });
      
      setCustomers(Array.from(uniqueCustomers.values()));
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error loading customers",
        description: error.message,
        variant: "destructive"
      });
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const refreshCustomers = () => {
    fetchCustomers();
  };

  return {
    customers,
    isLoading,
    refreshCustomers
  };
}
