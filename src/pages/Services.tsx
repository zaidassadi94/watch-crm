
import { useState, useEffect } from 'react';
import { 
  PlusCircle, Search, Filter, Download, 
  MoreHorizontal, Eye, Edit, Trash2, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// This is a placeholder component
// Will be implemented with real functionality later
const Services = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  return (
    <div 
      className={cn(
        "space-y-6 transition-all duration-300",
        isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
      )}
    >
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Service Requests</h1>
          <p className="text-muted-foreground">
            Manage watch repairs and service requests
          </p>
        </div>
        <Button className="w-full md:w-auto gap-2">
          <PlusCircle className="h-4 w-4" /> New Service Request
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center py-10">
          <div className="bg-muted/30 rounded-full p-4 mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Service Module Coming Soon</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            We're working on implementing a complete service management system
            for tracking repairs, managing service statuses, and notifying customers.
          </p>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" /> Create Service Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Services;
