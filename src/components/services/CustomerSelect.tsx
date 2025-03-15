
import React from 'react';
import { CustomerSuggestion } from '@/types/inventory';
import { UseFormReturn } from 'react-hook-form';
import { ServiceFormValues } from './serviceFormSchema';
import { CustomerInfoSection } from './CustomerInfoSection';

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
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('customer_name', value);
    setSearchTerm(value);
  };
  
  // Component to handle customer selection
  return (
    <CustomerInfoSection 
      form={form}
      customerSuggestions={customerSuggestions}
      showCustomerSuggestions={showCustomerSuggestions}
      setShowCustomerSuggestions={setShowCustomerSuggestions}
      setSearchTerm={setSearchTerm}
      selectCustomer={selectCustomer}
    />
  );
}
