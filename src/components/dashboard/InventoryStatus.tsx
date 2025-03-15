
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Define data structure
interface StatusCount {
  name: string;
  value: number;
  color: string;
}

// Color mapping
const statusColors = {
  in_stock: '#4a85f0',
  low_stock: '#f59e0b',
  out_of_stock: '#ef4444',
};

// Status text mapping
const statusText = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="font-medium" style={{ color: payload[0].payload.color }}>
          {payload[0].name}
        </p>
        <p className="text-foreground">
          Quantity: {payload[0].value}
        </p>
      </div>
    );
  }

  return null;
};

export function InventoryStatus() {
  const { user } = useAuth();
  const [isAnimated, setIsAnimated] = useState(false);
  const [inventoryData, setInventoryData] = useState<StatusCount[]>([
    { name: 'In Stock', value: 0, color: statusColors.in_stock },
    { name: 'Low Stock', value: 0, color: statusColors.low_stock },
    { name: 'Out of Stock', value: 0, color: statusColors.out_of_stock },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch inventory status data
  useEffect(() => {
    async function fetchInventoryStatus() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('stock_status')
          .eq('user_id', user.id);

        if (error) throw error;

        // Count items by status
        const counts: Record<string, number> = {
          in_stock: 0,
          low_stock: 0,
          out_of_stock: 0,
        };

        data.forEach(item => {
          if (counts[item.stock_status] !== undefined) {
            counts[item.stock_status]++;
          }
        });

        // Transform to chart data format
        const chartData: StatusCount[] = Object.entries(counts).map(([status, count]) => ({
          name: statusText[status as keyof typeof statusText] || status,
          value: count,
          color: statusColors[status as keyof typeof statusColors] || '#888',
        }));

        setInventoryData(chartData);
      } catch (error) {
        console.error('Error fetching inventory status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInventoryStatus();
    // Trigger animation when component is mounted
    setTimeout(() => setIsAnimated(true), 200);
  }, [user]);

  return (
    <Card className={cn(
      "transition-all duration-300", 
      isAnimated ? "opacity-100" : "opacity-0 translate-y-4"
    )}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Inventory Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[260px] flex items-center justify-center">
          {isLoading ? (
            <div className="text-muted-foreground">Loading inventory data...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-sm text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 mt-2">
          {inventoryData.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-sm font-medium" style={{ color: item.color }}>
                {item.name}
              </p>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
