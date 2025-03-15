
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerSearchToolbar } from '@/components/customers/CustomerSearchToolbar';
import { CustomerPageHeader } from '@/components/customers/CustomerPageHeader';
import { CustomersList } from '@/components/customers/CustomersList';
import { CustomerDialog } from '@/components/customers/CustomerDialog';
import { useCustomerManagement } from '@/components/customers/useCustomerManagement';
import { memo, useCallback, useState } from 'react';

// Memoize the CustomersList component to prevent unnecessary re-renders
const MemoizedCustomersList = memo(CustomersList);

const Customers = () => {
  const {
    isLoaded,
    isLoading,
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    setIsDialogOpen,
    selectedCustomer,
    customers,
    handleOpenDialog,
    handleCloseDialog,
    handleSaved
  } = useCustomerManagement();

  const [customerType, setCustomerType] = useState('');
  const [customerStatus, setCustomerStatus] = useState('');

  // Apply all filters
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = customerType === '' || customer.type === customerType;
    const matchesStatus = customerStatus === '' || customer.status === customerStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className={cn(
      "space-y-6 transition-all duration-300",
      isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
    )}>
      <CustomerPageHeader 
        isLoaded={isLoaded}
        onAddCustomer={() => handleOpenDialog()}
      />

      <Card>
        <CardContent className="p-6">
          <CustomerSearchToolbar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            customerType={customerType}
            onCustomerTypeChange={setCustomerType}
            customerStatus={customerStatus}
            onCustomerStatusChange={setCustomerStatus}
          />

          <MemoizedCustomersList 
            customers={filteredCustomers}
            onEditCustomer={handleOpenDialog}
            searchTerm={searchTerm}
            onAddCustomer={() => handleOpenDialog()}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <CustomerDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={selectedCustomer}
        onSaved={handleSaved}
      />
    </div>
  );
};

export default Customers;
