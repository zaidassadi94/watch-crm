
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecondaryValue {
  label: string;
  value: string;
}

interface StatCardProps {
  title: string;
  value: string;
  secondaryValues?: SecondaryValue[];
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  secondaryValues,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon && <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent">{icon}</div>}
        </div>
        <div className="mt-2 flex flex-col">
          <span className="text-2xl font-bold">{value}</span>
          
          {secondaryValues && secondaryValues.length > 0 && (
            <div className="mt-1 space-y-1">
              {secondaryValues.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.label}:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {trend && (
            <div className="mt-1 flex items-center">
              {trend.positive ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={cn("text-xs font-medium", trend.positive ? "text-green-500" : "text-red-500")}>
                {trend.value}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
