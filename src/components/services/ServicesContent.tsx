
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui-custom/DataTable';
import { useServiceData } from '@/hooks/useServiceData';
import { useServiceDialogs } from '@/hooks/useServiceDialogs';
import { ServiceDialog } from '@/components/services/ServiceDialog';
import { ServiceHeader } from '@/components/services/ServiceHeader';
import { ServiceSearch } from '@/components/services/ServiceSearch';
import { ServiceEmptyState } from '@/components/services/ServiceEmptyState';
import { getServiceTableColumns } from '@/components/services/ServiceTableColumns';
import { ServiceRequest } from '@/types/services';
import { ColumnDef } from '@tanstack/react-table';
import { Column } from '@/components/ui-custom/DataTable';

// Adapter function to convert ColumnDef to Column
function adaptColumns<T extends object>(columns: ColumnDef<T>[]): Column<T>[] {
  return columns.map(col => ({
    header: typeof col.header === 'string' ? col.header : String(col.id),
    accessorKey: col.accessorKey as string,
    cell: col.cell as any,
    className: col.meta?.className as string,
  }));
}

export function ServicesContent() {
  const { services, isLoading, isLoaded, fetchServices, handleDelete } = useServiceData();
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [serviceType, setServiceType] = useState("");
  
  const {
    isDialogOpen,
    setIsDialogOpen,
    selectedService,
    handleEditService,
    handleCreateService
  } = useServiceDialogs();

  const tanstackColumns = getServiceTableColumns({
    onEdit: handleEditService,
    onDelete: handleDelete
  });
  
  // Convert columns to the format expected by our DataTable
  const columns = adaptColumns<ServiceRequest>(tanstackColumns);

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.watch_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.watch_model && service.watch_model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (service.customer_email && service.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = status === '' || service.status === status;
    const matchesType = serviceType === '' || service.service_type === serviceType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div 
      className={cn(
        "space-y-6 transition-all duration-300",
        isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
      )}
    >
      <ServiceHeader 
        isLoaded={isLoaded}
        onCreateService={handleCreateService}
      />

      <ServiceSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        status={status}
        setStatus={setStatus}
        serviceType={serviceType}
        setServiceType={setServiceType}
      />

      <DataTable
        columns={columns}
        data={filteredServices}
        isLoading={isLoading}
        emptyState={<ServiceEmptyState onCreateService={handleCreateService} />}
      />

      <ServiceDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        service={selectedService}
        onSaved={fetchServices}
      />
    </div>
  );
}
