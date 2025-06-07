
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Accounting from "./pages/Accounting";
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
              <Route path="/accounting" element={<Accounting />} />
              {/* Rutas de módulos - se expandirán según necesidad */}
              <Route path="/inventory" element={<Dashboard />} />
              <Route path="/locations" element={<Dashboard />} />
              <Route path="/putaway" element={<Dashboard />} />
              <Route path="/stock-movements" element={<Dashboard />} />
              <Route path="/picking" element={<Dashboard />} />
              <Route path="/scanner" element={<Dashboard />} />
              <Route path="/loading" element={<Dashboard />} />
              <Route path="/docks" element={<Dashboard />} />
              <Route path="/customers" element={<Dashboard />} />
              <Route path="/ecommerce" element={<Dashboard />} />
              <Route path="/chat" element={<Dashboard />} />
              <Route path="/users" element={<Dashboard />} />
              <Route path="/reports" element={<Dashboard />} />
              <Route path="/help" element={<Dashboard />} />
              <Route path="/settings" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
