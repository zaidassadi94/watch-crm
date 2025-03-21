
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CustomerPageHeaderProps {
  isLoaded: boolean;
  onAddCustomer: () => void;
}

export function CustomerPageHeader({ isLoaded, onAddCustomer }: CustomerPageHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row justify-between md:items-center gap-4",
      isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
    )}>
      <div>
        <h1 className="text-2xl font-bold mb-1">Customers</h1>
        <p className="text-muted-foreground">
          Manage customer profiles and track purchase history
        </p>
      </div>
      <Button 
        className="w-full md:w-auto gap-2" 
        onClick={onAddCustomer}
      >
        <UserPlus className="h-4 w-4" /> Add Customer
      </Button>
    </div>
  );
}
