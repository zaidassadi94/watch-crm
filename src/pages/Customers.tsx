
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

// Customer form schema
const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  type: z.enum(["Regular", "VIP"]),
  status: z.enum(["Active", "Inactive"]),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

const Customers = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      type: 'Regular',
      status: 'Active',
    }
  });

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  // Update form when selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      form.reset({
        name: selectedCustomer.name,
        email: selectedCustomer.email,
        phone: selectedCustomer.phone,
        type: selectedCustomer.type as 'Regular' | 'VIP',
        status: selectedCustomer.status as 'Active' | 'Inactive',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        type: 'Regular',
        status: 'Active',
      });
    }
  }, [selectedCustomer, form]);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data: CustomerFormValues) => {
    // In a real app, this would save to a database
    toast({
      title: selectedCustomer ? "Customer Updated" : "Customer Added",
      description: `${data.name} has been ${selectedCustomer ? 'updated' : 'added'} successfully.`,
    });
    
    setIsSheetOpen(false);
    setSelectedCustomer(null);
    form.reset();
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsSheetOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsSheetOpen(true);
  };

  const handleDeleteCustomer = (id: number) => {
    // In a real app, this would delete from a database
    toast({
      title: "Customer Deleted",
      description: "Customer has been deleted successfully.",
    });
  };

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
            <DropdownMenuItem className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              handleEditCustomer(customer);
            }}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={(e) => {
              e.stopPropagation();
              handleDeleteCustomer(customer.id);
            }}>
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
        <Button className="w-full md:w-auto gap-2" onClick={handleAddCustomer}>
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
                  <Button size="sm" className="gap-1" onClick={handleAddCustomer}>
                    <PlusCircle className="h-4 w-4" /> Add Customer
                  </Button>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Customer Add/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <SheetHeader>
            <SheetTitle>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</SheetTitle>
          </SheetHeader>
          
          <div className="py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Type</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Regular">Regular</SelectItem>
                            <SelectItem value="VIP">VIP</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsSheetOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedCustomer ? 'Update Customer' : 'Add Customer'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Customers;
