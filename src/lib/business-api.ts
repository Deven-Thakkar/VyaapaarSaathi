import { supabase } from "./supabase";

export interface Business {
  id: string;
  owner_name: string;
  phone_number: string;
  shop_name: string;
  business_type: string;
  monthly_revenue: number;
  investment_amount: number;
  cost_stock: number;
  cost_salaries: number;
  cost_rent: number;
  cost_utilities: number;
  created_at: string;
}

/**
 * Get business by phone number
 */
export async function getBusinessByPhone(phoneNumber: string): Promise<Business | null> {
  try {
    // Format phone number
    const formattedPhone = phoneNumber.startsWith("+") 
      ? phoneNumber 
      : `+91${phoneNumber}`;

    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("phone_number", formattedPhone)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No business found
        return null;
      }
      console.error("Error fetching business:", error);
      throw new Error(`Failed to fetch business: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Fetch business error:", error);
    return null;
  }
}

/**
 * Get business by ID
 */
export async function getBusinessById(businessId: string): Promise<Business | null> {
  try {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (error) {
      console.error("Error fetching business:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Fetch business error:", error);
    return null;
  }
}
