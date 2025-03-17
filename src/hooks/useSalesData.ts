
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Sale } from '@/types/sales';
import { useCommunication } from '@/hooks/useCommunication';

export function useSalesData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendMessage } = useCommunication();
  const [isLoaded, setIsLoaded] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchSales();
    // Add short delay for animation
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, [user]);

  const fetchSales = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure the data matches the Sale interface
      const typedSales: Sale[] = data.map(sale => ({
        id: sale.id,
        customer_name: sale.customer_name,
        customer_email: sale.customer_email,
        customer_phone: sale.customer_phone,
        total_amount: sale.total_amount,
        total_profit: sale.total_profit || 0, // Ensure we have a value even if null
        status: sale.status,
        payment_method: sale.payment_method,
        notes: sale.notes,
        created_at: sale.created_at,
        invoice_number: sale.invoice_number
      }));
      
      setSales(typedSales);
    } catch (error: any) {
      toast({
        title: "Error fetching sales",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sale deleted",
        description: "The sale has been successfully deleted",
      });
      
      // Refresh sales list
      fetchSales();
    } catch (error: any) {
      toast({
        title: "Error deleting sale",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendSaleNotification = async (sale: Sale) => {
    if (!user || !sale.customer_phone) return;

    try {
      // Check if notifications are enabled for sales
      const { data: settings, error: settingsError } = await supabase
        .from('notification_settings')
        .select('sale_confirmation')
        .eq('user_id', user.id)
        .single();
      
      if (settingsError || !settings || !settings.sale_confirmation) {
        return;
      }
      
      // Check if there's a template for sales
      const { data: template, error: templateError } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', 'sale_completed')
        .eq('type', 'sms')
        .single();
      
      // Default template if none exists
      let templateText = '';
      if (templateError || !template) {
        templateText = 'Hello {{customer_name}}, thank you for your purchase! Your invoice #{{invoice_number}} for ₹{{sale_amount}} has been processed successfully.';
      }
      
      // Format the amount
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(sale.total_amount);
      
      // Send the notification
      await sendMessage({
        customerId: sale.id,
        customerPhone: sale.customer_phone,
        customerName: sale.customer_name,
        messageType: 'sms',
        templateId: template?.id,
        templateText,
        variables: {
          customer_name: sale.customer_name,
          sale_amount: formattedAmount,
          sale_date: new Date(sale.created_at).toLocaleDateString(),
          invoice_number: sale.invoice_number || ''
        },
        eventReference: sale.id
      });
      
    } catch (error) {
      console.error("Error sending sale notification:", error);
    }
  };

  return {
    sales,
    isLoading,
    isLoaded,
    fetchSales,
    handleDelete,
    sendSaleNotification
  };
}
