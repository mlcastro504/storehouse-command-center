import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Accounting from "./pages/Accounting";
import Ecommerce from "./pages/Ecommerce";
import Settings from "./pages/Settings";
import Locations from "./pages/Locations";
import PutAway from "./pages/PutAway";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/ecommerce" element={<Ecommerce />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/putaway" element={<PutAway />} />
              {/* Rutas de módulos - se expandirán según necesidad */}
              <Route path="/stock-movements" element={<Dashboard />} />
              <Route path="/picking" element={<Dashboard />} />
              <Route path="/scanner" element={<Dashboard />} />
              <Route path="/loading" element={<Dashboard />} />
              <Route path="/docks" element={<Dashboard />} />
              <Route path="/customers" element={<Dashboard />} />
              <Route path="/chat" element={<Dashboard />} />
              <Route path="/users" element={<Dashboard />} />
              <Route path="/reports" element={<Dashboard />} />
              <Route path="/help" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
