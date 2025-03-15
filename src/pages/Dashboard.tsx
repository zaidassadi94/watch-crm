
import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Package2, 
  Wrench, 
  ArrowRight 
} from 'lucide-react';
import { StatCard } from '@/components/ui-custom/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { InventoryStatus } from '@/components/dashboard/InventoryStatus';
import { ServiceStatus } from '@/components/dashboard/ServiceStatus';
import { TopCustomers } from '@/components/dashboard/TopCustomers';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  const stats = [
    {
      title: 'Total Revenue',
      value: '$48,352',
      icon: <DollarSign className="w-5 h-5" />,
      trend: { value: 12, positive: true },
    },
    {
      title: 'Sales Count',
      value: '182',
      icon: <ShoppingCart className="w-5 h-5" />,
      trend: { value: 8, positive: true },
    },
    {
      title: 'Active Inventory',
      value: '165',
      icon: <Package2 className="w-5 h-5" />,
      trend: { value: 3, positive: false },
    },
    {
      title: 'Pending Services',
      value: '37',
      icon: <Wrench className="w-5 h-5" />,
      trend: { value: 5, positive: true },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div 
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500",
          isLoaded ? "opacity-100" : "opacity-0 transform translate-y-4"
        )}
      >
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <InventoryStatus />
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceStatus />
        <TopCustomers />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {[
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
        ].map((action, index) => (
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
              <a href={action.link} className="flex items-center gap-1 text-sm">
                Go <ArrowRight className="w-3 h-3" />
              </a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
