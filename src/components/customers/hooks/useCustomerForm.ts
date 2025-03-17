
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Customer } from '@/components/customers/useCustomerManagement';
import { customerFormSchema, CustomerFormValues } from '@/components/customers/forms/customerFormSchema';

export function useCustomerForm(
  customer: Customer | null,
  onSaved: () => void,
  onCancel: () => void
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form setup with Zod validation
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      type: (customer?.type as any) || "Regular",
      status: (customer?.status as any) || "Active",
      communication_preferences: customer?.communication_preferences || { sms: true, whatsapp: false }
    }
  });
  
  // Handle form submission
  const onSubmit = async (data: CustomerFormValues) => {
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
      
      if (customer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            type: data.type,
            status: data.status,
            communication_preferences: data.communication_preferences,
            updated_at: new Date().toISOString()
          })
          .eq('id', customer.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        toast({
          title: "Customer updated",
          description: "Customer details have been updated successfully",
        });
      } else {
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert({
            user_id: user.id,
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            type: data.type,
            status: data.status,
            communication_preferences: data.communication_preferences
          });
        
        if (error) throw error;
        
        toast({
          title: "Customer added",
          description: "New customer has been added successfully",
        });
      }
      
      // Call the onSaved callback to refresh the customers list
      onSaved();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle dialog close
  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onCancel();
    }
  };
  
  return {
    form,
    isSubmitting,
    onSubmit,
    handleClose
  };
}
