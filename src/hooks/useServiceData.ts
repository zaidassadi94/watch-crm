
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ServiceRequest } from '@/types/services';
import { useMessageSender } from '@/hooks/communication/useMessageSender';

export function useServiceData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sendMessage } = useMessageSender();
  
  useEffect(() => {
    fetchServices();
    // Add short delay for animation
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, [user]);

  const fetchServices = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the returned data to ensure it matches the ServiceRequest type
      // This handles cases where payment_status or payment_method may be null
      const formattedServices: ServiceRequest[] = data ? data.map(service => ({
        ...service,
        payment_status: service.payment_status || 'unpaid',
        payment_method: service.payment_method || null
      })) : [];
      
      setServices(formattedServices);
    } catch (error: any) {
      toast({
        title: "Error fetching service requests",
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
        .from('service_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Service request deleted",
        description: "The service request has been successfully deleted",
      });
      
      // Refresh services list
      fetchServices();
    } catch (error: any) {
      toast({
        title: "Error deleting service request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendServiceStatusNotification = async (service: ServiceRequest, statusBefore: string) => {
    if (!user) return;

    try {
      // If status hasn't changed, no notification needed
      if (statusBefore === service.status) return;
      
      // Get notification settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (settingsError) {
        console.error("Error fetching notification settings:", settingsError);
        return;
      }
      
      // Check if notification is enabled for this status
      let shouldSend = false;
      
      switch (service.status) {
        case 'pending':
          shouldSend = settingsData.service_check_in;
          break;
        case 'in progress':
          shouldSend = settingsData.service_in_progress;
          break;
        case 'ready for pickup':
          shouldSend = settingsData.service_ready;
          break;
        case 'completed':
          shouldSend = settingsData.service_completed;
          break;
        default:
          shouldSend = false;
      }
      
      if (!shouldSend || !service.customer_phone) return;
      
      // Get appropriate template for this status
      const { data: templateData, error: templateError } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', service.status === 'pending' ? 'service_check_in' : 
                         service.status === 'in progress' ? 'service_in_progress' :
                         service.status === 'ready for pickup' ? 'service_ready' : 
                         'service_completed')
        .eq('type', 'sms')  // Default to SMS
        .single();
      
      if (templateError && templateError.code !== 'PGRST116') {
        console.error("Error fetching template:", templateError);
        return;
      }
      
      // Default template text if no template found
      let templateText = '';
      if (!templateData) {
        switch (service.status) {
          case 'pending':
            templateText = 'Hello {{customer_name}}, your watch ({{watch_brand}} {{watch_model}}) has been checked in for service. We will update you on progress.';
            break;
          case 'in progress':
            templateText = 'Hello {{customer_name}}, your watch ({{watch_brand}} {{watch_model}}) service is now in progress. Estimated completion: {{estimated_completion}}.';
            break;
          case 'ready for pickup':
            templateText = 'Hello {{customer_name}}, your watch ({{watch_brand}} {{watch_model}}) is now ready for pickup. Please visit our store to collect it.';
            break;
          case 'completed':
            templateText = 'Hello {{customer_name}}, your watch ({{watch_brand}} {{watch_model}}) service has been completed. Thank you for your business.';
            break;
        }
      }
      
      // Calculate readable estimated completion date
      let formattedDate = '';
      if (service.estimated_completion) {
        const date = new Date(service.estimated_completion);
        formattedDate = date.toLocaleDateString();
      }
      
      // Send the notification
      await sendMessage({
        customerId: service.id,
        customerPhone: service.customer_phone,
        customerName: service.customer_name,
        messageType: 'sms', // Default to SMS
        templateId: templateData?.id,
        templateText: templateText,
        variables: {
          customer_name: service.customer_name,
          watch_brand: service.watch_brand,
          watch_model: service.watch_model || '',
          estimated_completion: formattedDate,
          service_type: service.service_type
        },
        eventReference: service.id
      });
      
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return {
    services,
    isLoading,
    isLoaded,
    fetchServices,
    handleDelete,
    sendServiceStatusNotification
  };
}
