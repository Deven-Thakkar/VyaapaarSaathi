import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { sendWhatsappSummary } from "@/lib/chatbot-api";
import { useProfile } from "@/context/ProfileContext";

// Business ID comes from auth context via useProfile, with a fallback for demo/unloaded states
const DEFAULT_BUSINESS_ID = "7d1f8a08-ff5b-4bb6-8b9d-f9a3912b9b86";
interface WhatsappInsightsDrawerProps {
  children: React.ReactNode;
}

export default function WhatsappInsightsDrawer({ children }: WhatsappInsightsDrawerProps) {
  const [open, setOpen] = useState(false);
  const [loadingType, setLoadingType] = useState<"daily" | "weekly" | "monthly" | null>(null);
  const { profile } = useProfile();

  const handleSelect = async (type: "daily" | "weekly" | "monthly") => {
    setLoadingType(type);
    
    const businessId = profile?.business_id || DEFAULT_BUSINESS_ID;
    console.log("Using businessId:", businessId);

    try {
      const result = await sendWhatsappSummary(type, businessId);
      
      if (result.success === false) {
        toast.error(result.message || "Pehle WhatsApp par message bhejo to activate service");
      } else {
        toast.success("WhatsApp par summary bhej di gayi ✅ Check karein 📲");
        setTimeout(() => setOpen(false), 600); // Close drawer smoothly after a delay
      }
    } catch (error: any) {
      toast.error(error?.message || "WhatsApp bhejne mein issue aaya");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="max-w-md mx-auto h-[400px] flex flex-col">
        <DrawerHeader>
          <DrawerTitle className="text-xl">Kis period ka summary chahiye?</DrawerTitle>
          <DrawerDescription>
            Select a timeframe to get business insights on WhatsApp.
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <SummaryOptionCard
            title="📅 Aaj ka summary"
            description="Today's sales, expenses, and udhaar updates."
            onClick={() => handleSelect("daily")}
            isLoading={loadingType === "daily"}
            disabled={loadingType !== null && loadingType !== "daily"}
          />
          <SummaryOptionCard
            title="📊 Weekly summary"
            description="Past 7 days performance and trends."
            onClick={() => handleSelect("weekly")}
            isLoading={loadingType === "weekly"}
            disabled={loadingType !== null && loadingType !== "weekly"}
          />
          <SummaryOptionCard
            title="📈 Monthly summary"
            description="Comprehensive view of the last 30 days."
            onClick={() => handleSelect("monthly")}
            isLoading={loadingType === "monthly"}
            disabled={loadingType !== null && loadingType !== "monthly"}
          />
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <button className="w-full py-3 font-semibold text-muted-foreground border rounded-xl hover:bg-muted/50 transition-colors">
              Cancel
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface SummaryOptionCardProps {
  title: string;
  description: string;
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

function SummaryOptionCard({ title, description, onClick, isLoading, disabled }: SummaryOptionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        disabled && !isLoading
          ? "opacity-50 cursor-not-allowed bg-muted/20"
          : "bg-card hover:border-primary/50 active:scale-[0.98] card-shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-heading">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <MessageSquare className="w-5 h-5 text-[#25D366] opacity-80" />
        )}
      </div>
    </button>
  );
}
