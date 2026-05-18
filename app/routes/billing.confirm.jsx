import { redirect } from "react-router";
import { authenticate } from "../shopify.server";
import { verifyCharge } from "../lib/billing.server";
import db from "../db.server";

/**
 * GET /billing/confirm
 *
 * Shopify redirects here after the merchant approves or declines a charge.
 * Query params: charge_id (numeric Shopify ID), shop, host
 *
 * Flow:
 *   ACTIVE   → record purchase in DB → redirect to app with ?payment=success
 *   DECLINED → redirect to app with ?payment=declined
 *   other    → redirect to app with ?payment=error
 */
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const numericChargeId = url.searchParams.get("charge_id");
  const host = url.searchParams.get("host") ?? "";

  // Authenticate — session must exist since the merchant just came from OAuth.
  const { admin, session } = await authenticate.admin(request);

  if (!numericChargeId) {
    return redirect(`/app?host=${host}&payment=error`);
  }

  // Shopify returns a numeric ID in the redirect; convert to GID for GraphQL.
  const chargeGid = `gid://shopify/AppPurchaseOneTime/${numericChargeId}`;

  try {
    const charge = await verifyCharge(admin, chargeGid);

    if (charge.status === "ACTIVE") {
      // Upsert so re-visiting the confirm URL doesn't throw a unique constraint.
      await db.purchase.upsert({
        where: { chargeId: chargeGid },
        update: { paidAt: new Date() },
        create: {
          shop: session.shop,
          chargeId: chargeGid,
          paidAt: new Date(),
        },
      });

      return redirect(`/app?host=${host}&payment=success`);
    }

    if (charge.status === "DECLINED") {
      return redirect(`/app?host=${host}&payment=declined`);
    }

    // PENDING / EXPIRED / unknown
    return redirect(`/app?host=${host}&payment=error`);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("[billing/confirm]", error);
    return redirect(`/app?host=${host}&payment=error`);
  }
};
