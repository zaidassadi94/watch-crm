
import { useState, useCallback, useRef } from 'react';
import { ServiceRequest } from '@/types/services';

export function useServiceDialogs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);
  const dialogCloseTimeoutRef = useRef<number | null>(null);

  const handleEditService = useCallback((service: ServiceRequest) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  }, []);

  const handleCreateService = useCallback(() => {
    setSelectedService(null);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    // Clear any existing timeout to prevent multiple timeouts running
    if (dialogCloseTimeoutRef.current) {
      window.clearTimeout(dialogCloseTimeoutRef.current);
    }

    setIsDialogOpen(false);

    // Use a ref to track the timeout so we can clear it if needed
    dialogCloseTimeoutRef.current = window.setTimeout(() => {
      setSelectedService(null);
      dialogCloseTimeoutRef.current = null;
    }, 300);
  }, []);

  // Make sure to clean up on unmount
  const cleanup = useCallback(() => {
    if (dialogCloseTimeoutRef.current) {
      window.clearTimeout(dialogCloseTimeoutRef.current);
      dialogCloseTimeoutRef.current = null;
    }
  }, []);

  return {
    isDialogOpen,
    setIsDialogOpen,
    selectedService,
    handleEditService,
    handleCreateService,
    handleCloseDialog,
    cleanup
  };
}
