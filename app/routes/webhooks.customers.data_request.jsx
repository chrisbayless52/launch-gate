import { authenticate } from "../shopify.server";

/**
 * GDPR: customers/data_request
 *
 * Shopify sends this when a customer submits a data access request.
 * LaunchGate does not store any customer PII — we only store OAuth session
 * tokens keyed by shop domain. Respond 200 and log for audit trail.
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

    // LaunchGate stores no customer PII — nothing to return or redact.
    return new Response(null, { status: 200 });
  } catch (error) {
    // authenticate.webhook throws a Response on invalid HMAC — re-throw so
    // React Router returns the correct 401. For all other errors, log and
    // return 200 so Shopify does not retry indefinitely.
    if (error instanceof Response) throw error;

    console.error("[gdpr/customers/data_request] Unexpected error:", error);
    return new Response(null, { status: 200 });
  }
};
