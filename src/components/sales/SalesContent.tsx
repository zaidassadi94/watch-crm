
import React, { useState } from 'react';
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

function adaptColumns<T extends object>(columns: ColumnDef<T>[]): Column<T>[] {
  return columns.map(col => {
    // Extract header from string or function
    const header = typeof col.header === 'string' 
      ? col.header 
      : col.id ? String(col.id) : '';
    
    // Extract accessor key from different possible locations
    let accessorKey = '';
    if ('accessorKey' in col && typeof col.accessorKey === 'string') {
      accessorKey = col.accessorKey;
    } else if (col.id) {
      // Use id as fallback
      accessorKey = String(col.id);
    }
    
    // Create a cell render function compatible with our DataTable
    const cellFunction = ({ row }: { row: { original: T } }) => {
      if (col.cell && typeof col.cell === 'function') {
        // Need to convert between TanStack table's cell renderer and our format
        return col.cell({ row: { original: row.original } } as any);
      }
      return null;
    };
    
    // Extract className safely
    let className = '';
    if (col.meta && typeof col.meta === 'object' && col.meta !== null) {
      className = (col.meta as any).className || '';
    }
    
    return {
      header,
      accessorKey,
      cell: cellFunction,
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

  // Get the columns and adapt them to the DataTable format
  const tanstackColumns = getSaleTableColumns({
    onEdit: handleEditSale,
    onDelete: handleDelete,
    onViewInvoice: handleViewInvoice
  });
  
  // Convert columns to the format expected by our DataTable
  const columns = adaptColumns<Sale>(tanstackColumns);

  // Filter sales based on search and filters
  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customer_email && sale.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = status === '' || sale.status === status;
    const matchesPaymentMethod = paymentMethod === '' || sale.payment_method === paymentMethod;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  console.log("SalesContent rendering:", { 
    salesCount: sales.length,
    isDialogOpen,
    selectedSale,
    isReturnDialogOpen
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

      {isDialogOpen && (
        <SaleDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
          sale={selectedSale}
          onSaved={fetchSales}
        />
      )}

      {isInvoiceDialogOpen && selectedSale && (
        <InvoiceDialog
          open={isInvoiceDialogOpen}
          setOpen={setIsInvoiceDialogOpen}
          sale={selectedSale}
          saleItems={invoiceSaleItems}
        />
      )}

      {isReturnDialogOpen && (
        <ReturnDialog
          open={isReturnDialogOpen}
          onOpenChange={setIsReturnDialogOpen}
          onComplete={fetchSales}
        />
      )}
    </div>
  );
}
