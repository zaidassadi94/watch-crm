
import React, { createContext, useContext, useEffect } from 'react';
import { ReturnFormValues } from '../saleFormSchema';
import { Sale } from '@/types/sales';
import { SaleItemWithInventory } from '../sale-data/loadSaleItems';
import { useSaleReturnData } from './hooks/useSaleReturnData';
import { useReturnFormHandler } from './hooks/useReturnFormHandler';
import { useReturnProcessor } from './hooks/useReturnProcessor';

interface ReturnDialogContextProps {
  form: ReturnFormReturn;
  selectedSale: Sale | null;
  selectedSaleItems: SaleItemWithInventory[];
  sales: Sale[]; 
  isSubmitting: boolean;
  fetchSales: () => Promise<void>;
  handleSaleChange: (saleId: string) => Promise<void>;
  processReturn: (data: ReturnFormValues) => Promise<void>;
}

type ReturnFormReturn = ReturnType<typeof useReturnFormHandler>['form'];

const ReturnDialogContext = createContext<ReturnDialogContextProps | undefined>(undefined);

export function ReturnDialogProvider({ 
  children, 
  onComplete 
}: { 
  children: (context: ReturnDialogContextProps) => React.ReactNode;
  onComplete: () => void;
}) {
  // Use our custom hooks
  const {
    sales,
    selectedSale,
    selectedSaleItems,
    fetchSales,
    handleSaleChange: handleSaleChangeBase,
    setSelectedSale,
    setSelectedSaleItems
  } = useSaleReturnData();
  
  const {
    form,
    isSubmitting,
    setIsSubmitting,
    prepareFormItems,
    resetForm
  } = useReturnFormHandler();
  
  const {
    isProcessing,
    processReturn: processReturnBase
  } = useReturnProcessor();
  
  // Fetch sales on mount
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);
  
  // Handle sale selection
  const handleSaleChange = async (saleId: string) => {
    form.setValue('sale_id', saleId);
    
    const result = await handleSaleChangeBase(saleId);
    
    if (!result) {
      form.setValue('items', []);
      return;
    }
    
    prepareFormItems(result.itemsData);
  };
  
  // Process return with proper context
  const processReturn = async (data: ReturnFormValues) => {
    setIsSubmitting(true);
    await processReturnBase(data, selectedSale, () => {
      resetForm();
      setSelectedSale(null);
      setSelectedSaleItems([]);
      onComplete();
    });
    setIsSubmitting(false);
  };
  
  const contextValue: ReturnDialogContextProps = {
    form,
    selectedSale,
    selectedSaleItems,
    sales,
    isSubmitting: isSubmitting || isProcessing,
    fetchSales,
    handleSaleChange,
    processReturn
  };
  
  return (
    <ReturnDialogContext.Provider value={contextValue}>
      {children(contextValue)}
    </ReturnDialogContext.Provider>
  );
}

export function useReturnDialog() {
  const context = useContext(ReturnDialogContext);
  if (context === undefined) {
    throw new Error('useReturnDialog must be used within a ReturnDialogProvider');
  }
  return context;
}
