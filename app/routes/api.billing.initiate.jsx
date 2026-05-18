import { authenticate } from "../shopify.server";
import { createHandoffCharge } from "../lib/billing.server";

/**
 * POST /api/billing/initiate
 *
 * Creates a Shopify one-time charge and returns the confirmationUrl.
 * The frontend redirects the merchant to this URL for native Shopify
 * payment confirmation — no custom payment UI is used.
 */
export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { admin, session } = await authenticate.admin(request);
    const { confirmationUrl, id } = await createHandoffCharge(
      admin,
      session.shop
    );

    return Response.json({ confirmationUrl, id });
  } catch (error) {
    // Re-throw auth redirects so App Bridge can handle them.
    if (error instanceof Response) throw error;

    console.error("[billing/initiate]", error);
    return Response.json(
      { error: error.message ?? "Failed to create charge" },
      { status: 500 }
    );
  }
};
