
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Shield, BarChart2, Users, Package2, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <Clock className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">WatchCRM</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Login
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 flex-1 flex items-center">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div 
              className={cn(
                "inline-block mb-4 px-4 py-1.5 bg-primary/10 text-primary rounded-full transition-all duration-700",
                isLoaded ? "opacity-100" : "opacity-0 transform translate-y-4"
              )}
            >
              <span className="text-sm font-medium">Specialized for Watch Retailers</span>
            </div>
            <h1 
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight transition-all duration-700 delay-100",
                isLoaded ? "opacity-100" : "opacity-0 transform translate-y-4"
              )}
            >
              Streamlined CRM for<br />Watch Businesses
            </h1>
            <p 
              className={cn(
                "text-xl text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200",
                isLoaded ? "opacity-100" : "opacity-0 transform translate-y-4"
              )}
            >
              A complete solution to manage sales, inventory, service requests, and customer relationships for watch retailers.
            </p>
            <div 
              className={cn(
                "flex flex-col sm:flex-row gap-4 justify-center pt-4 transition-all duration-700 delay-300",
                isLoaded ? "opacity-100" : "opacity-0 transform translate-y-4"
              )}
            >
              <Button size="lg" onClick={() => navigate('/dashboard')} className="gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')}>
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">All-in-One Solution</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run your watch business efficiently in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <BarChart2 className="w-6 h-6" />,
                title: 'Analytics Dashboard',
                description: 'Get a clear view of your business performance with intuitive visualizations and metrics.'
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Customer Management',
                description: 'Build stronger relationships by tracking customer preferences and purchase history.'
              },
              {
                icon: <Package2 className="w-6 h-6" />,
                title: 'Inventory Control',
                description: 'Keep track of your watch inventory with real-time stock levels and alerts.'
              },
              {
                icon: <Wrench className="w-6 h-6" />,
                title: 'Service Tracking',
                description: 'Manage watch repairs and services efficiently with detailed status tracking.'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className={cn(
                  "bg-background border border-border rounded-lg p-6 transition-all duration-500",
                  isLoaded ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8",
                  {"delay-100": index === 0},
                  {"delay-200": index === 1},
                  {"delay-300": index === 2},
                  {"delay-400": index === 3},
                )}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-10 max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Watch Business?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join other watch retailers who have streamlined their operations with WatchCRM.
            </p>
            <Button size="lg" onClick={() => navigate('/dashboard')} className="gap-2">
              Start Now <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary">
                <Clock className="w-3 h-3 text-primary-foreground" />
              </div>
              <p className="text-sm font-medium">WatchCRM</p>
            </div>
            <p className="text-sm text-muted-foreground">© 2023 WatchCRM. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
