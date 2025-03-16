
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ServiceStatusItem as ServiceStatusItemType } from './useServiceStatusData';

interface ServiceStatusItemProps {
  item: ServiceStatusItemType;
}

export function ServiceStatusItem({ item }: ServiceStatusItemProps) {
  return (
    <div className="space-y-2">
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
  );
}
