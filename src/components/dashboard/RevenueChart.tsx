
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

// Sample data for demonstration
const revenueData = {
  weekly: [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ],
  monthly: [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
    { name: 'Aug', revenue: 4000 },
    { name: 'Sep', revenue: 3300 },
    { name: 'Oct', revenue: 2700 },
    { name: 'Nov', revenue: 3200 },
    { name: 'Dec', revenue: 4100 },
  ],
  yearly: [
    { name: '2017', revenue: 32000 },
    { name: '2018', revenue: 38000 },
    { name: '2019', revenue: 35000 },
    { name: '2020', revenue: 28000 },
    { name: '2021', revenue: 34000 },
    { name: '2022', revenue: 42000 },
    { name: '2023', revenue: 48000 },
  ],
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-primary">
          Revenue: ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

export function RevenueChart() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger animation when component is mounted
  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 100);
  }, []);

  const renderChart = (data: typeof revenueData.weekly) => (
    <ResponsiveContainer width="100%" height={300}>
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
          tickFormatter={(value) => `$${value}`}
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
