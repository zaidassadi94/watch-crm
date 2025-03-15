
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, subMonths, subYears, startOfWeek, endOfWeek, eachDayOfInterval, 
  startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear, eachYearOfInterval } from 'date-fns';

// Type for revenue data
interface RevenueItem {
  name: string;
  revenue: number;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-primary">
          Revenue: ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

export function RevenueChart() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [isAnimated, setIsAnimated] = useState(false);
  const [revenueData, setRevenueData] = useState<{
    weekly: RevenueItem[];
    monthly: RevenueItem[];
    yearly: RevenueItem[];
  }>({
    weekly: [],
    monthly: [],
    yearly: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Trigger animation when component is mounted
  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 100);
  }, []);

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

  const renderChart = (data: RevenueItem[]) => (
    <ResponsiveContainer width="100%" height={300}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading revenue data...</p>
        </div>
      ) : (
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4a85f0" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4a85f0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#4a85f0" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            animationDuration={1500}
          />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );

  return (
    <Card className={cn(
      "transition-all duration-300", 
      isAnimated ? "opacity-100" : "opacity-0 translate-y-4"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Revenue Overview</CardTitle>
        <Tabs
          defaultValue="weekly"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-auto"
        >
          <TabsList className="bg-muted/50">
            <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="text-xs">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab} className="mt-0">
          <TabsContent value="weekly" className="mt-0">
            {renderChart(revenueData.weekly)}
          </TabsContent>
          <TabsContent value="monthly" className="mt-0">
            {renderChart(revenueData.monthly)}
          </TabsContent>
          <TabsContent value="yearly" className="mt-0">
            {renderChart(revenueData.yearly)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
