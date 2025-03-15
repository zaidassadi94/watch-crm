import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Form } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Undo2 } from 'lucide-react';
import { Sale } from '@/pages/Sales';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
import { returnFormSchema, ReturnFormValues } from './saleFormSchema';

interface SaleItemWithInventory {
  id: string;
  sale_id: string;
  product_name: string;
  quantity: number;
  price: number;
  cost_price: number | null;
  subtotal: number;
  created_at: string;
  inventory_id?: string;
}

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function ReturnDialog({ open, onOpenChange, onComplete }: ReturnDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currencySymbol } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItemWithInventory[]>([]);
  
  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      sale_id: '',
      reason: '',
      items: []
    }
  });
  
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "items"
  });
  
  useEffect(() => {
    const fetchSales = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setSales(data || []);
      } catch (error) {
        console.error('Error fetching sales:', error);
        toast({
          title: 'Error fetching sales',
          description: 'Could not load completed sales',
          variant: 'destructive'
        });
      }
    };
    
    if (open) {
      fetchSales();
    }
  }, [open, user, toast]);
  
  const handleSaleChange = async (saleId: string) => {
    form.setValue('sale_id', saleId);
    
    if (!saleId) {
      setSelectedSale(null);
      setSaleItems([]);
      replace([]);
      return;
    }
    
    try {
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', saleId)
        .single();
        
      if (saleError) throw saleError;
      setSelectedSale(saleData);
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', saleId);
        
      if (itemsError) throw itemsError;
      setSaleItems(itemsData || []);
      
      const formItems = itemsData.map((item: SaleItemWithInventory) => ({
        product_name: item.product_name,
        quantity: 1,
        price: item.price,
        cost_price: item.cost_price || 0,
        inventory_id: item.inventory_id,
        max_quantity: item.quantity
      }));
      
      replace(formItems);
    } catch (error) {
      console.error('Error fetching sale details:', error);
      toast({
        title: 'Error',
        description: 'Could not load sale details',
        variant: 'destructive'
      });
    }
  };
  
  const onSubmit = async (data: ReturnFormValues) => {
    if (!user || !selectedSale) return;
    
    setIsSubmitting(true);
    
    try {
      const totalAmount = data.items.reduce(
        (sum, item) => sum + (item.quantity * item.price), 
        0
      );
      
      const { data: returnData, error: returnError } = await supabase
        .from('returns')
        .insert({
          sale_id: data.sale_id,
          user_id: user.id,
          reason: data.reason,
          total_amount: totalAmount,
          status: 'completed'
        })
        .select()
        .single();
        
      if (returnError) throw returnError;
      
      const returnItems = data.items.map(item => ({
        return_id: returnData.id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        cost_price: item.cost_price || 0,
        subtotal: item.quantity * item.price
      }));
      
      const { error: itemsError } = await supabase
        .from('return_items')
        .insert(returnItems);
        
      if (itemsError) throw itemsError;
      
      for (const item of data.items) {
        if (item.inventory_id) {
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('inventory')
            .select('stock_level, stock_status')
            .eq('id', item.inventory_id)
            .single();
            
          if (inventoryError && inventoryError.code !== 'PGRST116') {
            console.error('Error fetching inventory:', inventoryError);
            continue;
          }
          
          if (inventoryData) {
            const newStockLevel = inventoryData.stock_level + item.quantity;
            let newStockStatus = inventoryData.stock_status;
            
            if (newStockLevel > 0 && inventoryData.stock_status === 'out_of_stock') {
              newStockStatus = newStockLevel <= 5 ? 'low_stock' : 'in_stock';
            } else if (newStockLevel > 5 && inventoryData.stock_status === 'low_stock') {
              newStockStatus = 'in_stock';
            }
            
            await supabase
              .from('inventory')
              .update({
                stock_level: newStockLevel,
                stock_status: newStockStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', item.inventory_id);
              
            console.log(`Updated inventory for ${item.product_name}: new stock level = ${newStockLevel}`);
          }
        }
      }
      
      toast({
        title: 'Return processed',
        description: 'Return has been successfully processed',
      });
      
      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error processing return:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process return',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!isSubmitting) {
        onOpenChange(value);
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Return</DialogTitle>
          <DialogDescription>
            Select a sale and items to return
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="sale">Select Sale</Label>
                <Select 
                  onValueChange={handleSaleChange} 
                  value={form.watch('sale_id')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sale" />
                  </SelectTrigger>
                  <SelectContent>
                    {sales.map(sale => (
                      <SelectItem key={sale.id} value={sale.id}>
                        {sale.customer_name} - {currencySymbol}{sale.total_amount.toFixed(2)} - {new Date(sale.created_at).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSale && (
                <>
                  <div>
                    <Label htmlFor="reason">Reason for Return</Label>
                    <Textarea 
                      id="reason"
                      placeholder="Enter reason for return"
                      className="resize-none"
                      {...form.register('reason')}
                    />
                  </div>
                  
                  <div>
                    <Label>Return Items</Label>
                    <div className="space-y-2 mt-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6">
                            <p className="text-sm font-medium">{field.product_name}</p>
                          </div>
                          
                          <div className="col-span-3">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={form.watch(`items.${index}.max_quantity`) || 1}
                                      {...field}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        const max = form.watch(`items.${index}.max_quantity`) || 1;
                                        field.onChange(Math.min(Math.max(1, val), max));
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="col-span-3 text-right">
                            <p className="text-sm">
                              {currencySymbol}{(form.watch(`items.${index}.price`) * form.watch(`items.${index}.quantity`)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end text-lg font-bold">
                    Total: {currencySymbol}
                    {form.watch('items').reduce(
                      (sum, item) => sum + (item.price * item.quantity), 
                      0
                    ).toFixed(2)}
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedSale || fields.length === 0}
              >
                <Undo2 className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Processing...' : 'Process Return'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
