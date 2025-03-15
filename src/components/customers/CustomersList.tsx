
import React from 'react';
import { PlusCircle, UserPlus, Edit, Trash2, MoreHorizontal, Eye } from 'lucide-react';
import { DataTable, Column } from '@/components/ui-custom/DataTable';
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
import { Customer } from '@/components/customers/useCustomerManagement';

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

  const columns: Column<Customer>[] = [
    {
      header: 'Customer',
      cell: ({ row }: { row: { original: Customer } }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={row.original.avatarUrl} alt={row.original.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {row.original.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
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
      cell: ({ row }: { row: { original: Customer } }) => (
        <Badge 
          variant={row.original.type === 'VIP' ? 'default' : 'outline'}
          className={row.original.type === 'VIP' ? 'bg-brand-500' : ''}
        >
          {row.original.type}
        </Badge>
      ),
    },
    {
      header: 'Total Spent',
      cell: ({ row }: { row: { original: Customer } }) => (
        <div className="font-medium">₹{row.original.totalSpent.toLocaleString()}</div>
      ),
    },
    {
      header: 'Last Purchase',
      cell: ({ row }: { row: { original: Customer } }) => (
        <div>{new Date(row.original.lastPurchase).toLocaleDateString()}</div>
      ),
    },
    {
      header: 'Status',
      cell: ({ row }: { row: { original: Customer } }) => (
        <Badge 
          variant="outline"
          className={cn(
            row.original.status === 'Active' 
              ? 'border-green-500 text-green-600 bg-green-50'
              : 'border-gray-300 text-gray-600 bg-gray-50'
          )}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: ({ row }: { row: { original: Customer } }) => (
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
              onEditCustomer(row.original);
            }}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={(e) => {
              e.stopPropagation();
              handleDeleteCustomer(row.original.id);
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
