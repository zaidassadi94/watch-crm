
import { useState, useEffect } from 'react';
import { useCustomers } from '@/hooks/useCustomers';

export interface Customer {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  type: 'Regular' | 'VIP';
  totalSpent: number;
  lastPurchase: string;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
}

export function useCustomerManagement() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { customers, isLoading, refreshCustomers } = useCustomers();

  useEffect(() => {
    // Add a small delay to ensure smooth transition animation
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  const handleOpenDialog = (customer: Customer | null = null) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(false);
  };

  const handleSaved = () => {
    refreshCustomers();
    handleCloseDialog();
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return {
    isLoaded,
    isLoading,
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    setIsDialogOpen,
    selectedCustomer,
    filteredCustomers,
    handleOpenDialog,
    handleCloseDialog,
    handleSaved
  };
}
