
import { useState, useEffect } from 'react';
import { 
  PlusCircle, Search, Filter, Download, 
  MoreHorizontal, Eye, Edit, Trash2, Clock,
  CheckCircle, XCircle, AlertTriangle, WatchIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, Column } from '@/components/ui-custom/DataTable';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ServiceDialog } from '@/components/services/ServiceDialog';

// Type definitions
export interface ServiceRequest {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  watch_brand: string;
  watch_model: string | null;
  serial_number: string | null;
  service_type: string;
  description: string | null;
  status: string;
  estimated_completion: string | null;
  price: number | null;
  created_at: string;
}

const statusStyles = {
  pending: { 
    color: "text-amber-700 bg-amber-100", 
    icon: Clock 
  },
  "in progress": { 
    color: "text-blue-700 bg-blue-100", 
    icon: AlertTriangle 
  },
  "ready for pickup": { 
    color: "text-purple-700 bg-purple-100", 
    icon: CheckCircle 
  },
  completed: { 
    color: "text-green-700 bg-green-100", 
    icon: CheckCircle 
  },
  cancelled: { 
    color: "text-red-700 bg-red-100", 
    icon: XCircle 
  }
};

const Services = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    fetchServices();
    // Add short delay for animation
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, [user]);

  const fetchServices = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setServices(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching service requests",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Service request deleted",
        description: "The service request has been successfully deleted",
      });
      
      // Refresh services list
      fetchServices();
    } catch (error: any) {
      toast({
        title: "Error deleting service request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditService = (service: ServiceRequest) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setIsDialogOpen(true);
  };

  const columns: Column<ServiceRequest>[] = [
    {
      header: "Customer / Watch",
      accessorKey: "customer_name",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <div>
          <div className="font-medium">{row.original.customer_name}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.watch_brand} {row.original.watch_model && `- ${row.original.watch_model}`}
          </div>
        </div>
      )
    },
    {
      header: "Service Type",
      accessorKey: "service_type",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <div className="capitalize">{row.original.service_type}</div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: { row: { original: ServiceRequest } }) => {
        const status = row.original.status.toLowerCase() as keyof typeof statusStyles;
        const style = statusStyles[status] || statusStyles.pending;
        const StatusIcon = style.icon;
        
        return (
          <Badge variant="outline" className={cn("capitalize", style.color)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {row.original.status}
          </Badge>
        );
      }
    },
    {
      header: "Est. Completion",
      accessorKey: "estimated_completion",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <div className="text-sm">
          {row.original.estimated_completion 
            ? new Date(row.original.estimated_completion).toLocaleDateString() 
            : "Not specified"}
        </div>
      )
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <div className="font-medium">
          {row.original.price ? `$${Number(row.original.price).toFixed(2)}` : "TBD"}
        </div>
      ),
      className: "text-right"
    },
    {
      header: "",
      accessorKey: "id",
      cell: ({ row }: { row: { original: ServiceRequest } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEditService(row.original)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "text-right"
    }
  ];

  const filteredServices = services.filter(service => 
    service.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.watch_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.watch_model && service.watch_model.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (service.customer_email && service.customer_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div 
      className={cn(
        "space-y-6 transition-all duration-300",
        isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
      )}
    >
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Service Requests</h1>
          <p className="text-muted-foreground">
            Manage watch repairs and service requests
          </p>
        </div>
        <Button className="w-full md:w-auto gap-2" onClick={handleCreateService}>
          <PlusCircle className="h-4 w-4" /> New Service Request
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search service requests..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredServices}
        isLoading={isLoading}
        emptyState={
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <WatchIcon className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No service requests found</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any service requests yet.
            </p>
            <Button size="sm" onClick={handleCreateService}>
              <PlusCircle className="h-4 w-4 mr-2" /> New Service Request
            </Button>
          </div>
        }
      />

      <ServiceDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        service={selectedService}
        onSaved={fetchServices}
      />
    </div>
  );
};

export default Services;
