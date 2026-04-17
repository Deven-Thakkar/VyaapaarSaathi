import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/context/ProfileContext";
import { createProduct } from "@/lib/products-api";
import { ArrowLeft, Plus, AlertCircle } from "lucide-react";

export default function AddProductPage() {
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
            Please log in to your account first. Your business information will be loaded automatically.
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

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    price: "",
    stock: "",
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price) {
      alert(t("common.requiredFields") || "Name and Price are required");
      return;
    }

    try {
      setIsAdding(true);

      await createProduct({
        business_id: profile.businessId,
        name: formData.name,
        barcode: formData.barcode || undefined,
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
      });

      alert(t("inventory.productAdded") || "Product added successfully!");
      setFormData({
        name: "",
        barcode: "",
        price: "",
        stock: "",
      });
      navigate("/inventory");
    } catch (error) {
      console.error("Failed to add product:", error);
      alert(t("inventory.productAddError") || "Failed to add product");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 mt-4">
          <button
            onClick={() => navigate("/inventory")}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {t("inventory.addProduct") || "Add Product"}
            </h1>
            <p className="text-xs text-muted-foreground">Add a new item to your inventory</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl card-shadow-md p-5 space-y-4">
          {/* Product Name */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              {t("inventory.productName") || "Product Name"} *
            </label>
            <input
              type="text"
              placeholder="e.g., Basmati Rice 5kg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* SKU/Barcode */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              {t("inventory.barcode") || "Barcode"} (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., 123456789"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              {t("inventory.sellingPrice") || "Selling Price"} (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              {t("inventory.initialStock") || "Initial Stock"} (Optional)
            </label>
            <input
              type="number"
              placeholder="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAddProduct}
            disabled={isAdding || !formData.name.trim() || !formData.price}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? t("common.saving") || "Saving..." : t("inventory.addProduct") || "Add Product"}
          </button>

          {/* Info */}
          <div className="bg-info/10 border border-info/20 rounded-lg p-3 mt-4">
            <p className="text-xs text-info">
              💡 Set a Reorder Level to get alerts when stock runs low
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
