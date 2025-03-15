
import { 
  Package, AlertTriangle, 
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
import { InventoryItem } from '@/types/inventory';

interface InventoryTableColumnsProps {
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  currencySymbol: string;
}

export function getInventoryTableColumns({ 
  onEdit, 
  onDelete,
  currencySymbol
}: InventoryTableColumnsProps): Column<InventoryItem>[] {
  return [
    {
      header: 'Product',
      cell: ({ row }: { row: { original: InventoryItem } }) => (
        <div className="flex items-center gap-3">
          {row.original.image_url ? (
            <img 
              src={row.original.image_url} 
              alt={row.original.name} 
              className="w-10 h-10 object-cover rounded border border-border"
            />
          ) : (
            <div className="w-10 h-10 bg-muted rounded border border-border flex items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.brand}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'SKU',
      accessorKey: 'sku' as keyof InventoryItem,
    },
    {
      header: 'Category',
      cell: ({ row }: { row: { original: InventoryItem } }) => (
        <div>{formatCategory(row.original.category)}</div>
      ),
    },
    {
      header: 'Stock',
      cell: ({ row }: { row: { original: InventoryItem } }) => (
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline"
            className={cn(
              "rounded-full flex gap-1 items-center",
              getStockStatusColor(row.original.stock_status)
            )}
          >
            {row.original.stock_status === 'low_stock' && <AlertTriangle className="h-3 w-3" />}
            {getStockStatusText(row.original.stock_status)}
          </Badge>
          <span className="text-xs text-muted-foreground">{row.original.stock_level} units</span>
        </div>
      ),
    },
    {
      header: 'Cost Price',
      cell: ({ row }: { row: { original: InventoryItem } }) => (
        <div className="font-medium text-muted-foreground">{currencySymbol}{row.original.cost_price?.toLocaleString() || '0'}</div>
      ),
    },
    {
      header: 'MRP',
      cell: ({ row }: { row: { original: InventoryItem } }) => (
        <div className="font-medium">{currencySymbol}{row.original.price.toLocaleString()}</div>
      ),
    },
    {
      header: 'Margin',
      cell: ({ row }: { row: { original: InventoryItem } }) => {
        const margin = calculateProfitMargin(row.original.cost_price || 0, row.original.price);
        return (
          <div className={cn(
            "font-medium",
            margin > 30 ? "text-green-600" : 
            margin > 15 ? "text-amber-600" : 
            "text-red-600"
          )}>
            {margin.toFixed(2)}%
          </div>
        );
      },
    },
    {
      header: 'Actions',
      cell: ({ row }: { row: { original: InventoryItem } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(row.original.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

// Utility functions
const formatCategory = (category: string) => {
  return category.replace(/_/g, ' ').split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const getStockStatusColor = (status: string) => {
  switch (status) {
    case 'in_stock': return 'border-green-500 text-green-600 bg-green-50';
    case 'low_stock': return 'border-amber-500 text-amber-600 bg-amber-50';
    case 'out_of_stock': return 'border-red-500 text-red-600 bg-red-50';
    default: return '';
  }
};

const getStockStatusText = (status: string) => {
  switch (status) {
    case 'in_stock': return 'In Stock';
    case 'low_stock': return 'Low Stock';
    case 'out_of_stock': return 'Out of Stock';
    default: return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  }
};

const calculateProfitMargin = (costPrice: number, sellingPrice: number) => {
  if (costPrice === 0 || sellingPrice === 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
};
