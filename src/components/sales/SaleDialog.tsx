
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, PlusCircle, Trash2, Search } from 'lucide-react';
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
import { Sale } from '@/pages/Sales';
import { useAuth } from '@/hooks/useAuth';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onSaved: () => void;
}

interface ProductSuggestion {
  id: string;
  name: string;
  brand: string;
  sku: string;
  price: number;
  stock_level: number;
}

interface CustomerSuggestion {
  name: string;
  email: string | null;
  phone: string | null;
}

const saleFormSchema = z.object({
  customer_name: z.string().min(2, 'Customer name is required'),
  customer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  customer_phone: z.string().optional(),
  status: z.string(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_name: z.string().min(1, 'Product name is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0, 'Price must be 0 or higher'),
  })).min(1, 'At least one item is required'),
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

// Define a type for items that ensures quantity and price are non-optional
interface SaleItem {
  product_name: string;
  quantity: number;
  price: number;
}

export function SaleDialog({ open, onOpenChange, sale, onSaved }: SaleDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<ProductSuggestion[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState<number | null>(null);
  const [productSearchTerms, setProductSearchTerms] = useState<string[]>([]);
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");

  // Initialize form with default values or sale data if editing
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      status: 'pending',
      payment_method: '',
      notes: '',
      items: [
        { product_name: '', quantity: 1, price: 0 }
      ],
    }
  });

  // Setup field array for items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Update form when sale changes
  useEffect(() => {
    if (sale) {
      const fetchSaleItems = async () => {
        try {
          const { data, error } = await supabase
            .from('sale_items')
            .select('*')
            .eq('sale_id', sale.id);

          if (error) throw error;

          form.reset({
            customer_name: sale.customer_name,
            customer_email: sale.customer_email || '',
            customer_phone: sale.customer_phone || '',
            status: sale.status,
            payment_method: sale.payment_method || '',
            notes: sale.notes || '',
            items: data?.map(item => ({
              product_name: item.product_name,
              quantity: item.quantity,
              price: Number(item.price),
            })) || []
          });

          // Initialize product search terms array
          setProductSearchTerms(data?.map(() => "") || []);
        } catch (error: any) {
          toast({
            title: "Error loading sale details",
            description: error.message,
            variant: "destructive",
          });
        }
      };

      fetchSaleItems();
    } else {
      form.reset({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        status: 'pending',
        payment_method: '',
        notes: '',
        items: [
          { product_name: '', quantity: 1, price: 0 }
        ],
      });
      setProductSearchTerms(['']);
    }
  }, [sale, form]);

  // Load product suggestions when search term changes
  useEffect(() => {
    const index = showProductSuggestions;
    if (index === null || !productSearchTerms[index] || productSearchTerms[index].length < 2) {
      setProductSuggestions([]);
      return;
    }
    
    const loadProductSuggestions = async () => {
      if (!user) return;
      
      try {
        const searchTerm = productSearchTerms[index];
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('user_id', user.id)
          .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        setProductSuggestions(data || []);
      } catch (error) {
        console.error("Error fetching product suggestions:", error);
      }
    };
    
    loadProductSuggestions();
  }, [showProductSuggestions, productSearchTerms, user]);

  // Load customer suggestions when search term changes
  useEffect(() => {
    if (customerSearchTerm.length < 2) {
      setCustomerSuggestions([]);
      return;
    }
    
    const loadCustomerSuggestions = async () => {
      if (!user) return;
      
      try {
        // Search in sales for existing customers
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('customer_name, customer_email, customer_phone')
          .eq('user_id', user.id)
          .or(`customer_name.ilike.%${customerSearchTerm}%,customer_phone.ilike.%${customerSearchTerm}%,customer_email.ilike.%${customerSearchTerm}%`)
          .order('created_at', { ascending: false });
          
        if (salesError) throw salesError;
        
        // Also search in service requests
        const { data: serviceData, error: serviceError } = await supabase
          .from('service_requests')
          .select('customer_name, customer_email, customer_phone')
          .eq('user_id', user.id)
          .or(`customer_name.ilike.%${customerSearchTerm}%,customer_phone.ilike.%${customerSearchTerm}%,customer_email.ilike.%${customerSearchTerm}%`)
          .order('created_at', { ascending: false });
          
        if (serviceError) throw serviceError;
        
        // Combine and deduplicate
        const combinedData = [...(salesData || []), ...(serviceData || [])];
        const uniqueCustomers: CustomerSuggestion[] = [];
        
        combinedData.forEach(item => {
          const exists = uniqueCustomers.some(c => 
            c.name === item.customer_name && 
            c.email === item.customer_email && 
            c.phone === item.customer_phone
          );
          
          if (!exists) {
            uniqueCustomers.push({
              name: item.customer_name,
              email: item.customer_email,
              phone: item.customer_phone
            });
          }
        });
        
        setCustomerSuggestions(uniqueCustomers);
        setShowCustomerSuggestions(uniqueCustomers.length > 0);
      } catch (error) {
        console.error("Error fetching customer suggestions:", error);
      }
    };
    
    loadCustomerSuggestions();
  }, [customerSearchTerm, user]);

  const selectProduct = (product: ProductSuggestion, index: number) => {
    form.setValue(`items.${index}.product_name`, `${product.brand} ${product.name} (${product.sku})`);
    form.setValue(`items.${index}.price`, product.price);
    setShowProductSuggestions(null);
  };

  const selectCustomer = (customer: CustomerSuggestion) => {
    form.setValue('customer_name', customer.name);
    if (customer.email) form.setValue('customer_email', customer.email);
    if (customer.phone) form.setValue('customer_phone', customer.phone);
    setShowCustomerSuggestions(false);
  };

  const handleProductSearch = (value: string, index: number) => {
    const newSearchTerms = [...productSearchTerms];
    newSearchTerms[index] = value;
    setProductSearchTerms(newSearchTerms);
  };

  const calculateTotal = (items: SaleItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const onSubmit = async (data: SaleFormValues) => {
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
      const totalAmount = calculateTotal(data.items);

      if (sale) {
        // Update existing sale
        const { error } = await supabase
          .from('sales')
          .update({
            customer_name: data.customer_name,
            customer_email: data.customer_email || null,
            customer_phone: data.customer_phone || null,
            total_amount: totalAmount,
            status: data.status,
            payment_method: data.payment_method || null,
            notes: data.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sale.id);

        if (error) throw error;

        // Delete all existing items and insert new ones
        const { error: deleteError } = await supabase
          .from('sale_items')
          .delete()
          .eq('sale_id', sale.id);

        if (deleteError) throw deleteError;

        // Insert updated items
        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(
            data.items.map(item => ({
              sale_id: sale.id,
              product_name: item.product_name,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.quantity * item.price,
            }))
          );

        if (itemsError) throw itemsError;

        toast({
          title: "Sale updated",
          description: "Sale details have been updated successfully",
        });
      } else {
        // Create new sale
        const { data: newSale, error } = await supabase
          .from('sales')
          .insert({
            user_id: user.id,
            customer_name: data.customer_name,
            customer_email: data.customer_email || null,
            customer_phone: data.customer_phone || null,
            total_amount: totalAmount,
            status: data.status,
            payment_method: data.payment_method || null,
            notes: data.notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Insert sale items
        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(
            data.items.map(item => ({
              sale_id: newSale.id,
              product_name: item.product_name,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.quantity * item.price,
            }))
          );

        if (itemsError) throw itemsError;

        toast({
          title: "Sale created",
          description: "New sale has been created successfully",
        });
      }

      // Close dialog and refresh sales list
      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      toast({
        title: sale ? "Error updating sale" : "Error creating sale",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate the current total
  const total = calculateTotal(form.watch('items') as SaleItem[]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{sale ? 'Edit Sale' : 'Create New Sale'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter customer name" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          setCustomerSearchTerm(e.target.value);
                        }}
                      />
                    </FormControl>
                    {showCustomerSuggestions && customerSuggestions.length > 0 && (
                      <div className="absolute z-50 bg-popover border rounded-md w-full mt-1 shadow-md">
                        <div className="max-h-60 overflow-auto py-1">
                          {customerSuggestions.map((customer, idx) => (
                            <div
                              key={idx}
                              className="px-2 py-1.5 hover:bg-accent cursor-pointer"
                              onClick={() => selectCustomer(customer)}
                            >
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {customer.phone} {customer.email ? `• ${customer.email}` : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customer_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="customer@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Items *</h3>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2 relative">
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Product
                          </FormLabel>
                          <Popover
                            open={showProductSuggestions === index}
                            onOpenChange={(open) => setShowProductSuggestions(open ? index : null)}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder="Product name or SKU" 
                                    {...field} 
                                    onChange={(e) => {
                                      field.onChange(e);
                                      handleProductSearch(e.target.value, index);
                                    }}
                                  />
                                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="start">
                              {productSuggestions.length > 0 ? (
                                <div className="max-h-60 overflow-auto">
                                  {productSuggestions.map((product) => (
                                    <div
                                      key={product.id}
                                      className="flex flex-col px-2 py-1.5 hover:bg-accent cursor-pointer"
                                      onClick={() => selectProduct(product, index)}
                                    >
                                      <div className="font-medium">{product.brand} {product.name}</div>
                                      <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>SKU: {product.sku}</span>
                                        <span>₹{product.price.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                  No products found
                                </div>
                              )}
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-20">
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Qty
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem className="w-28">
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Price (₹)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mb-2"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  append({ product_name: '', quantity: 1, price: 0 });
                  setProductSearchTerms([...productSearchTerms, '']);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              
              <div className="flex justify-end mt-2">
                <div className="text-right">
                  <span className="text-sm font-medium">Total: </span>
                  <span className="text-lg font-bold">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes or details" 
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
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? 'Saving...' 
                  : sale 
                    ? 'Update Sale'
                    : 'Create Sale'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
