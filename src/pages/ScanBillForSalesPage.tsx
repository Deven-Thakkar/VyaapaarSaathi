import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/context/ProfileContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, AlertCircle, Check, Upload, Loader2, Eye, Package } from "lucide-react";

interface ExtractedItem {
  productName: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  vendor: string;
  invoice_number: string;
  order_date: string;
  amount: number;
  products: ExtractedItem[];
}

export default function ScanBillForSalesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if businessId exists
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

  const [step, setStep] = useState<"upload" | "extract" | "processing">("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file upload - send to backend API
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Create FormData and send to backend
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading file to backend...");
      const response = await fetch("/api/process-invoice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process invoice");
      }

      const result = await response.json();
      console.log("Invoice data received:", result.data);

      // Store full invoice data
      setInvoiceData(result.data);

      // Extract products from response
      const products = result.data.products || [];
      
      // Show preview of the first page
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      setExtractedItems(products);
      setExtractedText(JSON.stringify(result.data, null, 2));
      setStep("extract");
    } catch (error) {
      console.error("File processing error:", error);
      alert("Failed to process file. Please try another file.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm and add to sales
  const handleConfirm = async () => {
    if (!invoiceData || extractedItems.length === 0) {
      alert("No invoice data. Please try scanning again.");
      return;
    }

    setIsSubmitting(true);
    setStep("processing");

    try {
      // Create a sale record in Supabase
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          business_id: profile.businessId,
          total_amount: invoiceData.amount,
          Vendor: invoiceData.vendor,
          Date: invoiceData.order_date,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saleError) {
        throw new Error("Failed to create sale: " + saleError.message);
      }

      // Note: We're storing the invoice metadata and extracted products for reference
      console.log("✅ Sale created successfully:", {
        saleId: saleData.id,
        vendor: invoiceData.vendor,
        invoiceNumber: invoiceData.invoice_number,
        invoiceDate: invoiceData.order_date,
        totalAmount: invoiceData.amount,
        itemsCount: extractedItems.length,
        items: extractedItems,
      });

      alert(`✅ Successfully added sale from ${invoiceData.vendor} with ${extractedItems.length} products for ₹${invoiceData.amount}!`);
      navigate("/sales");
    } catch (error) {
      console.error("Failed to add sale:", error);
      alert("Failed to add sale. Please try again.");
      setStep("extract");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 mt-4">
          <button
            onClick={() => {
              if (step === "upload") navigate("/sales");
              else setStep("upload");
            }}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {t("sales.scanBill") || "Scan Bill"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {step === "upload" && "Upload bill image or PDF to record sale"}
              {step === "extract" && "Review extracted sale details"}
              {step === "processing" && "Adding sale..."}
            </p>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="bg-card rounded-2xl card-shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Upload Bill Image or PDF</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Take a photo or upload a PDF/image of the bill to record the sale
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleImageUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full bg-gradient-auth text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {isProcessing ? "Processing..." : "Choose Image or PDF"}
            </button>
          </div>
        )}

        {/* Step 2: Extract */}
        {step === "extract" && (
          <div className="space-y-4">
            {/* Invoice Details */}
            {invoiceData && (
              <div className="bg-gradient-to-br from-green-50/40 to-green-50/20 dark:from-green-950/20 dark:to-green-950/10 rounded-2xl card-shadow-md p-4 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Sale Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Vendor/Buyer:</span>
                    <span className="font-medium text-foreground">{invoiceData.vendor}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Invoice #:</span>
                    <span className="font-medium text-foreground font-mono text-xs">{invoiceData.invoice_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium text-foreground">{invoiceData.order_date}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-green-200 dark:border-green-800">
                    <span className="text-muted-foreground font-semibold">Total Amount:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">₹{invoiceData.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Text */}
            <div className="bg-card rounded-2xl card-shadow-md p-4">
              <h3 className="font-semibold text-foreground mb-2 text-sm">Extracted Text</h3>
              <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground max-h-32 overflow-y-auto font-mono whitespace-pre-wrap break-words">
                {extractedText || "No text extracted"}
              </div>
            </div>

            {/* Extracted Items */}
            {extractedItems.length > 0 && (
              <div className="bg-card rounded-2xl card-shadow-md p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm">
                  Found {extractedItems.length} items
                </h3>
                <div className="space-y-2">
                  {extractedItems.map((item, idx) => (
                    <div key={idx} className="bg-muted rounded-lg p-3">
                      <p className="font-medium text-foreground text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Qty: {item.quantity} | Price: ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={isSubmitting || extractedItems.length === 0}
              className="w-full bg-gradient-auth text-primary-foreground py-3 rounded-lg font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirm & Add to Sales
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === "processing" && (
          <div className="bg-card rounded-2xl card-shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Adding Sale...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we record the sale</p>
          </div>
        )}
      </div>
    </div>
  );
}
