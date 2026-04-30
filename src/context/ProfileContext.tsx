import { createContext, useContext, useState, ReactNode } from "react";

export type FinancialProfile = {
  name: string;
  phone: string;
  email: string;
  businessName: string;
  businessType: string;
  businessId?: string;
  monthlyRevenue: number;
  investment: number;
  goal: string;
  stock: number;
  salaries: number;
  rent: number;
  utilities: number;
};

const STORAGE_KEY = "vyaaparsaathi_profile";

const defaultProfile: FinancialProfile = {
  name: "",
  phone: "",
  email: "",
  businessName: "",
  businessType: "",
  monthlyRevenue: 0,
  investment: 0,
  goal: "",
  stock: 0,
  salaries: 0,
  rent: 0,
  utilities: 0,
};

function loadProfile(): FinancialProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {}
  return defaultProfile;
}

type Ctx = {
  profile: FinancialProfile;
  updateProfile: (patch: Partial<FinancialProfile>) => void;
  clearProfile: () => void;
};

const ProfileContext = createContext<Ctx | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FinancialProfile>(loadProfile);

  const updateProfile = (patch: Partial<FinancialProfile>) =>
    setProfile((p) => {
      const next = { ...p, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });

  const clearProfile = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setProfile(defaultProfile);
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be inside ProfileProvider");
  return ctx;
}
