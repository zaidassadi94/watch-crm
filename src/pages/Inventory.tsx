
import { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Package2, 
  MoreHorizontal, Eye, Edit, Trash2,
  PlusCircle, AlertTriangle
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

// Sample data
const inventory = [
  {
    id: 1,
    name: 'Chronograph Watch XS-200',
    brand: 'Luxetime',
    sku: 'LUX-CHR-001',
    category: 'Chronograph',
    stockLevel: 24,
    stockStatus: 'In Stock',
    price: 1250,
    dateAdded: '2023-10-05',
    imageUrl: '',
  },
  {
    id: 2,
    name: 'Diver Pro 300M',
    brand: 'AquaTime',
    sku: 'AQT-DIV-005',
    category: 'Diver',
    stockLevel: 8,
    stockStatus: 'Low Stock',
    price: 2750,
    dateAdded: '2023-09-20',
    imageUrl: '',
  },
  {
    id: 3,
    name: 'Classic Automatic',
    brand: 'Heritage',
    sku: 'HER-CLA-012',
    category: 'Dress',
    stockLevel: 0,
    stockStatus: 'Out of Stock',
    price: 3850,
    dateAdded: '2023-08-15',
    imageUrl: '',
  },
  {
    id: 4,
    name: 'Sport Digital G-100',
    brand: 'ActiveTime',
    sku: 'ACT-DIG-023',
    category: 'Sport',
    stockLevel: 35,
    stockStatus: 'In Stock',
    price: 450,
    dateAdded: '2023-11-01',
    imageUrl: '',
  },
  {
    id: 5,
    name: 'Skeleton Mechanical',
    brand: 'Artisan',
    sku: 'ART-SKL-007',
    category: 'Luxury',
    stockLevel: 5,
    stockStatus: 'Low Stock',
    price: 5250,
    dateAdded: '2023-09-12',
    imageUrl: '',
  },
  {
    id: 6,
    name: 'Pilot Chronometer',
    brand: 'Skyline',
    sku: 'SKY-PLT-019',
    category: 'Pilot',
    stockLevel: 12,
    stockStatus: 'In Stock',
    price: 1850,
    dateAdded: '2023-10-18',
    imageUrl: '',
  },
  {
    id: 7,
    name: 'Tourbillon Excellence',
    brand: 'Majestic',
    sku: 'MAJ-TRB-003',
    category: 'Luxury',
    stockLevel: 2,
    stockStatus: 'Low Stock',
    price: 12500,
    dateAdded: '2023-07-30',
    imageUrl: '',
  },
  {
    id: 8,
    name: 'Field Watch Tactical',
    brand: 'Ranger',
    sku: 'RNG-FLD-031',
    category: 'Field',
    stockLevel: 18,
    stockStatus: 'In Stock',
    price: 850,
    dateAdded: '2023-10-25',
    imageUrl: '',
  },
];

const getStockStatusColor = (status: string) => {
  switch (status) {
    case 'In Stock':
      return 'border-green-500 text-green-600 bg-green-50';
    case 'Low Stock':
      return 'border-orange-500 text-orange-600 bg-orange-50';
    case 'Out of Stock':
      return 'border-red-500 text-red-600 bg-red-50';
    default:
      return 'border-gray-300 text-gray-600 bg-gray-50';
  }
};

const Inventory = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Product',
      cell: (item: typeof inventory[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-full object-cover rounded-md" 
              />
            ) : (
              <Package2 className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
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
      header: 'Price',
      cell: (item: typeof inventory[0]) => (
        <div className="font-medium">${item.price.toLocaleString()}</div>
      ),
    },
    {
      header: 'Stock',
      cell: (item: typeof inventory[0]) => (
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline"
            className={cn(getStockStatusColor(item.stockStatus))}
          >
            {item.stockStatus}
          </Badge>
          <span className="text-sm">{item.stockLevel}</span>
          {item.stockStatus === 'Low Stock' && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
        </div>
      ),
    },
    {
      header: 'Added',
      cell: (item: typeof inventory[0]) => (
        <div>{new Date(item.dateAdded).toLocaleDateString()}</div>
      ),
    },
    {
      header: 'Actions',
      cell: (item: typeof inventory[0]) => (
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
            Manage your watch inventory and stock levels
          </p>
        </div>
        <Button className="w-full md:w-auto gap-2">
          <PlusCircle className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Total Products', value: '165', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { title: 'Low Stock Items', value: '27', color: 'bg-orange-50 border-orange-200 text-orange-700' },
          { title: 'Out of Stock', value: '15', color: 'bg-red-50 border-red-200 text-red-700' },
        ].map((item, i) => (
          <Card key={i} className={cn("border", item.color)}>
            <CardContent className="p-4">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </CardContent>
          </Card>
        ))}
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
            data={filteredInventory}
            onRowClick={(item) => console.log('Clicked on item:', item.name)}
            emptyState={
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-muted/30 rounded-full p-3 mb-3">
                  <Package2 className="h-6 w-6 text-muted-foreground" />
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
