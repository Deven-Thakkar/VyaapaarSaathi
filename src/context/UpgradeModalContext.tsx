import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import UpgradeModal from "@/components/UpgradeModal";

interface UpgradeModalContextType {
  showUpgrade: (feature?: string) => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType | undefined>(undefined);

export function UpgradeModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState<string | undefined>(undefined);

  const showUpgrade = useCallback((feat?: string) => {
    setFeature(feat);
    setOpen(true);
  }, []);

  return (
    <UpgradeModalContext.Provider value={{ showUpgrade }}>
      {children}
      <UpgradeModal open={open} onClose={() => setOpen(false)} feature={feature} />
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal() {
  const ctx = useContext(UpgradeModalContext);
  if (!ctx) throw new Error("useUpgradeModal must be inside UpgradeModalProvider");
  return ctx;
}

/**
 * Call this after any fetch() call to auto-detect rate limit responses.
 * Returns true if it was a limit error (so you can return early).
 * 
 * Usage:
 *   const { showUpgrade } = useUpgradeModal();
 *   const res = await fetch("/api/chat", ...);
 *   if (await handleRateLimit(res, showUpgrade, "AI chat messages")) return;
 */
export async function handleRateLimit(
  res: Response,
  showUpgrade: (feature?: string) => void,
  featureLabel?: string
): Promise<boolean> {
  if (res.status === 429) {
    showUpgrade(featureLabel);
    return true;
  }
  return false;
}
