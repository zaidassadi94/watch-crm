
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { InventoryStatus } from '@/components/dashboard/InventoryStatus';

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <RevenueChart />
      </div>
      <div>
        <InventoryStatus />
      </div>
    </div>
  );
}
