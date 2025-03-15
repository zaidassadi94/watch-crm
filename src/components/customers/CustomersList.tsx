
import React from 'react';
import { PlusCircle, UserPlus, Edit, Trash2, MoreHorizontal, Eye } from 'lucide-react';
import { DataTable } from '@/components/ui-custom/DataTable';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

interface Customer {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  type: 'Regular' | 'VIP';
  totalSpent: number;
  lastPurchase: string;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
}

interface CustomersListProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  searchTerm: string;
  onAddCustomer: () => void;
  isLoading: boolean;
}

export function CustomersList({ 
  customers, 
  onEditCustomer, 
  searchTerm, 
  onAddCustomer,
  isLoading 
}: CustomersListProps) {
  const { toast } = useToast();

  const handleDeleteCustomer = (id: number | string) => {
    toast({
      title: "Customer Deleted",
      description: "Customer has been deleted successfully.",
    });
  };

  const columns = [
    {
      header: 'Customer',
      cell: (customer: Customer) => (
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
      cell: (customer: Customer) => (
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
      cell: (customer: Customer) => (
        <div className="font-medium">₹{customer.totalSpent.toLocaleString()}</div>
      ),
    },
    {
      header: 'Last Purchase',
      cell: (customer: Customer) => (
        <div>{new Date(customer.lastPurchase).toLocaleDateString()}</div>
      ),
    },
    {
      header: 'Status',
      cell: (customer: Customer) => (
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
      cell: (customer: Customer) => (
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
              onEditCustomer(customer);
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
    <DataTable 
      columns={columns} 
      data={customers}
      onRowClick={(customer) => console.log('Clicked on customer:', customer.name)}
      isLoading={isLoading}
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
            <Button size="sm" className="gap-1" onClick={onAddCustomer}>
              <PlusCircle className="h-4 w-4" /> Add Customer
            </Button>
          )}
        </div>
      }
    />
  );
}
