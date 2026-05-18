import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GDPR: shop/redact
 *
 * Shopify sends this 48 hours after a merchant uninstalls the app.
 * We must delete all data stored for this shop — in LaunchGate's case,
 * that is the OAuth session row(s) in the Prisma/SQLite sessions table.
 *
 * Required for App Store approval. Must respond within 5 seconds.
 */
export const action = async ({ request }) => {
  try {
    const { shop, topic } = await authenticate.webhook(request);

    console.log(
      JSON.stringify({
        type: topic,
        shop,
        timestamp: new Date().toISOString(),
      })
    );

    // Delete all session records for this shop.
    // deleteMany is safe to call even if no rows exist (idempotent).
    await db.session.deleteMany({ where: { shop } });

    return new Response(null, { status: 200 });
  } catch (error) {
    if (error instanceof Response) throw error;

    console.error("[gdpr/shop/redact] Unexpected error:", error);
    return new Response(null, { status: 200 });
  }
};
