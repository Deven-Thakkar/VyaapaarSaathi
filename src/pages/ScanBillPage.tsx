import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useState, useRef } from "react";
import { Camera, Loader2, ArrowLeft, Check, UploadCloud, FileText, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { API_BASE } from "@/lib/chatbot-api";

interface ParsedInvoiceData {
  vendor: string;
  invoice_number: string;
  order_date: string;
  amount: number;
}

export default function ScanBillPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedInvoiceData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setParsedData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/process-invoice`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process invoice");
      }

      setParsedData(result.data);
      toast.success("Invoice scanned successfully!");
    } catch (error: any) {
      console.error("Scan error:", error);
      toast.error(error.message || "Failed to scan invoice. Please try again.");
    } finally {
      setIsProcessing(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = () => {
    // For hackathon scope, we just show a toast and navigate back.
    // In the future, this will insert into a Supabase table.
    toast.success("Invoice saved successfully!");
    navigate("/home");
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-4 lg:p-6 h-full flex flex-col">
        <PageHeader
          title="Scan Bill"
          subtitle="Upload or capture an invoice"
          right={
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          }
        />

        <div className="flex-1 flex flex-col items-center justify-center py-6">
          
          {!parsedData && !isProcessing && (
            <div className="w-full max-w-sm animate-fade-in text-center">
              <h2 className="text-xl font-bold text-heading mb-2">
                Upload your Bill
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Take a photo of your physical invoice or upload a PDF to automatically extract details.
              </p>

              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />

              <div className="grid gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 bg-card border-2 border-dashed border-primary/50 text-foreground py-10 rounded-2xl font-bold text-base card-shadow-sm hover:bg-accent hover:border-primary transition-all"
                >
                  <UploadCloud className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p>Upload File</p>
                    <p className="text-xs font-normal text-muted-foreground">Image or PDF</p>
                  </div>
                </button>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm">OR</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <button
                  onClick={() => {
                    // Trigger native camera on mobile devices if possible
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment');
                      fileInputRef.current.click();
                      fileInputRef.current.removeAttribute('capture');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-auth text-primary-foreground py-4 rounded-2xl font-bold text-base card-shadow-md lift active:scale-[0.98]"
                >
                  <Camera className="w-5 h-5" />
                  Take a Photo
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center text-center animate-pulse">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-bold mb-2">Analyzing Bill...</h3>
              <p className="text-muted-foreground">Extracting text using AI OCR.</p>
            </div>
          )}

          {parsedData && !isProcessing && (
            <div className="w-full max-w-sm mt-4 animate-fade-up">
              <div className="bg-card rounded-2xl border card-shadow-md p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full -z-10" />
                
                <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
                  <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-heading text-lg">Invoice Details</h3>
                    <p className="text-xs text-muted-foreground">Automatically extracted</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <DetailRow label="Vendor" value={parsedData.vendor} />
                  <DetailRow label="Invoice No." value={parsedData.invoice_number} />
                  <DetailRow label="Date" value={parsedData.order_date} />
                  
                  <div className="flex justify-between items-center pt-4 border-t border-border border-dashed">
                    <span className="text-base font-bold text-heading">Total Amount</span>
                    <span className="text-2xl font-black text-primary">₹{parsedData.amount}</span>
                  </div>
                </div>
              </div>

              {(!parsedData.vendor || parsedData.amount === 0) ? (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl mb-4 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>Warning: Some fields could not be extracted accurately. Please review carefully.</p>
                </div>
              ) : null}

              <div className="grid gap-3">
                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-auth text-white py-4 rounded-xl font-bold text-base card-shadow-md lift active:scale-[0.98]"
                >
                  <Check className="w-5 h-5" />
                  Save to Expenses
                </button>
                <button
                  onClick={() => setParsedData(null)}
                  className="w-full py-3 font-semibold text-muted-foreground border rounded-xl hover:bg-muted/50 transition-colors"
                >
                  Scan Another Bill
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-muted-foreground whitespace-nowrap">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right break-words max-w-[60%]">{value}</span>
    </div>
  );
}
