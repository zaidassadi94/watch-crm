
import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui-custom/DataTable';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SaleDialog } from '@/components/sales/SaleDialog';
import { SaleActions } from '@/components/sales/SaleActions';
import { SaleSearch } from '@/components/sales/SaleSearch';
import { SaleEmptyState } from '@/components/sales/SaleEmptyState';
import { getSaleTableColumns } from '@/components/sales/SaleTableColumns';

// Type definitions
export interface Sale {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  total_amount: number;
  total_profit: number;
  status: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

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
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure the data matches the Sale interface
      const typedSales: Sale[] = data.map(sale => ({
        id: sale.id,
        customer_name: sale.customer_name,
        customer_email: sale.customer_email,
        customer_phone: sale.customer_phone,
        total_amount: sale.total_amount,
        total_profit: sale.total_profit || 0, // Ensure we have a value even if null
        status: sale.status,
        payment_method: sale.payment_method,
        notes: sale.notes,
        created_at: sale.created_at
      }));
      
      setSales(typedSales);
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

  const columns = getSaleTableColumns({
    onEdit: handleEditSale,
    onDelete: handleDelete
  });

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
      <SaleActions 
        isLoaded={isLoaded} 
        onCreateSale={handleCreateSale} 
      />

      <SaleSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      <DataTable
        columns={columns}
        data={filteredSales}
        isLoading={isLoading}
        emptyState={<SaleEmptyState onCreateSale={handleCreateSale} />}
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
