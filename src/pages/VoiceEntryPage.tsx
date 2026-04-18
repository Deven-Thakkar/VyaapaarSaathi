import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useState, useRef, useEffect } from "react";
import { Mic, Loader2, ArrowLeft, Check, Package, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/context/ProfileContext";

interface ParsedData {
  type: "sale" | "inventory" | "income" | "udhaar" | null;
  product?: string | null;
  quantity?: number | null;
  unit?: string | null;
  price?: number | null;
  amount?: number | null;
  description?: string | null;
  payment_method?: string | null;
  customer_name?: string | null;
  due_date?: string | null;
}

export default function VoiceEntryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const searchParams = new URLSearchParams(window.location.search);
  const entryType = searchParams.get("type") || "inventory"; // "inventory" or "sales" or "udhaar"

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Your browser doesn't support voice recognition. Please use Chrome.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-IN"; // Set to Indian English/Hinglish
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setParsedData(null);
      setTranscript("");
    };

    recognitionRef.current.onresult = async (event: any) => {
      const currentTranscript = event.results[0][0].transcript;
      setTranscript(currentTranscript);
      setIsListening(false);
      
      await processSpeech(currentTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech Error:", event.error);
      setIsListening(false);
      toast.error("Error recognizing speech. Please try again.");
    };

    recognitionRef.current.onspeechend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const processSpeech = async (text: string) => {
    setIsProcessing(true);
    
    const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY;
    if (!SARVAM_API_KEY) {
      toast.error("Sarvam API key is missing in environment variables.");
      setIsProcessing(false);
      return;
    }

    let systemPrompt = "";
    if (entryType === "udhaar") {
      systemPrompt = `
Return ONLY valid JSON. No extra text.

FORMAT:
{
  "type": "udhaar",
  "customer_name": string,
  "amount": number,
  "description": string | null,
  "due_date": string | null
}

RULES:
- Extract the customer name (e.g. "Ramesh ko 500 udhaar diya" -> customer_name: "Ramesh").
- Extract the total amount given as udhaar, credit, or baaki.
- Extract any short description if provided.
- Extract when they promised to pay back if mentioned (e.g. "kal" -> "Tomorrow", "agle hafte" -> "Next Week", "10 din baad" -> "In 10 days"). 
- MUST extract amount as a valid number.
`;
    } else if (entryType === "sales") {
      systemPrompt = `
Return ONLY valid JSON. No extra text.

FORMAT:
{
  "type": "sale" | "income",
  "amount": number,
  "description": string,
  "payment_method": "cash" | "upi" | "udhaar" | null
}

RULES:
- Extract the total amount received, earned or sold for (e.g. "500 rupaye ki bikri" -> amount: 500).
- Extract description of what was sold or source of income (e.g. "bikri", "sale", "shoes sold", "services").
- Map payment methods: 
   - paytm, gpay, phonepe, qr, online -> "upi"
   - nakad, rokda -> "cash"
   - baaki, udhaar, baad mein dega -> "udhaar"
- Translate description briefly to English (e.g., "joote beche" -> "shoes sold").
- MUST extract amount as a valid number.
`;
    } else {
      systemPrompt = `
Return ONLY valid JSON. No extra text.

FORMAT:
{
  "type": "sale" | "inventory",
  "product": string,
  "quantity": number,
  "unit": "kg" | "g" | "litre" | "packet" | "piece" | null,
  "price": number | null
}

RULES:
- sold, becha -> sale
- add, bought, khareeda, laya -> inventory
- cheeni -> sugar, chawal -> rice, tel -> oil, doodh -> milk, atta -> flour
- kilo -> kg, packet -> packet
- Extract numbers for quantity
- Extract price if ₹, rs, rupees present
`;
    }

    try {
      const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + SARVAM_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "sarvam-m",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ]
        })
      });

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Invalid response from AI");
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]) as ParsedData;
      setParsedData(parsed);
      toast.success("Voice processed successfully!");

    } catch (err: any) {
      console.error("API Error:", err);
      toast.error("Failed to process speech. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData || !profile?.businessId) return;
    setIsProcessing(true);

    try {
      if (entryType === "sales" || parsedData.type === "sale" || parsedData.type === "income") {
        const { error } = await supabase.from("sales").insert({
          business_id: profile.businessId,
          total_amount: parsedData.amount || parsedData.price || 0,
          Vendor: "Direct Sale (Voice)",
          Date: new Date().toISOString().split("T")[0],
          created_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        toast.success("Sale successfully saved to database!");

      } else if (entryType === "udhaar" || parsedData.type === "udhaar") {
        // Find or create customer
        let customerId;
        const custName = parsedData.customer_name || "Unknown Customer";
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("business_id", profile.businessId)
          .eq("name", custName)
          .maybeSingle();

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const { data: newCustomer, error: custError } = await supabase
            .from("customers")
            .insert({ name: custName, business_id: profile.businessId })
            .select("id").single();
          if (custError) throw custError;
          customerId = newCustomer.id;
        }

        // Parse due_date roughly
        let dueDateISO = null;
        if (parsedData.due_date) {
           // For hackathon, if they specify "next week", "kal", we can just default to 7 days from now 
           // since natural language parsing of dates without a proper library is hard.
           // You can improve this later with `date-fns` or similar.
           dueDateISO = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }

        const { error } = await supabase.from("udhaar_records").insert({
          business_id: profile.businessId,
          customer_id: customerId,
          amount_remaining: parsedData.amount || 0,
          due_date: dueDateISO,
          status: "pending"
        }).select().single();
        if (error) throw error;
        toast.success("Udhaar successfully saved to database!");

      } else {
        const { error } = await supabase.from("products").insert({
          business_id: profile.businessId,
          name: parsedData.product || "Unknown Item",
          stock: parsedData.quantity || 1,
          price: parsedData.price || 0,
        }).select().single();
        if (error) throw error;
        toast.success("Inventory successfully saved to database!");
      }
      
      // Clear data and redirect
      setParsedData(null);
      if (entryType === "udhaar") navigate("/udhaari");
      else if (entryType === "sales") navigate("/sales");
      else navigate("/inventory");

    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to save to database.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-4 lg:p-6 h-full flex flex-col">
        <PageHeader
          title="Voice Entry"
          subtitle="Speak to record items"
          right={
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          }
        />

        <div className="flex-1 flex flex-col items-center justify-center py-10">
          
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-heading mb-2">
              {isListening ? "Listening..." : "Tap the mic and speak"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {entryType === "udhaar"
                ? 'Example: "Ramesh ko 500 rupaye udhaar diya, agle hafte dega"'
                : entryType === "sales" 
                ? 'Example: "500 rupaye ki bikri hui cash mein"' 
                : 'Example: "5 kilo cheeni khareeda 200 rupaye mein"'}
            </p>
          </div>

          <button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`relative flex items-center justify-center w-32 h-32 rounded-full mb-8 transition-all duration-300 ${
              isListening 
                ? "bg-red-500 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.6)]" 
                : isProcessing
                ? "bg-muted cursor-not-allowed"
                : "bg-primary shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:scale-105"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
            
            {/* Ripple effect when listening */}
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"></span>
                <span className="absolute inset-[-20px] rounded-full border-2 border-red-500/50 animate-ping opacity-50" style={{ animationDelay: "0.2s" }}></span>
              </>
            )}
          </button>

          {/* Transcript Display */}
          <div className="h-16 flex items-center justify-center text-center px-6">
            {transcript && !parsedData && !isProcessing && (
              <p className="text-lg font-medium text-foreground italic">"{transcript}"</p>
            )}
            {isProcessing && (
              <p className="text-sm font-medium text-primary flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing with AI...
              </p>
            )}
          </div>

          {/* Parsed Data Card */}
          {parsedData && !isProcessing && (
            <div className="w-full max-w-sm mt-8 animate-fade-up">
              <div className="bg-card rounded-2xl border card-shadow-md p-5 mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full -z-10" />
                
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${parsedData.type === 'sale' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-heading text-lg capitalize">
                    {parsedData.type || "Unknown Entry"}
                  </h3>
                </div>

                <div className="space-y-3">
                  {entryType === "udhaar" ? (
                    <>
                      <DetailRow label="Customer Name" value={parsedData.customer_name} />
                      <DetailRow label="Amount" value={parsedData.amount ? `₹${parsedData.amount}` : null} />
                      <DetailRow label="Due Date" value={parsedData.due_date} />
                      <DetailRow label="Notes" value={parsedData.description} />
                    </>
                  ) : entryType === "sales" ? (
                    <>
                      <DetailRow label="Description" value={parsedData.description} />
                      <DetailRow label="Amount" value={parsedData.amount ? `₹${parsedData.amount}` : null} />
                      <DetailRow label="Payment Method" value={parsedData.payment_method} />
                    </>
                  ) : (
                    <>
                      <DetailRow label="Product" value={parsedData.product} />
                      <DetailRow 
                        label="Quantity" 
                        value={parsedData.quantity ? `${parsedData.quantity} ${parsedData.unit || ''}` : null} 
                      />
                      <DetailRow 
                        label="Price" 
                        value={parsedData.price ? `₹${parsedData.price}` : null} 
                      />
                    </>
                  )}
                </div>
              </div>

              { (entryType === "udhaar" && (!parsedData.customer_name || !parsedData.amount)) || 
                (entryType === "sales" && !parsedData.amount) || 
                (entryType !== "sales" && entryType !== "udhaar" && (!parsedData.product || (!parsedData.quantity && !parsedData.price))) ? (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-xl mb-4 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>Could not extract complete details. Please try speaking clearly again.</p>
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-auth text-white py-4 rounded-xl font-bold text-base card-shadow-md lift active:scale-[0.98]"
                >
                  <Check className="w-5 h-5" />
                  Save Entry
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center pb-2 border-b border-border/50 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground capitalize">{value}</span>
    </div>
  );
}
