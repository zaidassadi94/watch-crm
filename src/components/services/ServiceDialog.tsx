
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { ServiceRequest } from '@/pages/Services';
import { useAuth } from '@/hooks/useAuth';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from '@/lib/utils';
import { CustomerSuggestion, CustomerWatchDetails } from '@/types/inventory';

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceRequest | null;
  onSaved: () => void;
}

const serviceFormSchema = z.object({
  customer_name: z.string().min(2, 'Customer name is required'),
  customer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  customer_phone: z.string().optional(),
  watch_brand: z.string().min(1, 'Watch brand is required'),
  watch_model: z.string().optional(),
  serial_number: z.string().optional(),
  service_type: z.string().min(1, 'Service type is required'),
  description: z.string().optional(),
  status: z.string(),
  estimated_completion: z.string().optional().or(z.literal('')),
  price: z.number().optional().nullable(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export function ServiceDialog({ open, onOpenChange, service, onSaved }: ServiceDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      customer_name: service?.customer_name || '',
      customer_email: service?.customer_email || '',
      customer_phone: service?.customer_phone || '',
      watch_brand: service?.watch_brand || '',
      watch_model: service?.watch_model || '',
      serial_number: service?.serial_number || '',
      service_type: service?.service_type || 'repair',
      description: service?.description || '',
      status: service?.status || 'pending',
      estimated_completion: service?.estimated_completion 
        ? new Date(service.estimated_completion).toISOString().split('T')[0] 
        : '',
      price: service?.price !== null ? Number(service.price) : null,
    }
  });

  useEffect(() => {
    if (searchTerm.length < 2) return;
    
    const loadCustomerSuggestions = async () => {
      if (!user) return;
      
      try {
        const { data: serviceData, error: serviceError } = await supabase
          .from('service_requests')
          .select('customer_name, customer_email, customer_phone, watch_brand, watch_model, serial_number')
          .eq('user_id', user.id)
          .ilike('customer_phone', `%${searchTerm}%`)
          .order('created_at', { ascending: false });
          
        if (serviceError) throw serviceError;
        
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('customer_name, customer_email, customer_phone')
          .eq('user_id', user.id)
          .ilike('customer_phone', `%${searchTerm}%`)
          .order('created_at', { ascending: false });
          
        if (salesError) throw salesError;
        
        const combinedData = [...(serviceData || []), ...(salesData || [])];
        const uniqueCustomers: CustomerSuggestion[] = [];
        
        combinedData.forEach(item => {
          const existingCustomer = uniqueCustomers.find(c => 
            c.phone === item.customer_phone
          );
          
          if (existingCustomer) {
            if ('watch_brand' in item && item.watch_brand) {
              if (!existingCustomer.watches) {
                existingCustomer.watches = [];
              }
              
              const watchItem = item as {
                watch_brand: string;
                watch_model?: string | null;
                serial_number?: string | null;
              };
              
              const watch: CustomerWatchDetails = {
                brand: watchItem.watch_brand,
                model: watchItem.watch_model || null,
                serial: watchItem.serial_number || null
              };
              
              const existingWatch = existingCustomer.watches.find(w => 
                w.brand === watch.brand && 
                w.model === watch.model && 
                w.serial === watch.serial
              );
              
              if (!existingWatch) {
                existingCustomer.watches.push(watch);
              }
            }
          } else {
            const newCustomer: CustomerSuggestion = {
              name: item.customer_name,
              email: item.customer_email,
              phone: item.customer_phone,
            };
            
            if ('watch_brand' in item && item.watch_brand) {
              const watchItem = item as {
                watch_brand: string;
                watch_model?: string | null;
                serial_number?: string | null;
              };
              
              newCustomer.watches = [{
                brand: watchItem.watch_brand,
                model: watchItem.watch_model || null,
                serial: watchItem.serial_number || null
              }];
            }
            
            uniqueCustomers.push(newCustomer);
          }
        });
        
        setCustomerSuggestions(uniqueCustomers);
        setShowCustomerSuggestions(uniqueCustomers.length > 0);
      } catch (error) {
        console.error("Error fetching customer suggestions:", error);
      }
    };
    
    loadCustomerSuggestions();
  }, [searchTerm, user]);

  const selectCustomer = (customer: CustomerSuggestion) => {
    form.setValue('customer_name', customer.name);
    if (customer.email) form.setValue('customer_email', customer.email);
    if (customer.phone) form.setValue('customer_phone', customer.phone);
    
    if (customer.watches && customer.watches.length > 0) {
      const watch = customer.watches[0];
      form.setValue('watch_brand', watch.brand);
      if (watch.model) form.setValue('watch_model', watch.model);
      if (watch.serial) form.setValue('serial_number', watch.serial);
    }
    
    setShowCustomerSuggestions(false);
  };

  const onSubmit = async (data: ServiceFormValues) => {
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

      if (service) {
        const { error } = await supabase
          .from('service_requests')
          .update({
            customer_name: data.customer_name,
            customer_email: data.customer_email || null,
            customer_phone: data.customer_phone || null,
            watch_brand: data.watch_brand,
            watch_model: data.watch_model || null,
            serial_number: data.serial_number || null,
            service_type: data.service_type,
            description: data.description || null,
            status: data.status,
            estimated_completion: data.estimated_completion || null,
            price: data.price,
            updated_at: new Date().toISOString(),
          })
          .eq('id', service.id);

        if (error) throw error;

        toast({
          title: "Service updated",
          description: "Service request has been updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('service_requests')
          .insert({
            user_id: user.id,
            customer_name: data.customer_name,
            customer_email: data.customer_email || null,
            customer_phone: data.customer_phone || null,
            watch_brand: data.watch_brand,
            watch_model: data.watch_model || null,
            serial_number: data.serial_number || null,
            service_type: data.service_type,
            description: data.description || null,
            status: data.status,
            estimated_completion: data.estimated_completion || null,
            price: data.price,
          });

        if (error) throw error;

        toast({
          title: "Service created",
          description: "New service request has been created successfully",
        });
      }

      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      toast({
        title: service ? "Error updating service" : "Error creating service",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service Request' : 'Create New Service Request'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer name" {...field} />
                      </FormControl>
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
                    <FormItem className="relative">
                      <FormLabel>Phone</FormLabel>
                      <Popover 
                        open={showCustomerSuggestions} 
                        onOpenChange={setShowCustomerSuggestions}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="(123) 456-7890" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  setSearchTerm(e.target.value);
                                }}
                              />
                              {customerSuggestions.length > 0 && (
                                <ChevronsUpDown className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <div className="max-h-72 overflow-auto">
                            {customerSuggestions.map((customer, index) => (
                              <div
                                key={index}
                                className="flex flex-col px-2 py-1.5 hover:bg-accent cursor-pointer"
                                onClick={() => selectCustomer(customer)}
                              >
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {customer.phone}
                                  {customer.email ? ` • ${customer.email}` : ''}
                                </div>
                                {customer.watches && customer.watches.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Previous watch: {customer.watches[0].brand} 
                                    {customer.watches[0].model ? ` ${customer.watches[0].model}` : ''}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Watch Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="watch_brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Rolex, Omega, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="watch_model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Submariner, Speedmaster, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="serial_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Watch serial number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Service Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="service_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="battery replacement">Battery Replacement</SelectItem>
                          <SelectItem value="overhaul">Complete Overhaul</SelectItem>
                          <SelectItem value="restoration">Restoration</SelectItem>
                          <SelectItem value="custom">Custom Service</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <SelectItem value="in progress">In Progress</SelectItem>
                          <SelectItem value="ready for pickup">Ready for Pickup</SelectItem>
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
                  name="estimated_completion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Completion Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="Enter price or leave blank for TBD"
                          {...field}
                          value={field.value === null ? '' : field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? null : parseFloat(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the issue or service needed" 
                        className="min-h-24" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                  : service 
                    ? 'Update Service'
                    : 'Create Service'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
