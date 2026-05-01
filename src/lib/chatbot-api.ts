/**
 * Chatbot API service layer
 *
 * Uses Vite's env variable VITE_API_BASE_URL during dev (proxied via vite.config.ts)
 * and can be overridden for production deployments.
 */

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// ─── Types ───

export interface ChatResponse {
  reply: string;
}

export interface CustomerResponse {
  id: string;
  name: string;
  business_id: string;
}

export interface UdhaarResponse {
  id: string;
  customer_id: string;
  business_id: string;
  amount_remaining: number;
}

// ─── API Functions ───

/**
 * Send a chat message to the AI assistant.
 */
export async function sendChatMessage(
  message: string,
  businessId: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, business_id: businessId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}

/**
 * Add a new customer.
 */
export async function addCustomer(
  name: string,
  businessId: string
): Promise<CustomerResponse[]> {
  const res = await fetch(`${API_BASE}/add-customer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, business_id: businessId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}

/**
 * Add a new udhaar record.
 */
export async function addUdhaar(
  customerId: string,
  businessId: string,
  amount: number
): Promise<UdhaarResponse[]> {
  const res = await fetch(`${API_BASE}/add-udhaar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_id: customerId,
      business_id: businessId,
      amount,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}

/**
 * Send WhatsApp Business Insights
 */
export async function sendWhatsappSummary(
  type: "daily" | "weekly" | "monthly",
  businessId: string
): Promise<{ success: boolean; message?: string; reply?: string }> {
  const res = await fetch(`${API_BASE}/send-whatsapp-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, business_id: businessId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}

/**
 * Trigger Bolna AI Call
 */
export async function triggerBolnaCall(businessId?: string, phone?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/bolna-call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ business_id: businessId, phone }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}
