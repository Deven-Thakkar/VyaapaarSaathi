import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/context/ProfileContext";
import { getProductsByBusiness, updateProductStock, Product } from "@/lib/products-api";
import { ArrowLeft, AlertCircle, Check, X, Upload, Loader2, Eye, Package } from "lucide-react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface ExtractedItem {
  productName: string;
  quantity: number;
  confidence: number;
}

interface ConfirmedItem {
  product: Product;
  scannedQuantity: number;
}

export default function ScanBillForInventoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const [step, setStep] = useState<"upload" | "preview" | "extract" | "confirm" | "processing">("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [confirmedItems, setConfirmedItems] = useState<ConfirmedItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProductForItem, setSelectedProductForItem] = useState<Map<number, Product>>(new Map());
  const [editingQuantities, setEditingQuantities] = useState<Map<number, number>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load products
  const loadProducts = async () => {
    try {
      const products = await getProductsByBusiness(profile.businessId!);
      setAllProducts(products);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  // Convert PDF to image (first page)
  const convertPdfToImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const pdfData = event.target?.result as ArrayBuffer;
          const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
          const page = await pdf.getPage(1);

          // Render page to canvas
          const canvas = canvasRef.current;
          if (!canvas) reject(new Error("Canvas not available"));

          const context = canvas.getContext("2d");
          if (!context) reject(new Error("Canvas context not available"));

          const scale = 2;
          const viewport = page.getViewport({ scale });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const imageData = canvas.toDataURL("image/png");
          resolve(imageData);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      let imageData: string;

      if (file.type === "application/pdf") {
        imageData = await convertPdfToImage(file);
      } else {
        // Handle regular image files
        imageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      }

      setSelectedImage(imageData);
      setStep("preview");
    } catch (error) {
      console.error("File processing error:", error);
      alert("Failed to process file. Please try another file.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract text using OCR (using Tesseract.js)
  const extractTextFromImage = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    try {
      // Perform OCR
      const result = await Tesseract.recognize(selectedImage, "eng", {
        logger: (m) => console.log("OCR Progress:", m),
      });

      const text = result.data.text;
      setExtractedText(text);

      // Parse extracted text to find quantities
      const items = parseInvoiceText(text);
      setExtractedItems(items);
      await loadProducts();
      setStep("extract");
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Failed to extract text from image. Please ensure tesseract.js is properly installed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple parser to extract quantities from text
  const parseInvoiceText = (text: string): ExtractedItem[] => {
    const lines = text.split("\n");
    const items: ExtractedItem[] = [];

    lines.forEach((line) => {
      // Pattern: look for numbers that might be quantities
      // Examples: "Rice 5", "Sugar - 2kg", "5 x Basmati"
      const quantityPatterns = [
        /(\d+)\s*(?:x|×)?\s*([a-zA-Z\s]+)/i, // "5 x Product"
        /([a-zA-Z\s]+)\s*[-:]\s*(\d+)/i, // "Product - 5"
        /(\d+)\s+(?:kg|pieces?|units?|packets?)\s+([a-zA-Z\s]+)/i, // "5 kg Product"
      ];

      for (const pattern of quantityPatterns) {
        const match = line.match(pattern);
        if (match) {
          let productName = "";
          let quantity = 0;

          if (pattern === quantityPatterns[0]) {
            quantity = parseInt(match[1]);
            productName = match[2]?.trim();
          } else if (pattern === quantityPatterns[1]) {
            productName = match[1]?.trim();
            quantity = parseInt(match[2]);
          } else if (pattern === quantityPatterns[2]) {
            quantity = parseInt(match[1]);
            productName = match[3]?.trim();
          }

          if (productName && quantity > 0) {
            items.push({
              productName: productName.substring(0, 50),
              quantity,
              confidence: 0.85,
            });
            break;
          }
        }
      }
    });

    return items;
  };

  // Match extracted items to products in database
  const matchProductsAndConfirm = () => {
    const matched: ConfirmedItem[] = [];

    extractedItems.forEach((item) => {
      // Try to find matching product by name
      const matchedProduct = allProducts.find(
        (p) =>
          p.name.toLowerCase().includes(item.productName.toLowerCase()) ||
          item.productName.toLowerCase().includes(p.name.toLowerCase())
      );

      if (matchedProduct) {
        matched.push({
          product: matchedProduct,
          scannedQuantity: item.quantity,
        });
      }
    });

    if (matched.length === 0) {
      alert("Could not match any products from the bill to your inventory. Please manually match them.");
      setStep("confirm");
      return;
    }

    setConfirmedItems(matched);
    setStep("confirm");
  };

  // Handle manual product selection for unmatched items
  const handleProductSelection = (itemIndex: number, product: Product) => {
    const newMap = new Map(selectedProductForItem);
    newMap.set(itemIndex, product);
    setSelectedProductForItem(newMap);
  };

  // Update inventory with confirmed items
  const handleConfirmAndUpdate = async () => {
    const itemsToUpdate: ConfirmedItem[] = [];

    // Add auto-matched items
    itemsToUpdate.push(...confirmedItems);

    // Add manually selected items
    extractedItems.forEach((item, index) => {
      const manualProduct = selectedProductForItem.get(index);
      if (manualProduct) {
        const quantity = editingQuantities.get(index) || item.quantity;
        itemsToUpdate.push({
          product: manualProduct,
          scannedQuantity: quantity,
        });
      }
    });

    if (itemsToUpdate.length === 0) {
      alert("Please select at least one product to add to inventory");
      return;
    }

    setIsSubmitting(true);
    setStep("processing");

    try {
      // Update stock for each item
      for (const item of itemsToUpdate) {
        const newStock = item.product.stock + item.scannedQuantity;
        await updateProductStock(item.product.id, newStock);
      }

      alert(`Successfully updated ${itemsToUpdate.length} products in inventory!`);
      navigate("/inventory");
    } catch (error) {
      console.error("Failed to update inventory:", error);
      alert("Failed to update inventory. Please try again.");
      setStep("confirm");
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
              if (step === "upload") navigate("/inventory");
              else setStep("upload");
            }}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {t("inventory.scanBill") || "Scan Bill"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {step === "upload" && "Take or upload a bill photo"}
              {step === "preview" && "Review the image"}
              {step === "extract" && "Match products from bill"}
              {step === "confirm" && "Confirm and update inventory"}
              {step === "processing" && "Updating inventory..."}
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
                Take a photo or upload a PDF/image of the bill to extract product information
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
              className="w-full bg-gradient-auth text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Choose Image
            </button>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && selectedImage && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl card-shadow-md overflow-hidden">
              <img
                src={selectedImage}
                alt="Bill preview"
                className="w-full max-h-96 object-contain"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setStep("upload");
                }}
                className="flex-1 bg-muted text-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={extractTextFromImage}
                disabled={isProcessing}
                className="flex-1 bg-gradient-auth text-primary-foreground py-2.5 rounded-lg font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Extract Text (OCR)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Extract */}
        {step === "extract" && (
          <div className="space-y-4">
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
                    <div key={idx} className="bg-muted rounded-lg p-2 text-xs">
                      <p className="font-medium text-foreground">{item.productName}</p>
                      <p className="text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={matchProductsAndConfirm}
              className="w-full bg-gradient-auth text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Match with Inventory
            </button>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === "confirm" && (
          <div className="space-y-4">
            {/* Auto-matched items */}
            {confirmedItems.length > 0 && (
              <div className="bg-card rounded-2xl card-shadow-md p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Matched Products</h3>
                <div className="space-y-2">
                  {confirmedItems.map((item, idx) => (
                    <div key={idx} className="bg-success/10 border border-success/30 rounded-lg p-3">
                      <p className="font-medium text-foreground text-sm">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From Bill: {item.scannedQuantity} units
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Current Stock: {item.product.stock} → {item.product.stock + item.scannedQuantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unmatched items for manual selection */}
            {extractedItems.filter((item, idx) => !confirmedItems.find((c) => c.scannedQuantity === item.quantity)).length > 0 && (
              <div className="bg-card rounded-2xl card-shadow-md p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Unmatched Items - Select Products</h3>
                <div className="space-y-3">
                  {extractedItems.map((item, idx) => (
                    <div key={idx} className="bg-muted rounded-lg p-3">
                      <p className="text-xs font-medium text-foreground mb-2">{item.productName}</p>
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full px-2 py-1.5 rounded text-xs bg-background border border-border mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        onChange={(e) => {
                          // Filter products as user types
                        }}
                      />
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {allProducts
                          .filter((p) =>
                            p.name.toLowerCase().includes(item.productName.toLowerCase()) ||
                            item.productName.toLowerCase().includes(p.name.toLowerCase())
                          )
                          .map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleProductSelection(idx, product)}
                              className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                                selectedProductForItem.get(idx)?.id === product.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background hover:bg-muted text-foreground"
                              }`}
                            >
                              {product.name} (Stock: {product.stock})
                            </button>
                          ))}
                      </div>
                      <input
                        type="number"
                        value={editingQuantities.get(idx) || item.quantity}
                        onChange={(e) => {
                          const newMap = new Map(editingQuantities);
                          newMap.set(idx, Number(e.target.value));
                          setEditingQuantities(newMap);
                        }}
                        className="w-full px-2 py-1.5 rounded text-xs bg-background border border-border mt-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Quantity"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleConfirmAndUpdate}
              disabled={isSubmitting || (confirmedItems.length === 0 && selectedProductForItem.size === 0)}
              className="w-full bg-gradient-auth text-primary-foreground py-3 rounded-lg font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? "Updating..." : "Confirm & Update Inventory"}
            </button>
          </div>
        )}

        {/* Step 5: Processing */}
        {step === "processing" && (
          <div className="bg-card rounded-2xl card-shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Updating Inventory...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we update your stock</p>
          </div>
        )}

        {/* Hidden canvas for PDF rendering */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
