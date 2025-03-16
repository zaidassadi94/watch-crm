
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { ProductSuggestion } from '@/types/inventory';
import { SaleFormValues } from '../saleFormSchema';
import { useInventoryData } from '@/hooks/useInventoryData';

interface SkuFieldProps {
  form: UseFormReturn<SaleFormValues>;
  index: number;
  isFirstItem: boolean;
  productSuggestions: ProductSuggestion[];
  showProductSuggestions: number | null;
  setShowProductSuggestions: (index: number | null) => void;
  handleProductSearch: (value: string, index: number) => void;
  selectProduct: (product: ProductSuggestion, index: number) => void;
  productSearchTerms: string[];
}

export function SkuField({
  form,
  index,
  isFirstItem,
  productSuggestions,
  showProductSuggestions,
  setShowProductSuggestions,
  handleProductSearch,
  selectProduct,
  productSearchTerms
}: SkuFieldProps) {
  const { inventory } = useInventoryData();

  // When SKU field changes, try to auto-match with inventory
  useEffect(() => {
    const sku = form.watch(`items.${index}.sku`);
    if (sku) {
      const matchingProduct = inventory.find(item => item.sku.toLowerCase() === sku.toLowerCase());
      if (matchingProduct) {
        // Auto-fill product details if SKU matches
        form.setValue(`items.${index}.product_name`, `${matchingProduct.brand} ${matchingProduct.name}`);
        form.setValue(`items.${index}.price`, matchingProduct.price);
        form.setValue(`items.${index}.cost_price`, matchingProduct.cost_price || 0);
        form.setValue(`items.${index}.inventory_id`, matchingProduct.id);
      }
    }
  }, [form.watch(`items.${index}.sku`), inventory, form, index]);

  return (
    <FormField
      control={form.control}
      name={`items.${index}.sku`}
      render={({ field }) => (
        <FormItem className="w-full sm:w-32">
          <FormLabel className={isFirstItem ? "" : "sr-only"}>
            SKU
          </FormLabel>
          <div className="relative w-full">
            <Popover
              open={showProductSuggestions === index + 100} // Use different index to separate from product name
              onOpenChange={(open) => {
                setShowProductSuggestions(open ? index + 100 : null);
                if (open) {
                  // Filter by SKU when this dropdown opens
                  handleProductSearch(field.value || '', index);
                }
              }}
            >
              <PopoverTrigger asChild>
                <div className="relative flex w-full">
                  <FormControl>
                    <Input 
                      placeholder="SKU" 
                      {...field} 
                      className="pr-8"
                      onChange={(e) => {
                        field.onChange(e);
                        handleProductSearch(e.target.value, index);
                      }}
                    />
                  </FormControl>
                  <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowProductSuggestions(index + 100)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[320px]" align="start">
                <div className="max-h-[300px] overflow-y-auto">
                  {productSuggestions.length > 0 ? (
                    <div>
                      {productSuggestions.map((product) => (
                        <div
                          key={product.id}
                          className="flex flex-col px-3 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            form.setValue(`items.${index}.sku`, product.sku);
                            selectProduct(product, index);
                            setShowProductSuggestions(null);
                          }}
                        >
                          <div className="font-medium">SKU: {product.sku}</div>
                          <div className="text-xs">{product.brand} {product.name}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No SKU found
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
