
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Search, PlusCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProductSuggestion } from '@/types/inventory';
import { SaleFormValues, SaleItemInternal, calculateTotal } from './saleFormSchema';
import { useFieldArray } from 'react-hook-form';

interface SaleItemFormProps {
  form: UseFormReturn<SaleFormValues>;
  productSuggestions: ProductSuggestion[];
  showProductSuggestions: number | null;
  setShowProductSuggestions: (index: number | null) => void;
  productSearchTerms: string[];
  handleProductSearch: (value: string, index: number) => void;
  selectProduct: (product: ProductSuggestion, index: number) => void;
}

export function SaleItemForm({ 
  form, 
  productSuggestions, 
  showProductSuggestions, 
  setShowProductSuggestions,
  productSearchTerms,
  handleProductSearch,
  selectProduct
}: SaleItemFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const total = calculateTotal(
    form.watch('items').map(item => ({
      product_name: item.product_name || '',
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0
    }))
  );

  return (
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
  );
}
