
import { useState, useEffect } from 'react';
import { 
  PlusCircle, Search, Filter, Package, Download, 
  Trash2, Edit, MoreHorizontal, Eye, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, Column } from '@/components/ui-custom/DataTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { InventoryDialog } from '@/components/inventory/InventoryDialog';
import { InventoryItem } from '@/types/inventory';
import { useSettings } from '@/hooks/useSettings';

const Inventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { currencySymbol } = useSettings();

  useEffect(() => {
    fetchInventory();
    // Add short delay for animation
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, [user]);

  const fetchInventory = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Add type assertion to help TypeScript understand the data type
      setInventory(data as InventoryItem[]);
    } catch (error: any) {
      toast({
        title: "Error fetching inventory",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted",
      });
      
      // Refresh inventory list
      fetchInventory();
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleCreateItem = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const columns: Column<InventoryItem>[] = [
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
            <DropdownMenuItem onClick={() => handleEditItem(row.original)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDelete(row.original.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div 
      className={cn(
        "space-y-6 transition-all duration-300",
        isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
      )}
    >
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Inventory</h1>
          <p className="text-muted-foreground">
            Manage watch inventory and stock levels
          </p>
        </div>
        <Button className="w-full md:w-auto gap-2" onClick={handleCreateItem}>
          <PlusCircle className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search inventory..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-10 gap-1">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="h-10 gap-1">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>

          <DataTable 
            columns={columns} 
            data={filteredItems}
            isLoading={isLoading}
            emptyState={
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-muted/30 rounded-full p-3 mb-3">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No products found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Get started by adding your first product"}
                </p>
                {!searchTerm && (
                  <Button size="sm" className="gap-1" onClick={handleCreateItem}>
                    <PlusCircle className="h-4 w-4" /> Add Product
                  </Button>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>

      <InventoryDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        item={selectedItem}
        onSaved={fetchInventory}
      />
    </div>
  );
};

export default Inventory;
