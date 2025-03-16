
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ServiceStatusList } from './service-status/ServiceStatusList';
import { useServiceStatusData } from './service-status/useServiceStatusData';

export function ServiceStatus() {
  const [isAnimated, setIsAnimated] = useState(false);
  const { serviceData, isLoading, totalActiveServices } = useServiceStatusData();

  // Trigger animation when component is mounted
  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 300);
  }, []);

  return (
    <Card className={cn(
      "transition-all duration-300", 
      isAnimated ? "opacity-100" : "opacity-0 translate-y-4"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Service Requests
        </CardTitle>
        <Badge variant="outline" className="font-normal">
          {totalActiveServices} Active
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <ServiceStatusList 
          data={serviceData} 
          isLoading={isLoading} 
        />
      </CardContent>
    </Card>
  );
}
