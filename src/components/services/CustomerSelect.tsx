
import React from 'react';
import { CustomerSuggestion } from '@/types/inventory';
import { UseFormReturn } from 'react-hook-form';
import { ServiceFormValues } from './serviceFormSchema';

interface CustomerSelectProps {
  form: UseFormReturn<ServiceFormValues>;
  customerSuggestions: CustomerSuggestion[];
  showCustomerSuggestions: boolean;
  setShowCustomerSuggestions: (show: boolean) => void;
  setSearchTerm: (term: string) => void;
  selectCustomer: (customer: CustomerSuggestion) => void;
}

export function CustomerSelect({
  form,
  customerSuggestions,
  showCustomerSuggestions,
  setShowCustomerSuggestions,
  setSearchTerm,
  selectCustomer
}: CustomerSelectProps) {
  // This component simply connects the various customer-related components
  // It doesn't contain its own UI elements but is used to organize the component tree
  
  const handleCustomerSelection = (customer: CustomerSuggestion) => {
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

  return (
    <CustomerInfoSection 
      form={form}
      customerSuggestions={customerSuggestions}
      showCustomerSuggestions={showCustomerSuggestions}
      setShowCustomerSuggestions={setShowCustomerSuggestions}
      setSearchTerm={setSearchTerm}
      selectCustomer={handleCustomerSelection}
    />
  );
}

import { CustomerInfoSection } from './CustomerInfoSection';
