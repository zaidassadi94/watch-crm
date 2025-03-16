
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

export function RevenueTooltip({ 
  active, 
  payload, 
  label 
}: TooltipProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-primary">
          Revenue: ₹{payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
}
