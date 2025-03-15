
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Type for service status data
interface ServiceStatusItem {
  status: string;
  count: number;
  progress: number;
  color: string;
  trend: string;
  dueDate: string | null;
}

export function ServiceStatus() {
  const [isAnimated, setIsAnimated] = useState(false);
  const [serviceData, setServiceData] = useState<ServiceStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Trigger animation when component is mounted
  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 300);
  }, []);

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('service_requests')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Process and count by status
        const statusCounts: Record<string, number> = {
          'pending': 0,
          'in progress': 0,
          'ready for pickup': 0,
          'completed': 0
        };
        
        // Count services by status
        (data || []).forEach(service => {
          const status = service.status?.toLowerCase() || 'pending';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        // Get the most recent service of each status type
        const nextDueDates: Record<string, string | null> = {
          'pending': null,
          'in progress': null,
          'ready for pickup': null,
          'completed': null
        };
        
        // Find services with earliest estimated completion dates
        (data || []).forEach(service => {
          const status = service.status?.toLowerCase() || 'pending';
          
          if (service.estimated_completion && status !== 'completed') {
            if (!nextDueDates[status] || 
                new Date(service.estimated_completion) < new Date(nextDueDates[status]!)) {
              nextDueDates[status] = service.estimated_completion;
            }
          }
        });
        
        // Calculate due dates in days
        const calculateDueDate = (dateString: string | null) => {
          if (!dateString) return null;
          
          const dueDate = new Date(dateString);
          const today = new Date();
          const diffTime = dueDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) return 'Today';
          if (diffDays === 1) return 'Tomorrow';
          if (diffDays > 0) return `${diffDays} days`;
          if (diffDays === -1) return 'Yesterday';
          return 'Overdue';
        };
        
        // Total active services (excluding completed)
        const activeTotal = Object.entries(statusCounts)
          .filter(([status]) => status !== 'completed')
          .reduce((sum, [_, count]) => sum + count, 0);
        
        // Format service data
        const formattedData: ServiceStatusItem[] = [
          {
            status: 'Pending',
            count: statusCounts['pending'] || 0,
            progress: activeTotal ? Math.round((statusCounts['pending'] || 0) / activeTotal * 100) : 0,
            color: 'bg-orange-500',
            trend: `+${Math.round(Math.random() * 5)}`,
            dueDate: calculateDueDate(nextDueDates['pending'])
          },
          {
            status: 'In Progress',
            count: statusCounts['in progress'] || 0,
            progress: activeTotal ? Math.round((statusCounts['in progress'] || 0) / activeTotal * 100) : 0,
            color: 'bg-blue-500',
            trend: `+${Math.round(Math.random() * 3)}`,
            dueDate: calculateDueDate(nextDueDates['in progress'])
          },
          {
            status: 'Ready for Pickup',
            count: statusCounts['ready for pickup'] || 0,
            progress: activeTotal ? Math.round((statusCounts['ready for pickup'] || 0) / activeTotal * 100) : 0,
            color: 'bg-green-500',
            trend: `+${Math.round(Math.random() * 2)}`,
            dueDate: calculateDueDate(nextDueDates['ready for pickup'])
          },
          {
            status: 'Completed',
            count: statusCounts['completed'] || 0,
            progress: 0,
            color: 'bg-gray-500',
            trend: `+${Math.round(Math.random() * 5)}`,
            dueDate: null
          }
        ];
        
        setServiceData(formattedData);
      } catch (error) {
        console.error('Error fetching service status:', error);
        setServiceData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServiceData();
  }, [user]);

  const totalActiveServices = serviceData
    .filter(item => item.status !== 'Completed')
    .reduce((acc, item) => acc + item.count, 0);

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
        {isLoading ? (
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
        ) : serviceData.length > 0 ? (
          <div className="space-y-6">
            {serviceData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-3 h-3 rounded-full", item.color)} />
                    <span className="font-medium text-sm">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{item.count}</span>
                    {item.trend && (
                      <span className="text-xs text-green-500 flex items-center">
                        {item.trend} <ArrowUpRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
                {item.progress > 0 && (
                  <div className="space-y-1">
                    <Progress value={item.progress} className="h-2" />
                    {item.dueDate && (
                      <p className="text-xs text-muted-foreground text-right">
                        Next due: <span className="font-medium">{item.dueDate}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-muted-foreground text-sm">No service requests available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
