
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, AlertCircle } from 'lucide-react';
import { ProductSuggestion } from '@/types/inventory';
import { SaleFormValues } from '../saleFormSchema';
import { useSettings } from '@/hooks/useSettings';
import { useInventoryData } from '@/hooks/useInventoryData';
import { Badge } from '@/components/ui/badge';

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
  const { inventory, isLoading } = useInventoryData();

  // Load all inventory items when dropdown is opened
  useEffect(() => {
    if (showProductSuggestions === index && productSearchTerms[index] === '') {
      // Show all products when dropdown is opened with empty search
      handleProductSearch('', index);
    }
  }, [showProductSuggestions, index, handleProductSearch, productSearchTerms]);

  // Get current inventory_id
  const currentInventoryId = form.watch(`items.${index}.inventory_id`);
  
  // Determine if selected item has stock
  const hasSelectedProduct = !!currentInventoryId;
  const selectedProduct = inventory.find(item => item.id === currentInventoryId);
  const isOutOfStock = selectedProduct && selectedProduct.stock_level <= 0;

  return (
    <FormField
      control={form.control}
      name={`items.${index}.product_name`}
      render={({ field }) => (
        <FormItem className="flex-1 w-full">
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
                    <div className="relative">
                      <Input 
                        placeholder="Product Name" 
                        {...field} 
                        className={`pr-16 flex-grow ${isOutOfStock ? 'border-red-300 text-red-600' : ''}`}
                        onChange={(e) => {
                          field.onChange(e);
                          handleProductSearch(e.target.value, index);
                        }}
                        onClick={() => {
                          setShowProductSuggestions(index);
                        }}
                      />
                      {isOutOfStock && (
                        <div className="absolute right-12 top-1/2 -translate-y-1/2">
                          <Badge variant="destructive" className="text-xs">Out of stock</Badge>
                        </div>
                      )}
                    </div>
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
                <div className="p-2 border-b">
                  <Input
                    placeholder="Search product name, SKU or brand"
                    value={productSearchTerms[index] || ''}
                    onChange={(e) => handleProductSearch(e.target.value, index)}
                    className="mb-0"
                  />
                </div>
                
                <div className="max-h-[300px] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading inventory...
                    </div>
                  ) : productSuggestions.length > 0 ? (
                    <div>
                      {productSuggestions.map((product) => (
                        <div
                          key={product.id}
                          className="flex flex-col px-3 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            selectProduct(product, index);
                            // Set inventory_id and SKU when selecting a product
                            form.setValue(`items.${index}.inventory_id`, product.id);
                            form.setValue(`items.${index}.sku`, product.sku);
                            
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
                          <div className="flex justify-between text-xs mt-1">
                            <span className={
                              product.stock_level <= 0 
                                ? "text-red-500 font-medium"
                                : product.stock_level <= 5 
                                  ? "text-amber-500"
                                  : "text-green-500"
                            }>
                              {product.stock_status === 'out_of_stock' 
                                ? 'Out of stock' 
                                : `Stock: ${product.stock_level}`}
                            </span>
                            <span className="text-muted-foreground">{product.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {productSearchTerms[index]?.length > 0 
                        ? 'No products found' 
                        : 'No products available'}
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
