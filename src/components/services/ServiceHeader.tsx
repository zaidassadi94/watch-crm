
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ServiceHeaderProps {
  isLoaded: boolean;
  onCreateService: () => void;
}

export function ServiceHeader({ isLoaded, onCreateService }: ServiceHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row justify-between md:items-center gap-4",
      isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
    )}>
      <div>
        <h1 className="text-2xl font-bold mb-1">Service Requests</h1>
        <p className="text-muted-foreground">
          Manage watch repairs and service requests
        </p>
      </div>
      <Button className="w-full md:w-auto gap-2" onClick={onCreateService}>
        <PlusCircle className="h-4 w-4" /> New Service Request
      </Button>
    </div>
  );
}
