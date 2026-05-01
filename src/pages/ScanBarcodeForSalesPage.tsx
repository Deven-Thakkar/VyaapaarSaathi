import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/context/ProfileContext";
import { supabase } from "@/lib/supabase";
import BarcodeScanner from "@/components/BarcodeScanner";
import { ArrowLeft, AlertCircle, Trash2, Plus, Minus, Check, Loader2, X } from "lucide-react";
import { API_BASE } from "@/lib/chatbot-api";
import { useUpgradeModal } from "@/context/UpgradeModalContext";

interface CartItem {
  barcode: string;
  productName: string;
  price: number;
  quantity: number;
}

interface PendingProduct {
  barcode: string;
  productName: string;
  image?: string;
  price: number;
  quantity: number;
}

export default function ScanBarcodeForSalesPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { showUpgrade } = useUpgradeModal();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pendingProduct, setPendingProduct] = useState<PendingProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile.businessId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card/50 p-4 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-card rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">Business Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6">Please log in to your account first.</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // When a barcode is detected — look up product from Barcode Lookup API
  const handleBarcodeScan = useCallback(async (barcode: string) => {
    console.log("🔍 Barcode detected:", barcode);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/barcode-lookup?barcode=${barcode}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 429 || data.code === "RATE_LIMIT_UPGRADE") {
          showUpgrade("barcode scanning");
          return;
        }
        setError(`Product not found for barcode: ${barcode}`);
        setIsLoading(false);
        return;
      }

      setPendingProduct({
        barcode,
        productName: data.productName || "Unknown Product",
        image: data.image || undefined,
        price: data.price || 0,
        quantity: 1,
      });
    } catch (err) {
      console.error("Barcode lookup error:", err);
      setError("Failed to look up product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Confirm and add to cart
  const handleConfirmProduct = () => {
    if (!pendingProduct) return;

    if (pendingProduct.price <= 0) {
      setError("Please enter a valid price");
      return;
    }
    if (pendingProduct.quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    const existingIndex = cartItems.findIndex((item) => item.barcode === pendingProduct.barcode);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += pendingProduct.quantity;
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, pendingProduct]);
    }

    setPendingProduct(null);
    setError(null);
  };

  const updateQuantity = (barcode: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.barcode !== barcode));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.barcode === barcode ? { ...item, quantity: newQuantity } : item))
      );
    }
  };

  const removeItem = (barcode: string) => {
    setCartItems((prev) => prev.filter((item) => item.barcode !== barcode));
  };

  // Complete sale and save to Supabase
  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      alert("Please add items before completing the sale");
      return;
    }

    setIsSubmitting(true);
    try {
      const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const { error: saleError } = await supabase.from("sales").insert({
        business_id: profile.businessId,
        total_amount: totalAmount,
        Date: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
      });

      if (saleError) throw new Error("Failed to create sale: " + saleError.message);

      alert(`✅ Sale completed! ${cartItems.length} item(s) sold for ₹${totalAmount.toFixed(2)}`);
      navigate("/sales");
    } catch (err) {
      console.error("Error completing sale:", err);
      alert("Failed to complete sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/50 pb-40">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/sales")}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Scan Barcode</h1>
            <p className="text-xs text-muted-foreground">Scan products to add to sale</p>
          </div>
          {cartItems.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
              {cartItems.length} item{cartItems.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Loading state */}
        {isLoading && (
          <div className="bg-card rounded-2xl card-shadow-md p-6 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Looking up product...</p>
          </div>
        )}

        {/* Error message */}
        {error && !pendingProduct && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4">
            <p className="text-sm text-destructive font-medium">{error}</p>
            <p className="text-xs text-destructive/80 mt-1">Please scan another barcode</p>
          </div>
        )}

        {/* Pending Product Form */}
        {pendingProduct && (
          <div className="bg-card rounded-2xl card-shadow-md p-6 space-y-4 border-2 border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Barcode detected ✅</p>
                <h3 className="font-bold text-lg text-foreground">{pendingProduct.productName}</h3>
                <p className="text-xs font-mono text-muted-foreground">{pendingProduct.barcode}</p>
              </div>
              <button
                onClick={() => { setPendingProduct(null); setError(null); }}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pendingProduct.image && (
              <img
                src={pendingProduct.image}
                alt={pendingProduct.productName}
                className="w-full h-40 object-contain rounded-lg bg-muted"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}

            {/* Price & Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground">Price (₹)</label>
                <input
                  type="number"
                  value={pendingProduct.price || ""}
                  onChange={(e) =>
                    setPendingProduct((prev) =>
                      prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : prev
                    )
                  }
                  className="w-full mt-1 px-3 py-2.5 border-2 border-primary/30 rounded-lg bg-background text-foreground focus:border-primary outline-none transition-colors"
                  placeholder="0.00"
                  step="0.01"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Quantity</label>
                <input
                  type="number"
                  value={pendingProduct.quantity}
                  onChange={(e) =>
                    setPendingProduct((prev) =>
                      prev ? { ...prev, quantity: parseInt(e.target.value) || 1 } : prev
                    )
                  }
                  className="w-full mt-1 px-3 py-2.5 border-2 border-primary/30 rounded-lg bg-background text-foreground focus:border-primary outline-none transition-colors"
                  min="1"
                />
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">
                ₹{(pendingProduct.price * pendingProduct.quantity).toFixed(2)}
              </span>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              onClick={handleConfirmProduct}
              className="w-full bg-gradient-auth text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        )}

        {/* Scanner — always visible when no product is pending or loading */}
        {!pendingProduct && !isLoading && (
          <div className="bg-card rounded-2xl card-shadow-md p-6">
            <BarcodeScanner
              onResult={handleBarcodeScan}
              onError={(err) => { console.error("Scan error:", err); }}
            />
          </div>
        )}

        {/* Cart items */}
        {cartItems.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground">
              Cart ({cartItems.length} item{cartItems.length > 1 ? "s" : ""})
            </h2>
            {cartItems.map((item) => (
              <div
                key={item.barcode}
                className="bg-card rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Barcode: {item.barcode}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">₹{item.price.toFixed(2)} per unit</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.barcode)}
                    className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.barcode, item.quantity - 1)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.barcode, parseInt(e.target.value) || 1)}
                    className="w-12 h-8 text-center border border-border rounded px-2 bg-muted"
                    min="1"
                  />
                  <button
                    onClick={() => updateQuantity(item.barcode, item.quantity + 1)}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="ml-auto font-bold text-foreground">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed bottom CTA */}
      {cartItems.length > 0 && !pendingProduct && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur border-t border-border p-4">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between px-4 py-2 bg-card rounded-lg">
              <span className="font-semibold text-foreground">Total:</span>
              <span className="text-xl font-bold text-primary">₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCompleteSale}
              disabled={isSubmitting}
              className="w-full bg-gradient-auth text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving sale...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Complete Sale (₹{total.toFixed(2)})
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
