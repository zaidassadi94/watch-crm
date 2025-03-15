
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: string | number;
  name: string;
  email: string | null;
  totalSpent: number;
  type: string;
  lastPurchase: string;
  avatarUrl: string | null;
}

export function TopCustomers() {
  const [isAnimated, setIsAnimated] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Trigger animation when component is mounted
  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 400);
  }, []);

  useEffect(() => {
    const fetchTopCustomers = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch sales data
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('customer_name, customer_email, customer_phone, created_at, total_amount')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (salesError) throw salesError;
        
        // Fetch service data
        const { data: serviceData, error: serviceError } = await supabase
          .from('service_requests')
          .select('customer_name, customer_email, customer_phone, created_at, price')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (serviceError) throw serviceError;
        
        // Combine and process customer data
        const combinedData = [...(salesData || []), ...(serviceData || [])];
        const customerMap = new Map();
        
        combinedData.forEach(item => {
          const key = item.customer_name?.toLowerCase() || 'unknown';
          const amount = 'total_amount' in item ? Number(item.total_amount || 0) : Number(item.price || 0);
          
          if (!customerMap.has(key)) {
            customerMap.set(key, {
              id: key,
              name: item.customer_name || 'Unknown',
              email: item.customer_email || null,
              totalSpent: amount,
              type: amount > 5000 ? 'VIP' : 'Regular',
              lastPurchase: item.created_at,
              avatarUrl: null
            });
          } else {
            const existingCustomer = customerMap.get(key);
            existingCustomer.totalSpent += amount;
            
            // Update type if customer becomes VIP
            if (existingCustomer.totalSpent > 5000) {
              existingCustomer.type = 'VIP';
            }
            
            // Update last purchase date if more recent
            if (new Date(item.created_at) > new Date(existingCustomer.lastPurchase)) {
              existingCustomer.lastPurchase = item.created_at;
            }
          }
        });
        
        // Sort customers by total spent and get top 4
        const sortedCustomers = Array.from(customerMap.values())
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 4);
        
        setCustomers(sortedCustomers);
      } catch (error) {
        console.error('Error fetching top customers:', error);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopCustomers();
  }, [user]);

  // Calculate time since last purchase
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <Card className={cn(
      "transition-all duration-300", 
      isAnimated ? "opacity-100" : "opacity-0 translate-y-4"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Top Customers
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-xs h-8"
          onClick={() => navigate('/customers')}
        >
          View All <ChevronRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-5">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex items-start justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted"></div>
                  <div>
                    <div className="h-4 w-24 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-32 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-16 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-24 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : customers.length > 0 ? (
          <div className="space-y-5">
            {customers.map((customer, index) => (
              <div key={index} className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={customer.avatarUrl || ''} alt={customer.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {customer.name?.split(' ').map(n => n[0]).join('') || '??'}
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
                  <p className="text-xs text-muted-foreground">
                    Last purchase: {getTimeAgo(customer.lastPurchase)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-muted-foreground text-sm">No customer data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
