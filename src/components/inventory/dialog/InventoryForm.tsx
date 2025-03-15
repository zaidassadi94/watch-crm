
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { BasicInfoFields } from './BasicInfoFields';
import { StockFields } from './StockFields';
import { PriceFields } from './PriceFields';
import { AdditionalFields } from './AdditionalFields';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { InventoryItem } from '@/types/inventory';
import { inventoryFormSchema, InventoryFormValues } from './InventoryFormSchema';

interface InventoryFormProps {
  item: InventoryItem | null;
  onSaved: () => void;
  onCancel: () => void;
  currencySymbol: string;
}

export function InventoryForm({ item, onSaved, onCancel, currencySymbol }: InventoryFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Initialize form with default values
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: item?.name || '',
      brand: item?.brand || '',
      sku: item?.sku || '',
      category: item?.category || '',
      stock_level: item?.stock_level || 0,
      stock_status: item?.stock_status || 'in_stock',
      price: item?.price || 0,
      cost_price: item?.cost_price || 0,
      description: item?.description || '',
      image_url: item?.image_url || '',
    }
  });

  const onSubmit = async (data: InventoryFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);

      // Determine stock status based on level if not set manually
      const stock_status = data.stock_status || 
        (data.stock_level > 5 ? 'in_stock' : data.stock_level > 0 ? 'low_stock' : 'out_of_stock');

      if (item) {
        // Update existing item
        const { error } = await supabase
          .from('inventory')
          .update({
            name: data.name,
            brand: data.brand,
            sku: data.sku,
            category: data.category,
            stock_level: data.stock_level,
            stock_status: stock_status,
            price: data.price,
            cost_price: data.cost_price,
            description: data.description || null,
            image_url: data.image_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        if (error) throw error;

        toast({
          title: "Inventory updated",
          description: "Product has been updated successfully",
        });
      } else {
        // Create new inventory item
        const { error } = await supabase
          .from('inventory')
          .insert({
            user_id: user.id,
            name: data.name,
            brand: data.brand,
            sku: data.sku,
            category: data.category,
            stock_level: data.stock_level,
            stock_status: stock_status,
            price: data.price,
            cost_price: data.cost_price,
            description: data.description || null,
            image_url: data.image_url || null,
          });

        if (error) throw error;

        toast({
          title: "Product added",
          description: "New product has been added to inventory",
        });
      }

      // Close dialog and refresh inventory list
      onSaved();
    } catch (error: any) {
      toast({
        title: item ? "Error updating product" : "Error adding product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoFields form={form} />
        <StockFields form={form} />
        <PriceFields form={form} currencySymbol={currencySymbol} />
        <AdditionalFields form={form} />
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            onClick={(e) => e.stopPropagation()}
          >
            {isSubmitting ? 'Saving...' : item ? 'Update Product' : 'Add Product'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
