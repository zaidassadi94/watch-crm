
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
  searchTerm: string; // Add this prop to match CustomerInfoSection
  setSearchTerm: (term: string) => void;
  selectCustomer: (customer: CustomerSuggestion) => void;
}

// Use React.memo to prevent unnecessary re-renders
export const CustomerSelect = memo(function CustomerSelect({
  form,
  customerSuggestions,
  showCustomerSuggestions,
  setShowCustomerSuggestions,
  searchTerm,
  setSearchTerm,
  selectCustomer
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
    />
  );
});
