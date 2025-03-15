
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample data for demonstration
const serviceData = [
  { 
    status: 'Pending', 
    count: 12, 
    progress: 25, 
    color: 'bg-orange-500', 
    trend: '+4',
    dueDate: '2 days',
  },
  { 
    status: 'In Progress', 
    count: 18, 
    progress: 40, 
    color: 'bg-blue-500', 
    trend: '+2',
    dueDate: '4 days',
  },
  { 
    status: 'Ready for Pickup', 
    count: 7, 
    progress: 15, 
    color: 'bg-green-500', 
    trend: '+1',
    dueDate: 'Today',
  },
  { 
    status: 'Completed', 
    count: 32, 
    progress: 0, 
    color: 'bg-gray-500', 
    trend: '+5',
    dueDate: null,
  },
];

export function ServiceStatus() {
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger animation when component is mounted
  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 300);
  }, []);

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
      </CardContent>
    </Card>
  );
}
