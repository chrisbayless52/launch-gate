import { authenticate } from "../shopify.server";

/**
 * GDPR: customers/redact
 *
 * Shopify sends this when a customer requests erasure of their data.
 * LaunchGate stores no customer PII — respond 200 and log for audit trail.
 *
 * Required for App Store approval. Must respond within 5 seconds.
 */
export const action = async ({ request }) => {
  try {
    const { shop, payload, topic } = await authenticate.webhook(request);

    console.log(
      JSON.stringify({
        type: topic,
        shop,
        customer_id: payload?.customer?.id ?? null,
        timestamp: new Date().toISOString(),
      })
    );

    // LaunchGate stores no customer PII — nothing to redact.
    return new Response(null, { status: 200 });
  } catch (error) {
    if (error instanceof Response) throw error;

    console.error("[gdpr/customers/redact] Unexpected error:", error);
    return new Response(null, { status: 200 });
  }
};
