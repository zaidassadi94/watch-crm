
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Bell, Search, User,
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/useSettings';

export function Navbar() {
  const location = useLocation();
  const [title, setTitle] = useState('');
  const { settings, isLoading } = useSettings();

  useEffect(() => {
    const getTitle = () => {
      switch (location.pathname) {
        case '/dashboard':
          return 'Dashboard';
        case '/customers':
          return 'Customer Management';
        case '/inventory':
          return 'Inventory Management';
        case '/sales':
          return 'Sales Management';
        case '/services':
          return 'Service Management';
        default:
          return 'WatchCRM';
      }
    };

    setTitle(getTitle());
  }, [location.pathname]);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-foreground">
            {title}
          </h1>
          <div className="hidden md:flex relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 w-[240px] bg-muted/30 border-muted focus:bg-background"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative animate-fade-in">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">
                3
              </Badge>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="hidden md:inline-block font-medium">
                  {!isLoading ? settings.company_name : 'Loading...'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 animate-fade-in">
              <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
