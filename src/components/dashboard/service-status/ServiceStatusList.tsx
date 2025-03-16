
import { ServiceStatusItem } from './ServiceStatusItem';
import { ServiceStatusItem as ServiceStatusItemType } from './useServiceStatusData';

interface ServiceStatusListProps {
  data: ServiceStatusItemType[];
  isLoading: boolean;
}

export function ServiceStatusList({ data, isLoading }: ServiceStatusListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((_, i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted"></div>
                <div className="w-24 h-4 bg-muted rounded"></div>
              </div>
              <div className="w-12 h-6 bg-muted rounded"></div>
            </div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <p className="text-muted-foreground text-sm">No service requests available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((item, index) => (
        <ServiceStatusItem key={index} item={item} />
      ))}
    </div>
  );
}
