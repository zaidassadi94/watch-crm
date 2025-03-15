
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

export function ServicesContent() {
  const { services, isLoading, isLoaded, fetchServices, handleDelete } = useServiceData();
  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    isDialogOpen,
    setIsDialogOpen,
    selectedService,
    handleEditService,
    handleCreateService
  } = useServiceDialogs();

  const columns = getServiceTableColumns({
    onEdit: handleEditService,
    onDelete: handleDelete
  });

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
      <ServiceHeader 
        isLoaded={isLoaded}
        onCreateService={handleCreateService}
      />

      <ServiceSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
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
