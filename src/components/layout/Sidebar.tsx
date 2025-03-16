
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, Package2, ShoppingCart, Wrench, 
  LayoutDashboard, ChevronLeft, ChevronRight, Clock,
  Settings, LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const navItems = [
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      path: '/customers', 
      name: 'Customers', 
      icon: Users 
    },
    { 
      path: '/inventory', 
      name: 'Inventory', 
      icon: Package2 
    },
    { 
      path: '/sales', 
      name: 'Sales', 
      icon: ShoppingCart 
    },
    { 
      path: '/services', 
      name: 'Services', 
      icon: Wrench 
    },
  ];

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleLogoutClick = async () => {
    await signOut();
  };

  return (
    <aside 
      className={cn(
        "bg-sidebar transition-all duration-300 ease-in-out border-r border-border flex flex-col h-screen",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center p-4 border-b border-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
            <Clock className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <h1 className="text-lg font-semibold text-sidebar-foreground">WatchCRM</h1>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "ml-auto text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "ml-0 mt-4"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  cn(
                    "flex items-center py-2 px-3 rounded-md text-sidebar-foreground transition-all duration-200",
                    {
                      "bg-sidebar-accent text-sidebar-primary font-medium": isActive,
                      "hover:bg-sidebar-accent/50": !isActive,
                      "justify-center px-2": collapsed
                    }
                  )
                }
              >
                <item.icon className={cn("w-5 h-5", location.pathname === item.path && "text-sidebar-primary")} />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50",
              collapsed && "justify-center px-0"
            )}
            onClick={handleSettingsClick}
          >
            <Settings className="w-5 h-5" />
            {!collapsed && <span className="ml-3">Settings</span>}
          </Button>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50",
              collapsed && "justify-center px-0"
            )}
            onClick={handleLogoutClick}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
