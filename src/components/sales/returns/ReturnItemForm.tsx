
import React from 'react';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ReturnFormValues } from '../saleFormSchema';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/useSettings';

interface ReturnItemFormProps {
  form: UseFormReturn<ReturnFormValues>;
  index: number;
  productName: string;
}

export function ReturnItemForm({ form, index, productName }: ReturnItemFormProps) {
  const { currencySymbol } = useSettings();
  
  // Get max quantity from form values
  const maxQuantity = form.watch(`items.${index}.max_quantity`) || 1;
  const currentQuantity = form.watch(`items.${index}.quantity`) || 1;
  const price = form.watch(`items.${index}.price`) || 0;
  
  // Calculate subtotal
  const subtotal = currentQuantity * price;
  
  return (
    <div className="p-3 border rounded-md">
      <div className="font-medium mb-2">{productName}</div>
      
      <div className="space-y-4">
        <FormField
          control={form.control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity to Return</FormLabel>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">1</span>
                  <span className="text-sm text-muted-foreground">{maxQuantity}</span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={maxQuantity}
                    step={1}
                    value={[field.value]}
                    onValueChange={values => field.onChange(values[0])}
                    className="py-2"
                  />
                </FormControl>
                <div className="flex justify-between">
                  <Label>Selected: {field.value}</Label>
                  <Label>Subtotal: {currencySymbol}{subtotal.toFixed(2)}</Label>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Hidden fields for other required data */}
        <FormField
          control={form.control}
          name={`items.${index}.product_name`}
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />
        
        <FormField
          control={form.control}
          name={`items.${index}.price`}
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />
        
        <FormField
          control={form.control}
          name={`items.${index}.cost_price`}
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />
        
        <FormField
          control={form.control}
          name={`items.${index}.inventory_id`}
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />
        
        <FormField
          control={form.control}
          name={`items.${index}.sku`}
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />
      </div>
    </div>
  );
}
