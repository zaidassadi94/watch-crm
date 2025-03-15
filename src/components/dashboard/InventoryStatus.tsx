
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

// Sample data for demonstration
const inventoryData = [
  { name: 'In Stock', value: 120, color: '#4a85f0' },
  { name: 'Low Stock', value: 30, color: '#f59e0b' },
  { name: 'Out of Stock', value: 15, color: '#ef4444' },
];

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
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger animation when component is mounted
  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 200);
  }, []);

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
