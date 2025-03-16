
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { RevenueChartContent } from './revenue-chart/RevenueChartContent';
import { useRevenueData } from './revenue-chart/useRevenueData';

export function RevenueChart() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [isAnimated, setIsAnimated] = useState(false);
  const { revenueData, isLoading } = useRevenueData();

  // Trigger animation when component is mounted
  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 100);
  }, []);

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
            <RevenueChartContent 
              data={revenueData.weekly} 
              isLoading={isLoading} 
            />
          </TabsContent>
          <TabsContent value="monthly" className="mt-0">
            <RevenueChartContent 
              data={revenueData.monthly} 
              isLoading={isLoading} 
            />
          </TabsContent>
          <TabsContent value="yearly" className="mt-0">
            <RevenueChartContent 
              data={revenueData.yearly} 
              isLoading={isLoading} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
