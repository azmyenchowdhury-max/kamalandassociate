// @ts-nocheck
// Shared SSLCommerz API v4 helpers. Docs: https://developer.sslcommerz.com/
// Store ID/Password come from Supabase secrets, never from client code.

// Fixed server-side — never trust an amount supplied by the browser.
// Keep this in sync with DEFAULT_FEE in google-apps-script/EligibilityCode.gs
// (a separate runtime that can't import this constant directly).
export const CONSULTATION_FEE_BDT = 3000;

export interface SslcommerzConfig {
  storeId: string;
  storePassword: string;
  baseUrl: string;
  isSandbox: boolean;
}

export function getSslcommerzConfig(): SslcommerzConfig {
  const storeId = Deno.env.get("SSLCOMMERZ_STORE_ID") ?? "";
  const storePassword = Deno.env.get("SSLCOMMERZ_STORE_PASSWORD") ?? "";
  const isSandbox = (Deno.env.get("SSLCOMMERZ_SANDBOX") ?? "true").toLowerCase() !== "false";
  const baseUrl = isSandbox
    ? "https://sandbox.sslcommerz.com"
    : "https://securepay.sslcommerz.com";
  return { storeId, storePassword, baseUrl, isSandbox };
}

export function isSslcommerzConfigured(config: SslcommerzConfig): boolean {
  return Boolean(config.storeId && config.storePassword);
}

export interface InitiateSessionParams {
  tranId: string;
  amount: number;
  currency: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  productName: string;
  // Custom passthrough values, echoed back by the Validation API later.
  valueA?: string;
  valueB?: string;
  valueC?: string;
  valueD?: string;
}

export interface InitiateSessionResult {
  ok: boolean;
  gatewayUrl?: string;
  failedReason?: string;
  raw: unknown;
}

export async function initiateSslcommerzSession(
  config: SslcommerzConfig,
  params: InitiateSessionParams
): Promise<InitiateSessionResult> {
  const body = new URLSearchParams({
    store_id: config.storeId,
    store_passwd: config.storePassword,
    total_amount: String(params.amount),
    currency: params.currency,
    tran_id: params.tranId,
    success_url: params.successUrl,
    fail_url: params.failUrl,
    cancel_url: params.cancelUrl,
    ipn_url: params.ipnUrl,
    cus_name: params.customerName,
    cus_email: params.customerEmail,
    cus_add1: params.customerAddress,
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: params.customerPhone,
    shipping_method: "NO",
    product_name: params.productName,
    product_category: "Legal Services",
    product_profile: "general",
    num_of_item: "1",
    value_a: params.valueA ?? "",
    value_b: params.valueB ?? "",
    value_c: params.valueC ?? "",
    value_d: params.valueD ?? "",
  });

  const response = await fetch(`${config.baseUrl}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const raw = await response.json().catch(() => ({}));

  if (raw && raw.status === "SUCCESS" && raw.GatewayPageURL) {
    return { ok: true, gatewayUrl: raw.GatewayPageURL, raw };
  }

  return { ok: false, failedReason: raw?.failedreason || "Session init failed", raw };
}

export interface ValidationResult {
  valid: boolean;
  tranId?: string;
  amount?: number;
  currency?: string;
  valueA?: string;
  valueB?: string;
  valueC?: string;
  valueD?: string;
  raw: unknown;
}

export async function validateSslcommerzTransaction(
  config: SslcommerzConfig,
  valId: string
): Promise<ValidationResult> {
  const params = new URLSearchParams({
    val_id: valId,
    store_id: config.storeId,
    store_passwd: config.storePassword,
    format: "json",
  });

  const response = await fetch(
    `${config.baseUrl}/validator/api/validationserverAPI.php?${params.toString()}`
  );
  const raw = await response.json().catch(() => ({}));

  const status = String(raw?.status || "").toUpperCase();
  const valid = status === "VALID" || status === "VALIDATED";

  return {
    valid,
    tranId: raw?.tran_id,
    amount: raw?.amount ? Number(raw.amount) : undefined,
    currency: raw?.currency,
    valueA: raw?.value_a,
    valueB: raw?.value_b,
    valueC: raw?.value_c,
    valueD: raw?.value_d,
    raw,
  };
}
