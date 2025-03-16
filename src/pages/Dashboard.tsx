
import { useEffect, useState } from 'react';
import { IndianRupee, ShoppingCart, Package2, Wrench } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInitializeUserData } from '@/hooks/useInitializeUserData';
import { useDashboardData } from '@/hooks/useDashboardData';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { MetricsSection } from '@/components/dashboard/MetricsSection';
import { QuickActions } from '@/components/dashboard/QuickActions';

const Dashboard = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const { createSampleData } = useInitializeUserData();
  const { dashboardStats, totalRevenue, isLoading } = useDashboardData();

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  useEffect(() => {
    // Try to create sample data when dashboard loads (if needed)
    createSampleData();
  }, [createSampleData]);

  // Prepare stats data for the stats cards
  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      secondaryValues: [
        { label: 'Sales', value: `₹${dashboardStats.totalSalesRevenue.toLocaleString()}` },
        { label: 'Services', value: `₹${dashboardStats.totalServiceRevenue.toLocaleString()}` }
      ],
      icon: <IndianRupee className="w-5 h-5" />,
      trend: { value: 12, positive: true },
    },
    {
      title: 'Completed Sales',
      value: dashboardStats.salesCount.toString(),
      icon: <ShoppingCart className="w-5 h-5" />,
      trend: { value: 8, positive: true },
    },
    {
      title: 'Active Inventory',
      value: dashboardStats.activeInventory.toString(),
      icon: <Package2 className="w-5 h-5" />,
      trend: { value: 3, positive: dashboardStats.activeInventory > 0 },
    },
    {
      title: 'Pending Services',
      value: dashboardStats.pendingServices.toString(),
      icon: <Wrench className="w-5 h-5" />,
      trend: { value: 5, positive: false },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards stats={stats} isLoaded={isLoaded} />

      {/* Charts Section */}
      <ChartsSection />

      {/* Additional Metrics */}
      <MetricsSection />

      {/* Quick Actions */}
      <QuickActions isLoaded={isLoaded} />
    </div>
  );
};

export default Dashboard;
