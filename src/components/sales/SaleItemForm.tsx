
import React from 'react';
import { FormField } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { ProductSuggestion } from '@/types/inventory';
import { SaleFormValues, SaleItemInternal } from './saleFormSchema';
import { useFieldArray } from 'react-hook-form';
import { ProductSearchField } from './item-form/ProductSearchField';
import { SkuField } from './item-form/SkuField'; // We'll create this new component
import { QuantityField } from './item-form/QuantityField';
import { PriceField } from './item-form/PriceField';
import { SaleItemSummary } from './item-form/SaleItemSummary';

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

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Items *</h3>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-end gap-2 relative">
            <SkuField 
              form={form}
              index={index}
              isFirstItem={index === 0}
              productSuggestions={productSuggestions}
              showProductSuggestions={showProductSuggestions}
              setShowProductSuggestions={setShowProductSuggestions}
              handleProductSearch={handleProductSearch}
              selectProduct={selectProduct}
              productSearchTerms={productSearchTerms}
            />
            
            <ProductSearchField 
              form={form}
              index={index}
              isFirstItem={index === 0}
              productSuggestions={productSuggestions}
              showProductSuggestions={showProductSuggestions}
              setShowProductSuggestions={setShowProductSuggestions}
              handleProductSearch={handleProductSearch}
              selectProduct={selectProduct}
              productSearchTerms={productSearchTerms}
            />
            
            <div className="flex w-full sm:w-auto gap-2">
              <QuantityField
                form={form}
                index={index}
                isFirstItem={index === 0}
                productSuggestions={productSuggestions}
              />
              
              <PriceField
                form={form}
                index={index}
                isFirstItem={index === 0}
                fieldName={`items.${index}.price`}
                label="Price"
              />
              
              <PriceField
                form={form}
                index={index}
                isFirstItem={index === 0}
                fieldName={`items.${index}.cost_price`}
                label="Cost"
              />
              
              {/* Hidden field for inventory_id */}
              <FormField
                control={form.control}
                name={`items.${index}.inventory_id`}
                render={({ field }) => (
                  <input type="hidden" {...field} />
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
          append({ product_name: '', sku: '', quantity: 1, price: 0, cost_price: 0 });
        }}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Item
      </Button>
      
      <SaleItemSummary 
        items={form.watch('items').map(item => ({
          product_name: item.product_name || '',
          sku: item.sku || '',
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          cost_price: Number(item.cost_price) || 0,
          inventory_id: item.inventory_id
        }))}
      />
    </div>
  );
}
