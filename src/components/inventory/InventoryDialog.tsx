
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { InventoryItem } from '@/types/inventory';
import { useSettings } from '@/hooks/useSettings';

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onSaved: () => void;
}

const inventoryFormSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  brand: z.string().min(1, 'Brand is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  stock_level: z.number().min(0, 'Stock level must be 0 or more'),
  stock_status: z.string(),
  price: z.number().min(0, 'Price must be 0 or more'),
  cost_price: z.number().min(0, 'Cost price must be 0 or more'),
  description: z.string().optional(),
  image_url: z.string().optional().or(z.literal('')),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

export function InventoryDialog({ open, onOpenChange, item, onSaved }: InventoryDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localOpen, setLocalOpen] = useState(false);
  const { currencySymbol } = useSettings();
  
  useEffect(() => {
    // Control local state based on props
    setLocalOpen(open);
  }, [open]);

  // Initialize form with default values
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: '',
      brand: '',
      sku: '',
      category: '',
      stock_level: 0,
      stock_status: 'in_stock',
      price: 0,
      cost_price: 0,
      description: '',
      image_url: '',
    }
  });

  // Update form when item changes or dialog opens
  useEffect(() => {
    if (open && item) {
      // Populate the form with item data
      form.reset({
        name: item.name || '',
        brand: item.brand || '',
        sku: item.sku || '',
        category: item.category || '',
        stock_level: item.stock_level || 0,
        stock_status: item.stock_status || 'in_stock',
        price: item.price || 0,
        cost_price: item.cost_price || 0,
        description: item.description || '',
        image_url: item.image_url || '',
      });
    } else if (open) {
      // Reset form to default values when creating a new item
      form.reset({
        name: '',
        brand: '',
        sku: '',
        category: '',
        stock_level: 0,
        stock_status: 'in_stock',
        price: 0,
        cost_price: 0,
        description: '',
        image_url: '',
      });
    }
  }, [form, item, open]);

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
      setLocalOpen(false);
      onOpenChange(false);
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

  const handleCancel = () => {
    // Safe cancel handler
    form.reset();
    setLocalOpen(false);
    onOpenChange(false);
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  return (
    <Dialog 
      open={localOpen} 
      onOpenChange={(newOpen) => {
        if (!newOpen && !isSubmitting) {
          handleCancel();
        } else {
          setLocalOpen(newOpen);
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent className="max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="luxury_watches">Luxury Watches</SelectItem>
                        <SelectItem value="dive_watches">Dive Watches</SelectItem>
                        <SelectItem value="chronographs">Chronographs</SelectItem>
                        <SelectItem value="dress_watches">Dress Watches</SelectItem>
                        <SelectItem value="pilot_watches">Pilot Watches</SelectItem>
                        <SelectItem value="smart_watches">Smart Watches</SelectItem>
                        <SelectItem value="sports_watches">Sports Watches</SelectItem>
                        <SelectItem value="vintage_watches">Vintage Watches</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Level *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="stock_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in_stock">In Stock</SelectItem>
                        <SelectItem value="low_stock">Low Stock</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price ({currencySymbol}) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MRP/Selling Price ({currencySymbol}) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description (optional)" 
                      className="min-h-24" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancel();
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
      </DialogContent>
    </Dialog>
  );
}
