
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import i18n from './lib/i18n'; // Import i18n instance
import { useState, useEffect } from 'react';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Locations from "./pages/Locations";
import Suppliers from "./pages/Suppliers";
import Picking from "./pages/Picking";
import StockMove from "./pages/StockMove";
import Scanner from "./pages/Scanner";
import PutAway from "./pages/PutAway";
import Loading from "./pages/Loading";
import Users from "./pages/Users";
import Customers from "./pages/Customers";
import Ecommerce from "./pages/Ecommerce";
import Accounting from "./pages/Accounting";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  const [locale, setLocale] = useState(i18n.language);

  useEffect(() => {
    const onLanguageChanged = (lng: string) => {
      setLocale(lng);
    };
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter key={locale}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/locations" element={<Locations />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/picking" element={<Picking />} />
                <Route path="/stock-move" element={<StockMove />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/putaway" element={<PutAway />} />
                <Route path="/loading" element={<Loading />} />
                <Route path="/users" element={<Users />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/ecommerce" element={<Ecommerce />} />
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
