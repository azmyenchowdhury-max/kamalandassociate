// @ts-nocheck
// Calls the Consultation Eligibility Apps Script directly (same backend
// api-eligibility-check proxies to), for server-to-server confirmation after
// a payment is validated — no browser involved, so this bypasses the proxy.

export async function confirmConsultationPaid(params: {
  email: string;
  phone: string;
  consultationId: string;
}): Promise<{ success: boolean; error?: string }> {
  const url = Deno.env.get("ELIGIBILITY_API_URL");
  const clientKey = Deno.env.get("ELIGIBILITY_CLIENT_KEY");

  if (!url || !clientKey) {
    return { success: false, error: "Eligibility service is not configured." };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "confirm_consultation",
      email: params.email,
      phone: params.phone,
      consultationId: params.consultationId,
      paymentStatus: "paid",
      clientKey,
    }),
  });

  if (!response.ok) {
    return { success: false, error: `Eligibility service responded with ${response.status}` };
  }

  const result = await response.json().catch(() => ({}));
  return { success: Boolean(result.success), error: result.error };
}
