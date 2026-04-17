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

const defaultProfile: FinancialProfile = {
  name: "Rahul Sharma",
  phone: "+91 98765 43210",
  email: "rahul@example.com",
  businessName: "Sharma General Store",
  businessType: "Retail / Kirana",
  monthlyRevenue: 285000,
  investment: 100000,
  goal: "25% growth",
  stock: 120000,
  salaries: 35000,
  rent: 18000,
  utilities: 8000,
};

type Ctx = {
  profile: FinancialProfile;
  updateProfile: (patch: Partial<FinancialProfile>) => void;
};

const ProfileContext = createContext<Ctx | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FinancialProfile>(defaultProfile);
  const updateProfile = (patch: Partial<FinancialProfile>) =>
    setProfile((p) => ({ ...p, ...patch }));
  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be inside ProfileProvider");
  return ctx;
}
