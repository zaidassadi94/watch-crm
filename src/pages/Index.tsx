
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/ui-custom/Logo';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
      setIsLoading(false);
    };

    checkSession();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <h1 className="text-5xl font-bold tracking-tight">
          Complete Watch Shop Management Solution
        </h1>
        
        <p className="text-xl text-muted-foreground">
          Manage your inventory, sales, customers, and service requests in one place.
          Built for watch shops and luxury retailers.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link to="/auth">Login to Dashboard</Link>
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <Link to="/auth?tab=signup">Create an Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
