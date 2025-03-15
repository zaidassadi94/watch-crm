
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ServiceRequest } from '@/pages/Services';
import { useAuth } from '@/hooks/useAuth';
import { CustomerSuggestion } from '@/types/inventory';
import { ServiceFormValues, serviceFormSchema } from './serviceFormSchema';
import { CustomerInfoSection } from './CustomerInfoSection';
import { WatchDetailsSection } from './WatchDetailsSection';
import { ServiceDetailsSection } from './ServiceDetailsSection';
import { SaleDialogActions } from '../sales/SaleDialogActions';
import { useCustomerSuggestions } from './useCustomerSuggestions';

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceRequest | null;
  onSaved: () => void;
}

export function ServiceDialog({ open, onOpenChange, service, onSaved }: ServiceDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    customerSuggestions, 
    showCustomerSuggestions, 
    setShowCustomerSuggestions, 
    setSearchTerm 
  } = useCustomerSuggestions(user);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      watch_brand: '',
      watch_model: '',
      serial_number: '',
      service_type: 'repair',
      description: '',
      status: 'pending',
      estimated_completion: '',
      price: null,
    }
  });

  // Reset form values when the dialog opens/closes or service changes
  useEffect(() => {
    if (open) {
      if (service) {
        form.reset({
          customer_name: service.customer_name || '',
          customer_email: service.customer_email || '',
          customer_phone: service.customer_phone || '',
          watch_brand: service.watch_brand || '',
          watch_model: service.watch_model || '',
          serial_number: service.serial_number || '',
          service_type: service.service_type || 'repair',
          description: service.description || '',
          status: service.status || 'pending',
          estimated_completion: service.estimated_completion 
            ? new Date(service.estimated_completion).toISOString().split('T')[0] 
            : '',
          price: service.price !== undefined && service.price !== null 
            ? Number(service.price) 
            : null,
        });
      } else {
        form.reset({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          watch_brand: '',
          watch_model: '',
          serial_number: '',
          service_type: 'repair',
          description: '',
          status: 'pending',
          estimated_completion: '',
          price: null,
        });
      }
    }
  }, [service, form, open]);

  const selectCustomer = (customer: CustomerSuggestion) => {
    form.setValue('customer_name', customer.name);
    if (customer.email) form.setValue('customer_email', customer.email);
    if (customer.phone) form.setValue('customer_phone', customer.phone);
    
    if (customer.watches && customer.watches.length > 0) {
      const watch = customer.watches[0];
      form.setValue('watch_brand', watch.brand);
      if (watch.model) form.setValue('watch_model', watch.model);
      if (watch.serial) form.setValue('serial_number', watch.serial);
    }
    
    setShowCustomerSuggestions(false);
  };

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
        const { error } = await supabase
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
            updated_at: new Date().toISOString(),
          })
          .eq('id', service.id);

        if (error) throw error;

        toast({
          title: "Service updated",
          description: "Service request has been updated successfully",
        });
      } else {
        const { error } = await supabase
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
          });

        if (error) throw error;

        toast({
          title: "Service created",
          description: "New service request has been created successfully",
        });
      }

      onSaved();
      onOpenChange(false);
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

  const handleCancel = () => {
    // Reset form and close dialog
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen && !isSubmitting) {
          handleCancel();
        } else {
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service Request' : 'Create New Service Request'}</DialogTitle>
          <DialogDescription>
            {service ? 'Update the details of this service request' : 'Enter the details for the new service request'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CustomerInfoSection 
              form={form}
              customerSuggestions={customerSuggestions}
              showCustomerSuggestions={showCustomerSuggestions}
              setShowCustomerSuggestions={setShowCustomerSuggestions}
              setSearchTerm={setSearchTerm}
              selectCustomer={selectCustomer}
            />
            
            <WatchDetailsSection form={form} />
            
            <ServiceDetailsSection form={form} />
            
            <SaleDialogActions 
              isSubmitting={isSubmitting} 
              onCancel={handleCancel}
              isEditMode={!!service}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
