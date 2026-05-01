import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// ─── Key by business_id with safe IPv6-compatible IP fallback ───
const keyByBusiness = (req) => {
  return req.body?.business_id || ipKeyGenerator(req);
};

const keyByBusinessOrQuery = (req) => {
  return req.query?.business_id || req.body?.business_id || ipKeyGenerator(req);
};

// ─── FREE TIER LIMITS (lifetime-style: 365-day window) ─────────
//
//  These are very intentionally low — this is the FREE tier.
//  Users who hit the limit see an "Upgrade" popup.
//
//  AI Chat (Gemini)       →  5 messages  total (free)
//  WhatsApp Summary       →  2 sends     total (free)
//  Bolna AI Call          →  1 call      total (free)
//  Invoice OCR Scan       →  3 scans     total (free)
//  Barcode Lookup         → 10 lookups   total (free)
//  Insights / Predict     → 50 requests  / hour (generous, no AI cost)
//
// ────────────────────────────────────────────────────────────────

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const chatLimiter = rateLimit({
  windowMs: YEAR_MS,
  max: 5,
  keyGenerator: keyByBusiness,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: {
    error: "You have reached the free limit for AI chat (5 messages). Please upgrade to continue.",
    code: "RATE_LIMIT_UPGRADE"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const whatsappLimiter = rateLimit({
  windowMs: YEAR_MS,
  max: 2,
  keyGenerator: keyByBusiness,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: {
    error: "You have reached the free limit for WhatsApp summaries (2 sends). Please upgrade to continue.",
    code: "RATE_LIMIT_UPGRADE"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const bolnaCallLimiter = rateLimit({
  windowMs: YEAR_MS,
  max: 1,
  keyGenerator: keyByBusiness,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: {
    error: "You have reached the free limit for AI calls (1 call). Please upgrade to continue.",
    code: "RATE_LIMIT_UPGRADE"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const invoiceLimiter = rateLimit({
  windowMs: YEAR_MS,
  max: 3,
  keyGenerator: keyByBusiness,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: {
    error: "You have reached the free limit for invoice scanning (3 scans). Please upgrade to continue.",
    code: "RATE_LIMIT_UPGRADE"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const barcodeLimiter = rateLimit({
  windowMs: YEAR_MS,
  max: 10,
  keyGenerator: keyByBusinessOrQuery,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: {
    error: "You have reached the free limit for barcode lookups (10 lookups). Please upgrade to continue.",
    code: "RATE_LIMIT_UPGRADE"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const insightsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour (this hits no external APIs, so more generous)
  max: 50,
  keyGenerator: keyByBusiness,
  validate: { trustProxy: false, xForwardedForHeader: false },
  message: {
    error: "Too many requests. Please slow down and try again in an hour.",
    code: "RATE_LIMIT_INSIGHTS"
  },
  standardHeaders: true,
  legacyHeaders: false,
});
