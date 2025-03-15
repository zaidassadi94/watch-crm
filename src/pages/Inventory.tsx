import { useState, useEffect } from 'react';
import { 
  PlusCircle, Search, Filter, Package, Download, 
  Trash2, Edit, MoreHorizontal, Eye, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui-custom/DataTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Define proper type for inventory items
interface InventoryItem {
  id: number;
  name: string;
  brand: string;
  sku: string;
  category: string;
  stockLevel: number;
  stockStatus: string;
  price: number;
  dateAdded: string;
  imageUrl: string;
}

// Sample data
const inventoryItems: InventoryItem[] = [
  {
    id: 1,
    name: 'Submariner Date',
    brand: 'Rolex',
    sku: 'ROL-SUB-001',
    category: 'Dive Watches',
    stockLevel: 5,
    stockStatus: 'In Stock',
    price: 9500,
    dateAdded: '2023-10-15',
    imageUrl: '',
  },
  {
    id: 2,
    name: 'Speedmaster Moonwatch',
    brand: 'Omega',
    sku: 'OME-SPE-002',
    category: 'Chronographs',
    stockLevel: 2,
    stockStatus: 'Low Stock',
    price: 7200,
    dateAdded: '2023-09-20',
    imageUrl: '',
  },
  {
    id: 3,
    name: 'Navitimer Automatic',
    brand: 'Breitling',
    sku: 'BRE-NAV-003',
    category: 'Pilot Watches',
    stockLevel: 0,
    stockStatus: 'Out of Stock',
    price: 8600,
    dateAdded: '2023-08-01',
    imageUrl: '',
  },
  {
    id: 4,
    name: 'Royal Oak',
    brand: 'Audemars Piguet',
    sku: 'AUD-ROA-004',
    category: 'Luxury Sports',
    stockLevel: 3,
    stockStatus: 'In Stock',
    price: 24500,
    dateAdded: '2023-07-18',
    imageUrl: '',
  },
  {
    id: 5,
    name: 'Pasha de Cartier',
    brand: 'Cartier',
    sku: 'CAR-PAS-005',
    category: 'Dress Watches',
    stockLevel: 1,
    stockStatus: 'Low Stock',
    price: 6800,
    dateAdded: '2023-06-05',
    imageUrl: '',
  },
  {
    id: 6,
    name: 'Big Pilot\'s Watch',
    brand: 'IWC Schaffhausen',
    sku: 'IWC-BIG-006',
    category: 'Pilot Watches',
    stockLevel: 4,
    stockStatus: 'In Stock',
    price: 12300,
    dateAdded: '2023-05-22',
    imageUrl: '',
  },
  {
    id: 7,
    name: 'Luminor Marina',
    brand: 'Panerai',
    sku: 'PAN-LUM-007',
    category: 'Dive Watches',
    stockLevel: 0,
    stockStatus: 'Out of Stock',
    price: 7900,
    dateAdded: '2023-04-10',
    imageUrl: '',
  },
  {
    id: 8,
    name: 'Oyster Perpetual',
    brand: 'Rolex',
    sku: 'ROL-OYS-008',
    category: 'Everyday Watches',
    stockLevel: 6,
    stockStatus: 'In Stock',
    price: 5900,
    dateAdded: '2023-03-28',
    imageUrl: '',
  },
];

// Define column type
interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

const Inventory = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<InventoryItem>[] = [
    {
      header: 'Product',
      cell: (item) => (
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-10 h-10 object-cover rounded border border-border"
            />
          ) : (
            <div className="w-10 h-10 bg-muted rounded border border-border flex items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.brand}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'SKU',
      accessorKey: 'sku',
    },
    {
      header: 'Category',
      accessorKey: 'category',
    },
    {
      header: 'Stock',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline"
            className={cn(
              "rounded-full flex gap-1 items-center",
              item.stockStatus === 'In Stock' 
                ? 'border-green-500 text-green-600 bg-green-50'
                : item.stockStatus === 'Low Stock'
                ? 'border-amber-500 text-amber-600 bg-amber-50'
                : 'border-red-500 text-red-600 bg-red-50'
            )}
          >
            {item.stockStatus === 'Low Stock' && <AlertTriangle className="h-3 w-3" />}
            {item.stockStatus}
          </Badge>
          <span className="text-xs text-muted-foreground">{item.stockLevel} units</span>
        </div>
      ),
    },
    {
      header: 'Price',
      cell: (item) => (
        <div className="font-medium">${item.price.toLocaleString()}</div>
      ),
    },
    {
      header: 'Date Added',
      cell: (item) => (
        <div>{new Date(item.dateAdded).toLocaleDateString()}</div>
      ),
    },
    {
      header: 'Actions',
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
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
        <Button className="w-full md:w-auto gap-2">
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
            onRowClick={(item) => console.log('Clicked on item:', item.name)}
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
                  <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" /> Add Product
                  </Button>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
