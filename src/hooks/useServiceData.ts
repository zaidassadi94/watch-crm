
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ServiceRequest } from '@/types/services';

export function useServiceData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  return {
    services,
    isLoading,
    isLoaded,
    fetchServices,
    handleDelete
  };
}
