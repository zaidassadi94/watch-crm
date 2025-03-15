import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, Edit, Trash2, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sale } from '@/types/sales';
import { useSalesDialogs } from '@/hooks/useSalesDialogs';
import { useSalesData } from '@/hooks/useSalesData';
import { useSettings } from '@/hooks/useSettings';

export const SaleTableColumns: ColumnDef<Sale>[] = [
  {
    accessorKey: 'customer_name',
    header: 'Customer Name',
  },
  {
    accessorKey: 'customer_email',
    header: 'Email',
  },
  {
    accessorKey: 'customer_phone',
    header: 'Phone',
  },
  {
    accessorKey: 'total_amount',
    header: ({ column }) => {
      const { currencySymbol } = useSettings();
      return (
        <div className="text-right">
          Total ({currencySymbol})
        </div>
      );
    },
    cell: ({ row }) => {
      const { currencySymbol } = useSettings();
      const amount = parseFloat(row.getValue('total_amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      let badgeColor = "secondary";
      if (status === "completed") badgeColor = "green";
      if (status === "pending") badgeColor = "amber";
      if (status === "cancelled") badgeColor = "red";
      if (status === "returned") badgeColor = "destructive";

      return (
        <Badge variant={badgeColor}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'payment_method',
    header: 'Payment Method',
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }) => format(new Date(row.getValue('created_at')), 'PPP'),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const sale = row.original;
      const { handleEditSale, handleViewInvoice, handleReturn } = useSalesDialogs();
      const { handleDelete } = useSalesData();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewInvoice(sale)}>
              <FileText className="mr-2 h-4 w-4" />
              View Invoice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditSale(sale)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Sale
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleReturn()}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Process Return
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(sale.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
