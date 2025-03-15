
import { ReactNode, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  // Add a subtle animation when the route changes
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.classList.add('opacity-0');
      setTimeout(() => {
        mainContent.classList.remove('opacity-0');
        mainContent.classList.add('animate-fade-in');
      }, 50);
      setTimeout(() => {
        mainContent.classList.remove('animate-fade-in');
      }, 500);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main 
          id="main-content" 
          className="flex-1 overflow-auto p-6 transition-opacity duration-300"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
