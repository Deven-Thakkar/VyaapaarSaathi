import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/context/ProfileContext";
import { getProductsByBusiness, Product } from "@/lib/products-api";
import { createSaleWithItems } from "@/lib/sales-api";
import { ArrowLeft, AlertCircle, ChevronDown, Package, Trash2, Plus } from "lucide-react";

interface CartItem {
  product: Product;
  quantity: number;
  priceAtSale: number;
}

export default function AddManualSalesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useProfile();

  // Check if businessId exists
  if (!profile.businessId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card/50 p-4 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-card rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">Business Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Please log in to your account first.
          </p>
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

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("");
  const [priceAtSale, setPriceAtSale] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await getProductsByBusiness(profile.businessId!);
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [profile.businessId]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setPriceAtSale(product.price.toString());
    setShowProductDropdown(false);
    setSearchTerm("");
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !quantity) {
      alert("Please select product and enter quantity");
      return;
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    if (qty > selectedProduct.stock) {
      alert(`Only ${selectedProduct.stock} units available`);
      return;
    }

    const price = Number(priceAtSale) || selectedProduct.price;

    // Check if product already in cart
    const existingIndex = cart.findIndex((item) => item.product.id === selectedProduct.id);
    if (existingIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += qty;
      updatedCart[existingIndex].priceAtSale = price;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product: selectedProduct, quantity: qty, priceAtSale: price }]);
    }

    // Reset form
    setSelectedProduct(null);
    setQuantity("");
    setPriceAtSale("");
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert("Please add at least one item to the sale");
      return;
    }

    try {
      setIsSubmitting(true);

      const saleItems = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        priceAtSale: item.priceAtSale,
      }));

      await createSaleWithItems(profile.businessId!, saleItems, vendorName || undefined, saleDate);

      alert("Sale completed successfully!");
      navigate("/sales");
    } catch (error) {
      console.error("Failed to complete sale:", error);
      alert("Failed to complete sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.priceAtSale, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 mt-4">
          <button
            onClick={() => navigate("/sales")}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {t("sales.manualEntry") || "Manual Sales Entry"}
            </h1>
            <p className="text-xs text-muted-foreground">Add items to create a sale</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl card-shadow-md p-5 space-y-4">
              {/* Sale Info */}
              <div className="border-b border-border pb-4">
                <h2 className="text-sm font-bold text-foreground mb-3">Sale Information</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      {t("sales.vendorName") || "Vendor Name"} (Optional)
                    </label>
                    <input
                      type="text"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="e.g., Retail Customer"
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      {t("sales.date") || "Sale Date"}
                    </label>
                    <input
                      type="date"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Add Product */}
              <div className="border-b border-border pb-4">
                <h2 className="text-sm font-bold text-foreground mb-3">Add Items</h2>
                <div className="space-y-3">
                  {/* Product Selection */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                      {t("sales.selectProduct") || "Select Product"} *
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowProductDropdown(!showProductDropdown);
                          setSearchTerm("");
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm flex items-center justify-between hover:bg-muted/80 transition-colors"
                      >
                        <span className={selectedProduct ? "font-medium" : "text-muted-foreground"}>
                          {selectedProduct ? selectedProduct.name : "Choose a product..."}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${showProductDropdown ? "rotate-180" : ""}`}
                        />
                      </button>

                      {showProductDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg z-10 shadow-lg">
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            className="w-full px-3 py-2 border-b border-border bg-muted text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none rounded-t-lg"
                          />
                          <div className="max-h-48 overflow-y-auto">
                            {loading ? (
                              <div className="px-3 py-4 text-center text-muted-foreground text-sm">Loading...</div>
                            ) : filteredProducts.length === 0 ? (
                              <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                                No products found
                              </div>
                            ) : (
                              filteredProducts.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => handleSelectProduct(p)}
                                  className="w-full px-3 py-3 text-left hover:bg-muted border-b border-border/50 last:border-b-0 transition-colors"
                                >
                                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                    <span>Stock: {p.stock}</span>
                                    <span>₹{p.price.toFixed(2)}</span>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                        {t("sales.quantity") || "Quantity"} *
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        disabled={!selectedProduct}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                        {t("sales.pricePerUnit") || "Price per Unit"} (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={priceAtSale}
                        onChange={(e) => setPriceAtSale(e.target.value)}
                        disabled={!selectedProduct}
                        placeholder="0.00"
                        className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedProduct || !quantity}
                    className="w-full bg-success text-white py-2 rounded-lg font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t("sales.addToCart") || "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl card-shadow-md p-5 sticky top-4">
              <h2 className="text-sm font-bold text-foreground mb-4">
                {t("sales.cart") || "Sale Summary"}
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No items yet</p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-muted rounded-lg p-2.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{item.product.name}</p>
                          <p className="text-muted-foreground mt-0.5">
                            {item.quantity} × ₹{item.priceAtSale.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-right text-foreground font-bold">
                        ₹{(item.quantity * item.priceAtSale).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-primary">₹{totalAmount.toFixed(2)}</p>
              </div>

              {/* Complete Sale Button */}
              <button
                onClick={handleCompleteSale}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full bg-gradient-auth text-primary-foreground py-2.5 rounded-lg font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {isSubmitting ? "Completing..." : "Complete Sale"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
