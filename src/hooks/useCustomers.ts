
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Customer } from '@/components/customers/useCustomerManagement';

export interface CustomerData {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  type: 'Regular' | 'VIP';
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  communication_preferences?: {
    sms: boolean;
    whatsapp: boolean;
  };
  totalSpent: number;
  lastPurchase: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCustomers = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch customers from the database
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Fetch sales data to calculate total spent and last purchase date
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('customer_name, total_amount, created_at')
        .eq('user_id', user.id);
      
      if (salesError) throw salesError;
      
      // Process the customer data
      const processedCustomers: Customer[] = (data || []).map(customer => {
        // Find all sales for this customer
        const customerSales = salesData?.filter(sale => 
          sale.customer_name === customer.name
        ) || [];
        
        // Calculate total spent
        const totalSpent = customerSales.reduce(
          (sum, sale) => sum + (parseFloat(sale.total_amount as string) || 0), 
          0
        );
        
        // Find last purchase date
        const sortedSales = [...customerSales].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Default last purchase date to current date if no sales
        const lastPurchase = sortedSales[0]?.created_at || new Date().toISOString();
        
        // Default avatar based on name
        let initialsAvatar = '';
        if (customer.name) {
          const nameParts = customer.name.split(' ');
          initialsAvatar = nameParts.length > 1
            ? `https://ui-avatars.com/api/?name=${nameParts[0]}+${nameParts[1]}&background=random`
            : `https://ui-avatars.com/api/?name=${nameParts[0]}&background=random`;
        }
        
        return {
          id: customer.id,
          name: customer.name,
          email: customer.email || undefined,
          phone: customer.phone || undefined,
          type: customer.type as 'Regular' | 'VIP',
          status: customer.status as 'Active' | 'Inactive',
          avatarUrl: initialsAvatar,
          communication_preferences: customer.communication_preferences || { sms: true, whatsapp: false },
          totalSpent,
          lastPurchase
        };
      });
      
      setCustomers(processedCustomers);
    } catch (error: any) {
      toast({
        title: "Error fetching customers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  return {
    customers,
    isLoading,
    refreshCustomers: fetchCustomers
  };
}
