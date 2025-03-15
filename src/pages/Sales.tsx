
import { useState, useEffect } from 'react';
import { 
  PlusCircle, Search, Filter, Download, 
  MoreHorizontal, Eye, Edit, Trash2, 
  DollarSign, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui-custom/DataTable';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SaleDialog } from '@/components/sales/SaleDialog';

// Type definitions
export interface Sale {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  total_amount: number;
  status: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

const statusStyles = {
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

const Sales = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    fetchSales();
    // Add short delay for animation
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, [user]);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSales(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching sales",
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
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sale deleted",
        description: "The sale has been successfully deleted",
      });
      
      // Refresh sales list
      fetchSales();
    } catch (error: any) {
      toast({
        title: "Error deleting sale",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDialogOpen(true);
  };

  const handleCreateSale = () => {
    setSelectedSale(null);
    setIsDialogOpen(true);
  };

  const columns = [
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
          ${Number(sale.total_amount).toFixed(2)}
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
            <DropdownMenuItem onClick={() => handleEditSale(sale)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(sale.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "text-right"
    }
  ];

  const filteredSales = sales.filter(sale => 
    sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.customer_email && sale.customer_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div 
      className={cn(
        "space-y-6 transition-all duration-300",
        isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
      )}
    >
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Sales</h1>
          <p className="text-muted-foreground">
            Manage sales, quotes, and invoices
          </p>
        </div>
        <Button className="w-full md:w-auto gap-2" onClick={handleCreateSale}>
          <PlusCircle className="h-4 w-4" /> New Sale
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sales..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredSales}
        isLoading={isLoading}
        emptyState={
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <DollarSign className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No sales found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any sales yet.
            </p>
            <Button size="sm" onClick={handleCreateSale}>
              <PlusCircle className="h-4 w-4 mr-2" /> New Sale
            </Button>
          </div>
        }
      />

      <SaleDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        sale={selectedSale}
        onSaved={fetchSales}
      />
    </div>
  );
};

export default Sales;
