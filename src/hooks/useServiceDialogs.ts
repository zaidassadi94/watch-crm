
import { useState } from 'react';
import { ServiceRequest } from '@/types/services';

export function useServiceDialogs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);

  const handleEditService = (service: ServiceRequest) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setIsDialogOpen(true);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    selectedService,
    handleEditService,
    handleCreateService
  };
}
