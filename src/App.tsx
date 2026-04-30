import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AddPage from "./pages/AddPage";
import VoiceEntryPage from "./pages/VoiceEntryPage";
import ScanBillPage from "./pages/ScanBillPage";
import ScanBillForInventoryPage from "./pages/ScanBillForInventoryPage";
import ScanBillForSalesPage from "./pages/ScanBillForSalesPage";
import ScanBarcodeForSalesPage from "./pages/ScanBarcodeForSalesPage";
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

function P({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProfileProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/home" element={<P><HomePage /></P>} />
              <Route path="/insights" element={<P><InsightsPage /></P>} />
              <Route path="/customers" element={<P><CustomersPage /></P>} />
              <Route path="/add" element={<P><AddPage /></P>} />
              <Route path="/add/voice" element={<P><VoiceEntryPage /></P>} />
              <Route path="/add/scan" element={<P><ScanBillPage /></P>} />
              <Route path="/add/sales/manual" element={<P><AddManualSalesPage /></P>} />
              <Route path="/sales" element={<P><SalesPage /></P>} />
              <Route path="/sales/scan" element={<P><ScanBillForSalesPage /></P>} />
              <Route path="/sales/barcode" element={<P><ScanBarcodeForSalesPage /></P>} />
              <Route path="/inventory" element={<P><InventoryPage /></P>} />
              <Route path="/inventory/add" element={<P><AddProductPage /></P>} />
              <Route path="/inventory/manual-entry" element={<P><AddManualStockPage /></P>} />
              <Route path="/inventory/scan" element={<P><ScanBillForInventoryPage /></P>} />
              <Route path="/inventory/:id" element={<P><ProductDetailPage /></P>} />
              <Route path="/udhaari" element={<P><UdhaariPage /></P>} />
              <Route path="/transactions" element={<P><TransactionsPage /></P>} />
              <Route path="/ai" element={<P><AiPage /></P>} />
              <Route path="/settings" element={<P><SettingsPage /></P>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ProfileProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
