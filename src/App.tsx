
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Main application routes with layout */}
          <Route 
            path="/dashboard" 
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } 
          />
          <Route 
            path="/customers" 
            element={
              <MainLayout>
                <Customers />
              </MainLayout>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <MainLayout>
                <Inventory />
              </MainLayout>
            } 
          />
          <Route 
            path="/sales" 
            element={
              <MainLayout>
                <Sales />
              </MainLayout>
            } 
          />
          <Route 
            path="/services" 
            element={
              <MainLayout>
                <Services />
              </MainLayout>
            } 
          />
          
          {/* Not found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
