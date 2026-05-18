import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GET /api/billing/check
 *
 * Returns whether this shop has an active purchase.
 * Used by the frontend to show the correct UI state:
 *   - hasPurchase: true  → show Generate Report button
 *   - hasPurchase: false → show Buy button ($19)
 *
 * Purchases are valid for 30 days from paidAt.
 */
export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const purchase = await db.purchase.findFirst({
      where: {
        shop: session.shop,
        paidAt: { gte: thirtyDaysAgo },
      },
      orderBy: { paidAt: "desc" },
    });

    return Response.json({
      hasPurchase: !!purchase,
      paidAt: purchase?.paidAt ?? null,
      expiresAt: purchase
        ? new Date(
            new Date(purchase.paidAt).getTime() + 30 * 24 * 60 * 60 * 1000
          ).toISOString()
        : null,
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("[billing/check]", error);
    return Response.json({ hasPurchase: false, paidAt: null, expiresAt: null });
  }
};
