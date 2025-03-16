
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  title: string;
  description: string;
  link: string;
  color: string;
  textColor: string;
}

interface QuickActionsProps {
  isLoaded: boolean;
}

export function QuickActions({ isLoaded }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      title: 'Add New Customer',
      description: 'Create a customer profile',
      link: '/customers',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-600',
    },
    {
      title: 'Log New Sale',
      description: 'Record a new transaction',
      link: '/sales',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-600',
    },
    {
      title: 'Update Inventory',
      description: 'Add or modify stock items',
      link: '/inventory',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-600',
    },
    {
      title: 'Create Service Request',
      description: 'Log a new repair or service',
      link: '/services',
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {actions.map((action, index) => (
        <div 
          key={index}
          className={cn(
            "rounded-lg p-5 border shadow-sm transition-all duration-300 hover:shadow-md", 
            action.color,
            isLoaded ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4",
            {"delay-100": index === 0},
            {"delay-200": index === 1},
            {"delay-300": index === 2},
            {"delay-400": index === 3},
          )}
        >
          <h3 className={cn("font-medium mb-1", action.textColor)}>{action.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("p-0 h-auto", action.textColor)}
            asChild
          >
            <Link to={action.link} className="flex items-center gap-1 text-sm">
              Go <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
