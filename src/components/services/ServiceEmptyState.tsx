
import { WatchIcon, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServiceEmptyStateProps {
  onCreateService: () => void;
}

export function ServiceEmptyState({ onCreateService }: ServiceEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <WatchIcon className="h-10 w-10 text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium">No service requests found</h3>
      <p className="text-muted-foreground mb-4">
        You haven't created any service requests yet.
      </p>
      <Button size="sm" onClick={onCreateService}>
        <PlusCircle className="h-4 w-4 mr-2" /> New Service Request
      </Button>
    </div>
  );
}
