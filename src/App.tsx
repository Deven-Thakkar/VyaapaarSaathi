import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileProvider } from "./context/ProfileContext";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AddPage from "./pages/AddPage";
import VoiceEntryPage from "./pages/VoiceEntryPage";
import ScanBillPage from "./pages/ScanBillPage";
import ScanBillForInventoryPage from "./pages/ScanBillForInventoryPage";
import ScanBillForSalesPage from "./pages/ScanBillForSalesPage";
import SalesPage from "./pages/SalesPage";
import AddManualSalesPage from "./pages/AddManualSalesPage";
import InventoryPage from "./pages/InventoryPage";
import AddProductPage from "./pages/AddProductPage";
import AddManualStockPage from "./pages/AddManualStockPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import UdhaariPage from "./pages/UdhaariPage";
import TransactionsPage from "./pages/TransactionsPage";
import AiPage from "./pages/AiPage";
import SettingsPage from "./pages/SettingsPage";
import InsightsPage from "./pages/InsightsPage";
import CustomersPage from "./pages/CustomersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProfileProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/add" element={<AddPage />} />
            <Route path="/add/voice" element={<VoiceEntryPage />} />
            <Route path="/add/scan" element={<ScanBillPage />} />
            <Route path="/add/sales/manual" element={<AddManualSalesPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/sales/scan" element={<ScanBillForSalesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/add" element={<AddProductPage />} />
            <Route path="/inventory/manual-entry" element={<AddManualStockPage />} />
            <Route path="/inventory/scan" element={<ScanBillForInventoryPage />} />
            <Route path="/inventory/:id" element={<ProductDetailPage />} />
            <Route path="/udhaari" element={<UdhaariPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/ai" element={<AiPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProfileProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
