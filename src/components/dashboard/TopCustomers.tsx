
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Sample data for demonstration
const customersData = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex@example.com',
    totalSpent: 12450,
    type: 'VIP',
    lastPurchase: '2 days ago',
    avatarUrl: '',
  },
  {
    id: 2,
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    totalSpent: 8750,
    type: 'Regular',
    lastPurchase: '1 week ago',
    avatarUrl: '',
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael@example.com',
    totalSpent: 6320,
    type: 'VIP',
    lastPurchase: '3 days ago',
    avatarUrl: '',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@example.com',
    totalSpent: 5890,
    type: 'Regular',
    lastPurchase: '5 days ago',
    avatarUrl: '',
  },
];

export function TopCustomers() {
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger animation when component is mounted
  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 400);
  }, []);

  return (
    <Card className={cn(
      "transition-all duration-300", 
      isAnimated ? "opacity-100" : "opacity-0 translate-y-4"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Top Customers
        </CardTitle>
        <Button variant="ghost" size="sm" className="gap-1 text-xs h-8">
          View All <ChevronRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-5">
          {customersData.map((customer) => (
            <div key={customer.id} className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{customer.name}</p>
                    {customer.type === 'VIP' && (
                      <Badge variant="default" className="bg-brand-500 text-[10px] px-1.5 py-0">VIP</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{customer.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">₹{customer.totalSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Last purchase: {customer.lastPurchase}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
