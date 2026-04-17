import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  phone: string;
  created_at: string;
}

/**
 * Send OTP to phone number
 */
export async function sendOTP(phone: string): Promise<void> {
  try {
    // Format phone number with country code
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      console.error("Error sending OTP:", error);
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    throw error;
  }
}

/**
 * Verify OTP and login
 */
export async function verifyOTP(phone: string, token: string): Promise<AuthUser> {
  try {
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: token,
      type: "sms",
    });

    if (error) {
      console.error("Error verifying OTP:", error);
      throw new Error(`Failed to verify OTP: ${error.message}`);
    }

    if (!data.user) {
      throw new Error("User not found after OTP verification");
    }

    return {
      id: data.user.id,
      phone: data.user.phone || "",
      created_at: data.user.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Verify OTP error:", error);
    throw error;
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      phone: user.phone || "",
      created_at: user.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error);
      throw new Error(`Failed to logout: ${error.message}`);
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

/**
 * Get session
 */
export async function getSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

/**
 * Listen to authentication state changes
 */
export function onAuthStateChange(
  callback: (user: AuthUser | null) => void
) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        phone: session.user.phone || "",
        created_at: session.user.created_at || new Date().toISOString(),
      });
    } else {
      callback(null);
    }
  });
}
