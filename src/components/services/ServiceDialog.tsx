
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { ServiceRequest } from '@/pages/Services';
import { useAuth } from '@/hooks/useAuth';
import { CustomerSuggestion } from '@/types/inventory';
import { WatchDetailsSection } from './WatchDetailsSection';
import { ServiceDetailsSection } from './ServiceDetailsSection';
import { SaleDialogActions } from '../sales/SaleDialogActions';
import { useCustomerSuggestions } from './useCustomerSuggestions';
import { useServiceForm } from './useServiceForm';
import { CustomerSelect } from './CustomerSelect';

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceRequest | null;
  onSaved: () => void;
}

export function ServiceDialog({ open, onOpenChange, service, onSaved }: ServiceDialogProps) {
  const { user } = useAuth();
  const [localOpen, setLocalOpen] = useState(false);
  
  useEffect(() => {
    // Control local state based on props
    setLocalOpen(open);
  }, [open]);
  
  const { 
    customerSuggestions, 
    showCustomerSuggestions, 
    setShowCustomerSuggestions, 
    setSearchTerm 
  } = useCustomerSuggestions(user);

  const handleSaved = () => {
    onSaved();
    // Ensure safe dialog close
    setLocalOpen(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Safe cancel handler
    form.reset();
    setLocalOpen(false);
    onOpenChange(false);
  };

  const { 
    form, 
    isSubmitting, 
    onSubmit, 
    isEditMode 
  } = useServiceForm({
    service,
    user,
    onSaved: handleSaved,
    onCancel: handleCancel
  });

  // Reset form values when the dialog opens/closes or service changes
  useEffect(() => {
    if (open && service) {
      // Reset form with service data
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
    } else if (open) {
      // Reset to empty form
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

  // Use controlled open state to prevent issues when dialog state changes
  return (
    <Dialog 
      open={localOpen} 
      onOpenChange={(newOpen) => {
        if (!newOpen && !isSubmitting) {
          // Only allow closing if not submitting
          handleCancel();
        } else {
          setLocalOpen(newOpen);
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service Request' : 'Create New Service Request'}</DialogTitle>
          <DialogDescription>
            {service ? 'Update the details of this service request' : 'Enter the details for the new service request'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CustomerSelect 
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
              isEditMode={isEditMode}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
