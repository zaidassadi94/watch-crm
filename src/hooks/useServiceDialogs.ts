
import { useState, useCallback, useRef, useEffect } from 'react';
import { ServiceRequest } from '@/types/services';

export function useServiceDialogs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);
  const dialogCloseTimeoutRef = useRef<number | null>(null);
  
  // Force cleanup on component unmount
  useEffect(() => {
    return () => {
      if (dialogCloseTimeoutRef.current) {
        window.clearTimeout(dialogCloseTimeoutRef.current);
        dialogCloseTimeoutRef.current = null;
      }
    };
  }, []);

  const handleEditService = useCallback((service: ServiceRequest) => {
    // Clear any existing timeout to avoid stale state
    if (dialogCloseTimeoutRef.current) {
      window.clearTimeout(dialogCloseTimeoutRef.current);
      dialogCloseTimeoutRef.current = null;
    }
    
    setSelectedService(service);
    setIsDialogOpen(true);
  }, []);

  const handleCreateService = useCallback(() => {
    // Clear any existing timeout to avoid stale state
    if (dialogCloseTimeoutRef.current) {
      window.clearTimeout(dialogCloseTimeoutRef.current);
      dialogCloseTimeoutRef.current = null;
    }
    
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

  // Explicit cleanup function that can be called manually
  const cleanup = useCallback(() => {
    if (dialogCloseTimeoutRef.current) {
      window.clearTimeout(dialogCloseTimeoutRef.current);
      dialogCloseTimeoutRef.current = null;
    }
    setSelectedService(null);
  }, []);

  // Provide a safer way to close the dialog that ensures proper cleanup
  const safeCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    // Immediately clean up without timeout to prevent stale state
    setSelectedService(null);
    if (dialogCloseTimeoutRef.current) {
      window.clearTimeout(dialogCloseTimeoutRef.current);
      dialogCloseTimeoutRef.current = null;
    }
  }, []);

  return {
    isDialogOpen,
    setIsDialogOpen: safeCloseDialog, // Replace with the safer version
    selectedService,
    handleEditService,
    handleCreateService,
    handleCloseDialog: safeCloseDialog, // Replace with the safer version
    cleanup
  };
}
