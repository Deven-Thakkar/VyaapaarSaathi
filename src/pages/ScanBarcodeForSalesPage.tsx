import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/context/ProfileContext";
import { supabase } from "@/lib/supabase";
import BarcodeScanner from "@/components/BarcodeScanner";
import { ArrowLeft, AlertCircle, Trash2, Plus, Minus, Check, Loader2, X } from "lucide-react";

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useProfile();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pendingProduct, setPendingProduct] = useState<PendingProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Handle barcode scan - look up in Barcode Lookup API
  const handleBarcodeScan = useCallback(async (barcode: string) => {
    console.log("🔍 Scanning barcode:", barcode);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/barcode-lookup?barcode=${barcode}`);
      const data = await response.json();

      console.log("📡 API Response:", { status: response.status, data });

      if (!response.ok || !data.success) {
        const errorMsg = `Barcode ${barcode} not found in database. You can still add it manually.`;
        console.warn("⚠️", errorMsg);
        setError(errorMsg);
        // Still allow manual entry
        setPendingProduct({
          barcode,
          productName: "", // Empty - user must enter
          price: 0,
          quantity: 1,
        });
        return;
      }

      console.log("✅ Product found:", data.productName);
      // Set pending product with API data
      setPendingProduct({
        barcode,
        productName: data.productName,
        image: data.image,
        price: data.price || 0,
        quantity: 1,
      });
    } catch (err) {
      console.error("❌ Error looking up barcode:", err);
      setError("Failed to look up product. Please enter details manually.");
      setPendingProduct({
        barcode,
        productName: "", // Empty - user must enter
        price: 0,
        quantity: 1,
      });
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

    // Check if product already in cart
    const existingIndex = cartItems.findIndex((item) => item.barcode === pendingProduct.barcode);

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...cartItems];
      updated[existingIndex].quantity += pendingProduct.quantity;
      setCartItems(updated);
    } else {
      // Add new
      setCartItems([...cartItems, pendingProduct]);
    }

    setPendingProduct(null);
    setError(null);
  };

  // Update quantity
  const updateQuantity = (barcode: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(barcode);
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.barcode === barcode ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Remove item
  const removeItem = (barcode: string) => {
    setCartItems((prev) => prev.filter((item) => item.barcode !== barcode));
  };

  // Complete sale
  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      alert("Please add items before completing the sale");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total
      const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Create sale record
      const { error: saleError } = await supabase.from("sales").insert({
        business_id: profile.businessId,
        total_amount: totalAmount,
        Date: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
      });

      if (saleError) {
        throw new Error("Failed to create sale: " + saleError.message);
      }

      alert(`✅ Sale completed! ${cartItems.length} items sold for ₹${totalAmount.toFixed(2)}`);
      navigate("/sales");
    } catch (err) {
      console.error("Error completing sale:", err);
      alert("Failed to complete sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/50 pb-24">
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
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Pending Product Form */}
        {pendingProduct ? (
          <div className="bg-card rounded-2xl card-shadow-md p-6 mb-6 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground">Confirm Product</h3>
              <button
                onClick={() => setPendingProduct(null)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product image (if available) */}
            {pendingProduct.image && (
              <img
                src={pendingProduct.image}
                alt={pendingProduct.productName}
                className="w-full h-40 object-cover rounded-lg"
              />
            )}

            {/* Barcode display */}
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Scanned Barcode</p>
              <p className="font-bold text-lg text-foreground font-mono">{pendingProduct.barcode}</p>
            </div>

            {/* Product details */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Product Name</label>
                <input
                  type="text"
                  value={pendingProduct.productName}
                  onChange={(e) =>
                    setPendingProduct((prev) =>
                      prev ? { ...prev, productName: e.target.value } : prev
                    )
                  }
                  className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Price (₹)</label>
                  <input
                    type="number"
                    value={pendingProduct.price || ""}
                    onChange={(e) =>
                      setPendingProduct((prev) =>
                        prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : prev
                      )
                    }
                    className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Quantity</label>
                  <input
                    type="number"
                    value={pendingProduct.quantity}
                    onChange={(e) =>
                      setPendingProduct((prev) =>
                        prev ? { ...prev, quantity: parseInt(e.target.value) || 1 } : prev
                      )
                    }
                    className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    min="1"
                  />
                </div>
              </div>

              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Total:</p>
                <p className="text-lg font-bold text-foreground">
                  ₹{(pendingProduct.price * pendingProduct.quantity).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={handleConfirmProduct}
              className="w-full bg-gradient-auth text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        ) : (
          <>
            {/* Scanner */}
            {cartItems.length === 0 ? (
              <div className="bg-card rounded-2xl card-shadow-md p-6">
                <BarcodeScanner
                  onResult={handleBarcodeScan}
                  onError={(err) => {
                    console.error("Scan error:", err);
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setCartItems([])}
                className="w-full mb-4 px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors"
              >
                Start over (clear cart)
              </button>
            )}

            {/* Error display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Looking up product...
              </div>
            )}
          </>
        )}

        {/* Cart items */}
        {cartItems.length > 0 && !pendingProduct && (
          <div className="space-y-4 mb-6">
            <h2 className="font-semibold text-foreground">Cart ({cartItems.length} items)</h2>
            {cartItems.map((item) => (
              <div
                key={item.barcode}
                className="bg-card rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Barcode: {item.barcode}</p>
                    <p className="text-sm text-muted-foreground mt-1">₹{item.price.toFixed(2)} per unit</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.barcode)}
                    className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity controls */}
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
                  <span className="ml-auto font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total and CTA */}
        {cartItems.length > 0 && !pendingProduct && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border p-4">
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="flex items-center justify-between px-4 py-2 bg-card rounded-lg">
                <span className="font-semibold text-foreground">Total:</span>
                <span className="text-lg font-bold text-primary">₹{total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCompleteSale}
                disabled={isSubmitting}
                className="w-full bg-gradient-auth text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Complete Sale
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
