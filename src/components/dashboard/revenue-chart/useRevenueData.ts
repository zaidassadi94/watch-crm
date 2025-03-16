
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  format, 
  subMonths, 
  subYears, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth, 
  eachMonthOfInterval, 
  startOfYear, 
  endOfYear, 
  eachYearOfInterval 
} from 'date-fns';

// Type for revenue data
export interface RevenueItem {
  name: string;
  revenue: number;
}

export interface RevenueData {
  weekly: RevenueItem[];
  monthly: RevenueItem[];
  yearly: RevenueItem[];
}

export function useRevenueData() {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    weekly: [],
    monthly: [],
    yearly: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRevenueData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch sales data
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('total_amount, created_at')
          .eq('user_id', user.id);
        
        if (salesError) throw salesError;
        
        // Fetch service data
        const { data: serviceData, error: serviceError } = await supabase
          .from('service_requests')
          .select('price, created_at')
          .eq('user_id', user.id);
        
        if (serviceError) throw serviceError;
        
        // Combine data
        const combinedData = [
          ...(salesData || []).map(item => ({ 
            amount: Number(item.total_amount || 0), 
            date: new Date(item.created_at) 
          })),
          ...(serviceData || []).map(item => ({ 
            amount: Number(item.price || 0), 
            date: new Date(item.created_at) 
          }))
        ];
        
        // Generate weekly data
        const now = new Date();
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        
        const weeklyData = weekDays.map(day => {
          const dayStr = format(day, 'EEE');
          const dayRevenue = combinedData
            .filter(item => format(item.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
            .reduce((sum, item) => sum + item.amount, 0);
          
          return { name: dayStr, revenue: dayRevenue };
        });
        
        // Generate monthly data
        const monthStart = startOfMonth(subMonths(now, 11));
        const monthEnd = endOfMonth(now);
        const months = eachMonthOfInterval({ start: monthStart, end: monthEnd });
        
        const monthlyData = months.map(month => {
          const monthStr = format(month, 'MMM');
          const monthRevenue = combinedData
            .filter(item => {
              const itemMonth = item.date.getMonth();
              const itemYear = item.date.getFullYear();
              return itemMonth === month.getMonth() && itemYear === month.getFullYear();
            })
            .reduce((sum, item) => sum + item.amount, 0);
          
          return { name: monthStr, revenue: monthRevenue };
        });
        
        // Generate yearly data
        const yearStart = startOfYear(subYears(now, 6));
        const yearEnd = endOfYear(now);
        const years = eachYearOfInterval({ start: yearStart, end: yearEnd });
        
        const yearlyData = years.map(year => {
          const yearStr = format(year, 'yyyy');
          const yearRevenue = combinedData
            .filter(item => item.date.getFullYear() === year.getFullYear())
            .reduce((sum, item) => sum + item.amount, 0);
          
          return { name: yearStr, revenue: yearRevenue };
        });
        
        setRevenueData({
          weekly: weeklyData,
          monthly: monthlyData,
          yearly: yearlyData
        });
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setRevenueData({
          weekly: [],
          monthly: [],
          yearly: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRevenueData();
  }, [user]);

  return {
    revenueData,
    isLoading
  };
}
