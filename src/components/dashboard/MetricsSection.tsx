
import { ServiceStatus } from '@/components/dashboard/ServiceStatus';
import { TopCustomers } from '@/components/dashboard/TopCustomers';

export function MetricsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ServiceStatus />
      <TopCustomers />
    </div>
  );
}
