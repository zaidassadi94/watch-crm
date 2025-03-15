
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/components/customers/useCustomerManagement';
import { customerFormSchema, CustomerFormValues } from '../forms/customerFormSchema';

export function useCustomerForm(
  customer: Customer | null,
  onSaved: () => void,
  onClose: () => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      type: 'Regular',
      status: 'Active',
    }
  });

  // Reset form when customer changes
  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        type: customer.type as "Regular" | "VIP",
        status: customer.status as "Active" | "Inactive",
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        type: 'Regular',
        status: 'Active',
      });
    }
  }, [customer, form]);

  // Safe close handler
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  }, [isSubmitting, form, onClose]);

  // Form submission handler
  const onSubmit = useCallback(async (data: CustomerFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("You must be logged in to perform this action");
      }
      
      const userId = userData.user.id;
      
      // Update or create customer in database
      if (customer) {
        // Check if customer exists in the new customers table
        const { data: existingCustomers, error: lookupError } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', userId)
          .eq('name', customer.name)
          .maybeSingle();
        
        if (lookupError && lookupError.code !== '42P01') {
          throw lookupError;
        }
        
        if (existingCustomers) {
          // Update existing customer in customers table
          const { error } = await supabase
            .from('customers')
            .update({
              name: data.name,
              email: data.email || null,
              phone: data.phone || null,
              type: data.type,
              status: data.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCustomers.id);
          
          if (error) {
            throw error;
          }
        } else {
          // Insert new record in customers table
          const { error } = await supabase
            .from('customers')
            .insert({
              user_id: userId,
              name: data.name,
              email: data.email || null,
              phone: data.phone || null,
              type: data.type,
              status: data.status
            });
            
          if (error && error.code !== '42P01') {
            throw error;
          }
        }
      } else {
        // Create new customer in customers table
        const { error } = await supabase
          .from('customers')
          .insert({
            user_id: userId,
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            type: data.type,
            status: data.status
          });
          
        if (error && error.code !== '42P01') {
          throw error;
        }
      }
      
      toast({
        title: customer ? "Customer Updated" : "Customer Added",
        description: `${data.name} has been ${customer ? 'updated' : 'added'} successfully.`,
      });
      
      // Call onSaved callback to refresh data
      onSaved();
      handleClose();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [customer, toast, onSaved, handleClose]);

  return {
    form,
    isSubmitting,
    onSubmit,
    handleClose
  };
}
