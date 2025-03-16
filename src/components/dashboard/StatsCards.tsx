
import { StatCard } from '@/components/ui-custom/StatCard';
import { IndianRupee, ShoppingCart, Package2, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  stats: {
    title: string;
    value: string;
    secondaryValues?: { label: string; value: string }[];
    icon: React.ReactNode;
    trend: { value: number; positive: boolean };
  }[];
  isLoaded: boolean;
}

export function StatsCards({ stats, isLoaded }: StatsCardsProps) {
  return (
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
          secondaryValues={stat.secondaryValues}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}
