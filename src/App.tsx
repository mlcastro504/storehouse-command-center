
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
import StockMovements from "./pages/StockMovements";
import Scanner from "./pages/Scanner";
import Loading from "./pages/Loading";
import Customers from "./pages/Customers";
import Chat from "./pages/Chat";
import Users from "./pages/Users";
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
              <Route path="/stock-movements" element={<StockMovements />} />
              <Route path="/picking" element={<Dashboard />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/loading" element={<Loading />} />
              <Route path="/docks" element={<Loading />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/users" element={<Users />} />
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
