
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ServiceRequest } from '@/types/services';
import { useServiceForm } from './useServiceForm';
import { CustomerInfoSection } from './CustomerInfoSection';
import { WatchDetailsSection } from './WatchDetailsSection';
import { ServiceDetailsSection } from './ServiceDetailsSection';
import { useServiceData } from '@/hooks/useServiceData';
import { useCustomerSuggestions } from './useCustomerSuggestions';

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceRequest | null;
  onSaved: () => void;
}

export function ServiceDialog({ open, onOpenChange, service, onSaved }: ServiceDialogProps) {
  const { user } = useAuth();
  const { sendServiceStatusNotification } = useServiceData();
  const [activeTab, setActiveTab] = useState('customer');
  
  // Optimization: Only initialize customer suggestions when dialog is open
  const {
    customerSuggestions,
    showCustomerSuggestions,
    setShowCustomerSuggestions,
    searchTerm,
    setSearchTerm
  } = useCustomerSuggestions(user);
  
  const {
    form,
    isSubmitting,
    onSubmit,
    isEditMode
  } = useServiceForm({
    service,
    user,
    onSaved: () => {
      onSaved();
      onOpenChange(false);
    },
    onCancel: () => onOpenChange(false),
    onStatusChange: sendServiceStatusNotification
  });

  // Reset active tab when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab('customer');
    }
  }, [open]);

  // Memoize the customer selection function to prevent re-renders
  const selectCustomer = useCallback((customer: any) => {
    form.setValue('customer_name', customer.name);
    form.setValue('customer_email', customer.email || '');
    form.setValue('customer_phone', customer.phone || '');
    setShowCustomerSuggestions(false);
  }, [form, setShowCustomerSuggestions]);

  // Optimization: Do not render content when dialog is closed
  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Service Request' : 'New Service Request'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="customer">Customer Info</TabsTrigger>
              <TabsTrigger value="watch">Watch Details</TabsTrigger>
              <TabsTrigger value="service">Service Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer" className="space-y-4">
              <CustomerInfoSection 
                form={form} 
                customerSuggestions={customerSuggestions}
                showCustomerSuggestions={showCustomerSuggestions}
                setShowCustomerSuggestions={setShowCustomerSuggestions}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectCustomer={selectCustomer}
              />
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setActiveTab('watch')}>
                  Next
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="watch" className="space-y-4">
              <WatchDetailsSection form={form} />
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab('customer')}>
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab('service')}>
                  Next
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="service" className="space-y-4">
              <ServiceDetailsSection form={form} />
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab('watch')}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : isEditMode ? "Update Service" : "Create Service"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}
