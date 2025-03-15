import { useState, useEffect } from 'react';
import { 
  PlusCircle, Search, Filter, UserPlus, Download, 
  Trash2, Edit, MoreHorizontal, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui-custom/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: string;
  totalSpent: number;
  lastPurchase: string;
  status: string;
  avatarUrl: string;
}

const customers: Customer[] = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    type: 'VIP',
    totalSpent: 12450,
    lastPurchase: '2023-11-15',
    status: 'Active',
    avatarUrl: '',
  },
  {
    id: 2,
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    phone: '+1 (555) 234-5678',
    type: 'Regular',
    totalSpent: 8750,
    lastPurchase: '2023-11-10',
    status: 'Active',
    avatarUrl: '',
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '+1 (555) 345-6789',
    type: 'VIP',
    totalSpent: 6320,
    lastPurchase: '2023-11-05',
    status: 'Inactive',
    avatarUrl: '',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@example.com',
    phone: '+1 (555) 456-7890',
    type: 'Regular',
    totalSpent: 5890,
    lastPurchase: '2023-10-28',
    status: 'Active',
    avatarUrl: '',
  },
  {
    id: 5,
    name: 'James Wilson',
    email: 'james@example.com',
    phone: '+1 (555) 567-8901',
    type: 'Regular',
    totalSpent: 4560,
    lastPurchase: '2023-10-25',
    status: 'Active',
    avatarUrl: '',
  },
  {
    id: 6,
    name: 'Olivia Martinez',
    email: 'olivia@example.com',
    phone: '+1 (555) 678-9012',
    type: 'VIP',
    totalSpent: 9870,
    lastPurchase: '2023-10-23',
    status: 'Active',
    avatarUrl: '',
  },
  {
    id: 7,
    name: 'Daniel Anderson',
    email: 'daniel@example.com',
    phone: '+1 (555) 789-0123',
    type: 'Regular',
    totalSpent: 3540,
    lastPurchase: '2023-10-20',
    status: 'Inactive',
    avatarUrl: '',
  },
  {
    id: 8,
    name: 'Sophia Thomas',
    email: 'sophia@example.com',
    phone: '+1 (555) 890-1234',
    type: 'Regular',
    totalSpent: 2780,
    lastPurchase: '2023-10-18',
    status: 'Active',
    avatarUrl: '',
  },
];

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

const Customers = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Customer>[] = [
    {
      header: 'Customer',
      cell: (customer) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={customer.avatarUrl} alt={customer.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{customer.name}</p>
            <p className="text-xs text-muted-foreground">{customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
    },
    {
      header: 'Type',
      cell: (customer) => (
        <Badge 
          variant={customer.type === 'VIP' ? 'default' : 'outline'}
          className={customer.type === 'VIP' ? 'bg-brand-500' : ''}
        >
          {customer.type}
        </Badge>
      ),
    },
    {
      header: 'Total Spent',
      cell: (customer) => (
        <div className="font-medium">${customer.totalSpent.toLocaleString()}</div>
      ),
    },
    {
      header: 'Last Purchase',
      cell: (customer) => (
        <div>{new Date(customer.lastPurchase).toLocaleDateString()}</div>
      ),
    },
    {
      header: 'Status',
      cell: (customer) => (
        <Badge 
          variant="outline"
          className={cn(
            customer.status === 'Active' 
              ? 'border-green-500 text-green-600 bg-green-50'
              : 'border-gray-300 text-gray-600 bg-gray-50'
          )}
        >
          {customer.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (customer) => (
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
          <h1 className="text-2xl font-bold mb-1">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer profiles and track purchase history
          </p>
        </div>
        <Button className="w-full md:w-auto gap-2">
          <UserPlus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
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
            data={filteredCustomers}
            onRowClick={(customer) => console.log('Clicked on customer:', customer.name)}
            emptyState={
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-muted/30 rounded-full p-3 mb-3">
                  <UserPlus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No customers found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Get started by adding your first customer"}
                </p>
                {!searchTerm && (
                  <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" /> Add Customer
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

export default Customers;
