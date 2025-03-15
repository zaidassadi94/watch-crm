
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Search, ChevronDown } from 'lucide-react';
import { ProductSuggestion } from '@/types/inventory';
import { SaleFormValues } from '../saleFormSchema';
import { useSettings } from '@/hooks/useSettings';
import { useInventoryData } from '@/hooks/useInventoryData';

interface ProductSearchFieldProps {
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

export function ProductSearchField({
  form,
  index,
  isFirstItem,
  productSuggestions,
  showProductSuggestions,
  setShowProductSuggestions,
  handleProductSearch,
  selectProduct,
  productSearchTerms
}: ProductSearchFieldProps) {
  const { currencySymbol } = useSettings();
  const { inventory } = useInventoryData();

  // Load all inventory items when dropdown is opened
  useEffect(() => {
    if (showProductSuggestions === index && productSearchTerms[index] === '') {
      // Show all products when dropdown is opened with empty search
      handleProductSearch('', index);
    }
  }, [showProductSuggestions, index, handleProductSearch, productSearchTerms]);

  return (
    <FormField
      control={form.control}
      name={`items.${index}.product_name`}
      render={({ field }) => (
        <FormItem className="flex-1 w-full sm:w-auto">
          <FormLabel className={isFirstItem ? "" : "sr-only"}>
            Product
          </FormLabel>
          <div className="relative w-full">
            <Popover
              open={showProductSuggestions === index}
              onOpenChange={(open) => {
                setShowProductSuggestions(open ? index : null);
                // If opening, show all products
                if (open) {
                  handleProductSearch('', index);
                }
              }}
            >
              <PopoverTrigger asChild>
                <div className="relative flex w-full">
                  <FormControl>
                    <Input 
                      placeholder="Select a product" 
                      {...field} 
                      className="pr-16 flex-grow"
                      onChange={(e) => {
                        field.onChange(e);
                        handleProductSearch(e.target.value, index);
                      }}
                      onClick={() => {
                        setShowProductSuggestions(index);
                      }}
                    />
                  </FormControl>
                  <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowProductSuggestions(index)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[320px]" align="start">
                <div className="p-2">
                  <Input
                    placeholder="Search product name or SKU"
                    value={productSearchTerms[index] || ''}
                    onChange={(e) => handleProductSearch(e.target.value, index)}
                    className="mb-2"
                  />
                </div>
                
                {productSuggestions.length > 0 ? (
                  <div className="max-h-60 overflow-auto">
                    {productSuggestions.map((product) => (
                      <div
                        key={product.id}
                        className="flex flex-col px-2 py-1.5 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          selectProduct(product, index);
                          // Set inventory_id when selecting a product
                          form.setValue(`items.${index}.inventory_id`, product.id);
                          
                          // Don't allow quantity more than stock
                          const currentQty = form.getValues(`items.${index}.quantity`);
                          if (currentQty > product.stock_level) {
                            form.setValue(`items.${index}.quantity`, Math.max(1, product.stock_level));
                          }
                          
                          // Close the popover after selection
                          setShowProductSuggestions(null);
                        }}
                      >
                        <div className="font-medium">{product.brand} {product.name}</div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>SKU: {product.sku}</span>
                          <span>{currencySymbol}{product.price.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className={product.stock_level <= 0 ? "text-red-500" : (product.stock_level <= 5 ? "text-amber-500" : "text-green-500")}>
                            Stock: {product.stock_level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    {productSearchTerms[index]?.length > 0 
                      ? 'No products found' 
                      : 'Loading products...'}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
