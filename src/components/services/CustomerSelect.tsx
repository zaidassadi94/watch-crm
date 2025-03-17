
import React, { memo } from 'react';
import { CustomerSuggestion } from '@/types/inventory';
import { UseFormReturn } from 'react-hook-form';
import { ServiceFormValues } from './serviceFormSchema';
import { CustomerInfoSection } from './CustomerInfoSection';

interface CustomerSelectProps {
  form: UseFormReturn<ServiceFormValues>;
  customerSuggestions: CustomerSuggestion[];
  showCustomerSuggestions: boolean;
  setShowCustomerSuggestions: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectCustomer: (customer: CustomerSuggestion) => void;
  isLoading?: boolean;
}

// Use React.memo to prevent unnecessary re-renders
export const CustomerSelect = memo(function CustomerSelect({
  form,
  customerSuggestions,
  showCustomerSuggestions,
  setShowCustomerSuggestions,
  searchTerm,
  setSearchTerm,
  selectCustomer,
  isLoading = false
}: CustomerSelectProps) {
  return (
    <CustomerInfoSection 
      form={form}
      customerSuggestions={customerSuggestions}
      showCustomerSuggestions={showCustomerSuggestions}
      setShowCustomerSuggestions={setShowCustomerSuggestions}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectCustomer={selectCustomer}
      isLoading={isLoading}
    />
  );
});
