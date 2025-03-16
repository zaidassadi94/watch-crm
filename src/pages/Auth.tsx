
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/ui-custom/Logo';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="mb-8">
        <Logo />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Welcome to WatchShop Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm onSuccess={() => setActiveTab('login')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
