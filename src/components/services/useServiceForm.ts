
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ServiceRequest } from '@/types/services';
import { User } from '@supabase/supabase-js';
import { ServiceFormValues, serviceFormSchema } from './serviceFormSchema';

interface UseServiceFormProps {
  service: ServiceRequest | null;
  user: User | null;
  onSaved: () => void;
  onCancel: () => void;
  onStatusChange?: (service: ServiceRequest, previousStatus: string) => void;
}

export function useServiceForm({ service, user, onSaved, onCancel, onStatusChange }: UseServiceFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<string>(service?.status || 'pending');
  
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      customer_name: service?.customer_name || '',
      customer_email: service?.customer_email || '',
      customer_phone: service?.customer_phone || '',
      watch_brand: service?.watch_brand || '',
      watch_model: service?.watch_model || '',
      serial_number: service?.serial_number || '',
      service_type: service?.service_type || 'repair',
      description: service?.description || '',
      status: service?.status || 'pending',
      estimated_completion: service?.estimated_completion 
        ? new Date(service.estimated_completion).toISOString().split('T')[0] 
        : '',
      price: service?.price !== undefined && service?.price !== null 
        ? Number(service.price) 
        : null,
      payment_status: service?.payment_status || 'unpaid',
      payment_method: service?.payment_method || '',
    }
  });

  useEffect(() => {
    if (service) {
      setPreviousStatus(service.status);
    }
  }, [service]);

  const onSubmit = async (data: ServiceFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);

      if (service) {
        const { data: updatedService, error } = await supabase
          .from('service_requests')
          .update({
            customer_name: data.customer_name,
            customer_email: data.customer_email || null,
            customer_phone: data.customer_phone || null,
            watch_brand: data.watch_brand,
            watch_model: data.watch_model || null,
            serial_number: data.serial_number || null,
            service_type: data.service_type,
            description: data.description || null,
            status: data.status,
            estimated_completion: data.estimated_completion || null,
            price: data.price,
            payment_status: data.payment_status || 'unpaid',
            payment_method: data.payment_method || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', service.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Service updated",
          description: "Service request has been updated successfully",
        });
        
        // If status changed, trigger notification
        if (onStatusChange && updatedService && previousStatus !== data.status) {
          onStatusChange(updatedService as ServiceRequest, previousStatus);
        }
      } else {
        const { data: newService, error } = await supabase
          .from('service_requests')
          .insert({
            user_id: user.id,
            customer_name: data.customer_name,
            customer_email: data.customer_email || null,
            customer_phone: data.customer_phone || null,
            watch_brand: data.watch_brand,
            watch_model: data.watch_model || null,
            serial_number: data.serial_number || null,
            service_type: data.service_type,
            description: data.description || null,
            status: data.status,
            estimated_completion: data.estimated_completion || null,
            price: data.price,
            payment_status: data.payment_status || 'unpaid',
            payment_method: data.payment_method || null,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Service created",
          description: "New service request has been created successfully",
        });
        
        // New service - also send notification if it's not in pending status
        if (onStatusChange && newService && data.status !== 'pending') {
          onStatusChange(newService as ServiceRequest, 'pending');
        }
      }

      // Call the onSaved callback after the operation is complete
      onSaved();
    } catch (error: any) {
      toast({
        title: service ? "Error updating service" : "Error creating service",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit,
    isEditMode: !!service
  };
}
