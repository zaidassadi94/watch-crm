
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenueTooltip } from './RevenueTooltip';
import { RevenueItem } from './useRevenueData';

interface RevenueChartContentProps {
  data: RevenueItem[];
  isLoading: boolean;
}

export function RevenueChartContent({ data, isLoading }: RevenueChartContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Loading revenue data...</p>
      </div>
    );
  }

  return (
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
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip content={<RevenueTooltip />} />
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
}
