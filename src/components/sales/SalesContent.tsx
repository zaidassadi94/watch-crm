
import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui-custom/DataTable';
import { cn } from '@/lib/utils';
import { useSalesData } from '@/hooks/useSalesData';
import { useSalesDialogs } from '@/hooks/useSalesDialogs';
import { SaleDialog } from '@/components/sales/SaleDialog';
import { SaleActions } from '@/components/sales/SaleActions';
import { SaleSearch } from '@/components/sales/SaleSearch';
import { SaleEmptyState } from '@/components/sales/SaleEmptyState';
import { InvoiceDialog } from '@/components/sales/InvoiceDialog';
import { ReturnDialog } from '@/components/sales/returns/ReturnDialog';
import { Sale } from '@/types/sales';
import { getSaleTableColumns } from '@/components/sales/SaleTableColumns';
import { ColumnDef } from '@tanstack/react-table';
import { Column } from '@/components/ui-custom/DataTable';

// Improved adapter function to handle different column definition structures
function adaptColumns<T extends object>(columns: ColumnDef<T>[]): Column<T>[] {
  return columns.map(col => {
    const header = typeof col.header === 'string' ? col.header : String(col.id || '');
    // Safely access accessorKey which might be in different places based on column structure
    const accessorKey = typeof col.accessorKey === 'string' ? col.accessorKey : 
                       (col as any).accessorKey as string || '';
    // Safely access cell render function
    const cell = col.cell ? col.cell : undefined;
    // Safely access className from meta
    const className = col.meta && typeof col.meta === 'object' ? (col.meta as any).className || '' : '';
    
    return {
      header,
      accessorKey,
      cell,
      className
    };
  });
}

export function SalesContent() {
  const { sales, isLoading, isLoaded, fetchSales, handleDelete } = useSalesData();
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  
  const {
    selectedSale,
    isDialogOpen,
    setIsDialogOpen,
    isInvoiceDialogOpen,
    setIsInvoiceDialogOpen,
    isReturnDialogOpen,
    setIsReturnDialogOpen,
    invoiceSaleItems,
    handleEditSale,
    handleCreateSale,
    handleViewInvoice,
    handleReturn
  } = useSalesDialogs();

  // Use the columns from SaleTableColumns with the adapter
  const tanstackColumns = getSaleTableColumns({
    onEdit: handleEditSale,
    onDelete: handleDelete,
    onViewInvoice: handleViewInvoice
  });
  
  // Convert columns to the format expected by our DataTable
  const columns = adaptColumns<Sale>(tanstackColumns);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customer_email && sale.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = status === '' || sale.status === status;
    const matchesPaymentMethod = paymentMethod === '' || sale.payment_method === paymentMethod;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  return (
    <div 
      className={cn(
        "space-y-6 transition-all duration-300",
        isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
      )}
    >
      <SaleActions 
        isLoaded={isLoaded} 
        onCreateSale={handleCreateSale}
        onReturn={handleReturn}
      />

      <SaleSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        status={status}
        onStatusChange={setStatus}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
      />

      <DataTable
        columns={columns}
        data={filteredSales}
        isLoading={isLoading}
        emptyState={<SaleEmptyState onCreateSale={handleCreateSale} />}
      />

      <SaleDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        sale={selectedSale}
        onSaved={fetchSales}
      />

      <InvoiceDialog
        open={isInvoiceDialogOpen}
        setOpen={setIsInvoiceDialogOpen}
        sale={selectedSale}
        saleItems={invoiceSaleItems}
      />

      <ReturnDialog
        open={isReturnDialogOpen}
        onOpenChange={setIsReturnDialogOpen}
        onComplete={fetchSales}
      />
    </div>
  );
}
