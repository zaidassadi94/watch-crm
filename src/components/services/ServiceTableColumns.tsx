
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
import { Service } from '@/types/services';
import { MoreHorizontal, Edit, Trash, ClipboardList } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

// Format date utility
const formatDate = (dateString: string | Date | null) => {
  if (!dateString) return '-';
  return format(new Date(dateString), 'MMM d, yyyy');
};

interface ServiceTableColumnsOptions {
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export function getServiceTableColumns({
  onEdit,
  onDelete
}: ServiceTableColumnsOptions): ColumnDef<Service>[] {
  const { currencySymbol } = useSettings();
  
  return [
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      cell: ({ row }) => <div className="font-medium">{row.original.customer_name}</div>
    },
    {
      accessorKey: 'watch_brand',
      header: 'Watch',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.watch_brand}</div>
          <div className="text-sm text-muted-foreground">{row.original.watch_model || '-'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'service_type',
      header: 'Service Type',
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original.service_type.replace(/_/g, ' ')}
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = row.original.price;
        return <div>{price ? `${currencySymbol}${Number(price).toFixed(2)}` : '-'}</div>;
      },
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
        
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'estimated_completion',
      header: 'Est. Completion',
      cell: ({ row }) => <div>{formatDate(row.original.estimated_completion)}</div>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const service = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(service)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(service.id)}
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
