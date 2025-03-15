
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Sale } from '@/types/sales';
import { MoreHorizontal, FileText, Edit, Trash } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

// Format date utility
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy');
};

interface SaleTableColumnsOptions {
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
  onViewInvoice: (sale: Sale) => void;
}

export function getSaleTableColumns({
  onEdit,
  onDelete,
  onViewInvoice
}: SaleTableColumnsOptions): ColumnDef<Sale>[] {
  const { currencySymbol } = useSettings();
  
  return [
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      cell: ({ row }) => <div>{row.original.customer_name}</div>
    },
    {
      accessorKey: 'invoice_number',
      header: 'Invoice',
      cell: ({ row }) => <div>{row.original.invoice_number || '-'}</div>
    },
    {
      accessorKey: 'total_amount',
      header: 'Amount',
      cell: ({ row }) => <div>{currencySymbol}{Number(row.original.total_amount).toFixed(2)}</div>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "destructive" | "outline" | "secondary" = "default";
        
        if (status === 'completed') variant = "default";
        else if (status === 'pending') variant = "secondary";
        else if (status === 'cancelled') variant = "destructive";
        else if (status === 'returned') variant = "outline";
        
        return <Badge variant={variant}>{status}</Badge>;
      }
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => <div>{formatDate(row.original.created_at)}</div>
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => {
        const sale = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {sale.status === 'completed' && (
                <DropdownMenuItem onClick={() => onViewInvoice(sale)}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Invoice
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(sale)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(sale.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
