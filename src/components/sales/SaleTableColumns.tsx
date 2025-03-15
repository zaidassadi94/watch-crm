
import React from 'react';
import { 
  MoreHorizontal, Edit, Trash2, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Column } from '@/components/ui-custom/DataTable';
import { cn } from '@/lib/utils';
import { Sale } from '@/pages/Sales';

interface SaleStatusStyle {
  color: string;
  icon: React.ElementType;
}

const statusStyles: Record<string, SaleStatusStyle> = {
  pending: { 
    color: "text-amber-700 bg-amber-100", 
    icon: Clock
  },
  completed: { 
    color: "text-green-700 bg-green-100", 
    icon: CheckCircle  
  },
  cancelled: { 
    color: "text-red-700 bg-red-100", 
    icon: XCircle 
  }
};

interface SaleTableColumnsProps {
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
}

export const getSaleTableColumns = ({ onEdit, onDelete }: SaleTableColumnsProps): Column<Sale>[] => [
  {
    header: "Customer",
    accessorKey: "customer_name",
    cell: (sale: Sale) => (
      <div>
        <div className="font-medium">{sale.customer_name}</div>
        {sale.customer_email && (
          <div className="text-sm text-muted-foreground">{sale.customer_email}</div>
        )}
      </div>
    )
  },
  {
    header: "Amount",
    accessorKey: "total_amount",
    cell: (sale: Sale) => (
      <div className="font-medium">
        ₹{Number(sale.total_amount).toFixed(2)}
      </div>
    ),
    className: "text-right"
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: (sale: Sale) => {
      const status = sale.status.toLowerCase() as keyof typeof statusStyles;
      const style = statusStyles[status] || statusStyles.pending;
      const StatusIcon = style.icon;
      
      return (
        <Badge variant="outline" className={cn("capitalize", style.color)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {sale.status}
        </Badge>
      );
    }
  },
  {
    header: "Date",
    accessorKey: "created_at",
    cell: (sale: Sale) => (
      <div className="text-sm">
        {new Date(sale.created_at).toLocaleDateString()}
      </div>
    )
  },
  {
    header: "",
    accessorKey: "id",
    cell: (sale: Sale) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(sale)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(sale.id)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    className: "text-right"
  }
];
