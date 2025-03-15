
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

export function SalesContent() {
  const { sales, isLoading, isLoaded, fetchSales, handleDelete } = useSalesData();
  const [searchTerm, setSearchTerm] = useState("");
  
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

  // Define correct column types for DataTable
  const columns = [
    {
      header: 'Customer',
      accessorKey: 'customer_name',
    },
    {
      header: 'Invoice',
      cell: (item) => <div>{item.invoice_number || '-'}</div>
    },
    {
      header: 'Amount',
      cell: (item) => <div>${Number(item.total_amount).toFixed(2)}</div>
    },
    {
      header: 'Status',
      cell: (item) => <div className="capitalize">{item.status}</div>
    },
    {
      header: 'Date',
      cell: (item) => <div>{new Date(item.created_at).toLocaleDateString()}</div>
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className="flex space-x-2">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleEditSale(item);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            Edit
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleDelete(item.id);
            }}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
          {item.status === 'completed' && (
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                handleViewInvoice(item);
              }}
              className="text-green-500 hover:text-green-700"
            >
              Invoice
            </button>
          )}
        </div>
      )
    }
  ];

  const filteredSales = sales.filter(sale => 
    sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.customer_email && sale.customer_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      />

      <DataTable
        columns={columns}
        data={filteredSales}
        isLoading={isLoading}
        emptyState={<SaleEmptyState onCreateSale={handleCreateSale} />}
        onRowClick={handleEditSale}
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
