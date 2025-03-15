
import { 
  PlusCircle, Clock,
  CheckCircle, XCircle, AlertTriangle,
  MoreHorizontal, Edit, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Column } from '@/components/ui-custom/DataTable';
import { ServiceRequest } from '@/types/services';

const statusIcons = {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
};

interface ServiceTableColumnsProps {
  onEdit: (service: ServiceRequest) => void;
  onDelete: (id: string) => void;
}

export function getServiceTableColumns({ onEdit, onDelete }: ServiceTableColumnsProps): Column<ServiceRequest>[] {
  return [
    {
      header: "Customer / Watch",
      accessorKey: "customer_name",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <div>
          <div className="font-medium">{row.original.customer_name}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.watch_brand} {row.original.watch_model && `- ${row.original.watch_model}`}
          </div>
        </div>
      )
    },
    {
      header: "Service Type",
      accessorKey: "service_type",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <div className="capitalize">{row.original.service_type}</div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: { row: { original: ServiceRequest } }) => {
        const status = row.original.status.toLowerCase() as keyof typeof statusStyles;
        const style = statusStyles[status] || statusStyles.pending;
        const StatusIcon = statusIcons[style.icon as keyof typeof statusIcons];
        
        return (
          <Badge variant="outline" className={cn("capitalize", style.color)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {row.original.status}
          </Badge>
        );
      }
    },
    {
      header: "Est. Completion",
      accessorKey: "estimated_completion",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <div className="text-sm">
          {row.original.estimated_completion 
            ? new Date(row.original.estimated_completion).toLocaleDateString() 
            : "Not specified"}
        </div>
      )
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <div className="font-medium">
          {row.original.price ? `$${Number(row.original.price).toFixed(2)}` : "TBD"}
        </div>
      ),
      className: "text-right"
    },
    {
      header: "",
      accessorKey: "id",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(row.original.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "text-right"
    }
  ];
}

const statusStyles = {
  pending: { 
    color: "text-amber-700 bg-amber-100", 
    icon: "Clock" 
  },
  "in progress": { 
    color: "text-blue-700 bg-blue-100", 
    icon: "AlertTriangle" 
  },
  "ready for pickup": { 
    color: "text-purple-700 bg-purple-100", 
    icon: "CheckCircle" 
  },
  completed: { 
    color: "text-green-700 bg-green-100", 
    icon: "CheckCircle" 
  },
  cancelled: { 
    color: "text-red-700 bg-red-100", 
    icon: "XCircle" 
  }
};
