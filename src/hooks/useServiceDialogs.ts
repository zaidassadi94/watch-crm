
import { useState, useCallback } from 'react';
import { ServiceRequest } from '@/types/services';

export function useServiceDialogs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);

  const handleEditService = useCallback((service: ServiceRequest) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  }, []);

  const handleCreateService = useCallback(() => {
    setSelectedService(null);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    // Add a small delay before resetting the selected service
    // to prevent UI glitches during the closing animation
    setTimeout(() => {
      setSelectedService(null);
    }, 300);
  }, []);

  return {
    isDialogOpen,
    setIsDialogOpen,
    selectedService,
    handleEditService,
    handleCreateService,
    handleCloseDialog
  };
}
