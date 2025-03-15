
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
import { useSettings } from '@/hooks/useSettings';

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
  
  const { currencySymbol } = useSettings();

  const total = calculateTotal(
    form.watch('items').map(item => ({
      product_name: item.product_name || '',
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      cost_price: Number(item.cost_price) || 0,
    }))
  );

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Items *</h3>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-end gap-2 relative">
            <FormField
              control={form.control}
              name={`items.${index}.product_name`}
              render={({ field }) => (
                <FormItem className="flex-1 w-full sm:w-auto">
                  <FormLabel className={index !== 0 ? "sr-only" : ""}>
                    Product
                  </FormLabel>
                  <Popover
                    open={showProductSuggestions === index}
                    onOpenChange={(open) => setShowProductSuggestions(open ? index : null)}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <div className="relative w-full">
                          <Input 
                            placeholder="Product name or SKU" 
                            {...field} 
                            className="pr-8"
                            onChange={(e) => {
                              field.onChange(e);
                              handleProductSearch(e.target.value, index);
                            }}
                          />
                          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[300px]" align="start">
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
                                <span>{currencySymbol}{product.price.toLocaleString()}</span>
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
            
            <div className="flex w-full sm:w-auto gap-2">
              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem className="w-full sm:w-20">
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
                  <FormItem className="w-full sm:w-28">
                    <FormLabel className={index !== 0 ? "sr-only" : ""}>
                      Price ({currencySymbol})
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
              
              {/* Add cost_price field */}
              <FormField
                control={form.control}
                name={`items.${index}.cost_price`}
                render={({ field }) => (
                  <FormItem className="w-full sm:w-28">
                    <FormLabel className={index !== 0 ? "sr-only" : ""}>
                      Cost ({currencySymbol})
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
                className={index !== 0 ? "mb-0 mt-auto" : "mb-0"} 
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={() => {
          append({ product_name: '', quantity: 1, price: 0, cost_price: 0 });
        }}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Item
      </Button>
      
      <div className="flex justify-end mt-4">
        <div className="text-right">
          <span className="text-sm font-medium">Total: </span>
          <span className="text-lg font-bold">{currencySymbol}{total.totalPrice.toFixed(2)}</span>
          <div className="text-sm text-muted-foreground">
            Profit: {currencySymbol}{total.totalProfit.toFixed(2)} ({total.marginPercentage.toFixed(2)}%)
          </div>
        </div>
      </div>
    </div>
  );
}
