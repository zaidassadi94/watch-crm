
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalSalesRevenue: number;
  totalServiceRevenue: number;
  salesCount: number;
  activeInventory: number;
  pendingServices: number;
}

export function useDashboardData() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSalesRevenue: 0,
    totalServiceRevenue: 0,
    salesCount: 0,
    activeInventory: 0,
    pendingServices: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch completed sales data for revenue and count
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('total_amount')
          .eq('user_id', user.id)
          .eq('status', 'completed'); // Only count completed sales
        
        if (salesError) throw salesError;
        
        // Fetch service data for additional revenue
        const { data: serviceData, error: serviceError } = await supabase
          .from('service_requests')
          .select('price, status')
          .eq('user_id', user.id);
        
        if (serviceError) throw serviceError;
        
        // Fetch inventory count
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('id')
          .eq('user_id', user.id);
        
        if (inventoryError) throw inventoryError;
        
        // Calculate stats
        const totalSalesRevenue = salesData?.reduce((acc, item) => acc + Number(item.total_amount || 0), 0) || 0;
        const totalServiceRevenue = serviceData?.reduce((acc, item) => acc + Number(item.price || 0), 0) || 0;
        const pendingServices = serviceData?.filter(item => 
          item.status === 'pending' || item.status === 'in progress'
        ).length || 0;
        
        setDashboardStats({
          totalSalesRevenue,
          totalServiceRevenue,
          salesCount: salesData?.length || 0,
          activeInventory: inventoryData?.length || 0,
          pendingServices
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  // Calculate total revenue from both sales and services
  const totalRevenue = dashboardStats.totalSalesRevenue + dashboardStats.totalServiceRevenue;
  
  return {
    dashboardStats,
    totalRevenue,
    isLoading
  };
}
