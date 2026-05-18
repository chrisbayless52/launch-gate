import { authenticate } from "../shopify.server";
import { fetchStoreData } from "../lib/storeData.server";
import { generateHandoffPDF } from "../lib/generatePDF.server";
import db from "../db.server";

// ---------------------------------------------------------------------------
// In-memory rate limiter — max 5 generations per shop per hour.
// Resets on server restart; acceptable for a low-volume report generator.
// ---------------------------------------------------------------------------
const rateLimitStore = new Map(); // shop -> number[]  (timestamps in ms)

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(shop) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  const timestamps = (rateLimitStore.get(shop) ?? []).filter(
    (t) => t > windowStart
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    const oldestInWindow = Math.min(...timestamps);
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - oldestInWindow);
    return { allowed: false, retryAfterSecs: Math.ceil(retryAfterMs / 1000) };
  }

  timestamps.push(now);
  rateLimitStore.set(shop, timestamps);
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// POST /api/report/generate
// ---------------------------------------------------------------------------

/**
 * Validates billing, fetches store data, generates and returns a PDF.
 *
 * Returns the PDF buffer directly as application/pdf so the browser triggers
 * a download. In the embedded app context, point window.top at this URL or
 * use a hidden form POST targeting _top.
 *
 * Request body (JSON): { credentialNotes?: string }
 */
export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // ── Authentication ────────────────────────────────────────────────────────
  let admin, session;
  try {
    ({ admin, session } = await authenticate.admin(request));
  } catch (error) {
    if (error instanceof Response) throw error;
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = session.shop;

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const rateCheck = checkRateLimit(shop);
  if (!rateCheck.allowed) {
    console.warn(`[report/generate] Rate limit exceeded for ${shop}`);
    return Response.json(
      { error: "Too many requests. Please wait before generating another report." },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfterSecs) },
      }
    );
  }

  // ── Billing check ─────────────────────────────────────────────────────────
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const purchase = await db.purchase.findFirst({
    where: { shop, paidAt: { gte: thirtyDaysAgo } },
    orderBy: { paidAt: "desc" },
  });

  if (!purchase) {
    return Response.json(
      { error: "Payment required", code: "PAYMENT_REQUIRED" },
      { status: 402 }
    );
  }

  // ── Parse request body ────────────────────────────────────────────────────
  let credentialNotes = "";
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      credentialNotes = String(body.credentialNotes ?? "").slice(0, 2000);
    } else {
      const formData = await request.formData();
      credentialNotes = String(formData.get("credentialNotes") ?? "").slice(0, 2000);
    }
  } catch {
    // Non-fatal — proceed with empty notes.
  }

  // ── Fetch store data ──────────────────────────────────────────────────────
  let storeData;
  try {
    storeData = await fetchStoreData(admin);
  } catch (error) {
    console.error(`[report/generate] fetchStoreData failed for ${shop}:`, error);
    return Response.json({ error: "Failed to fetch store data" }, { status: 500 });
  }

  // ── Generate PDF ──────────────────────────────────────────────────────────
  let pdfBuffer;
  try {
    pdfBuffer = await generateHandoffPDF(storeData, credentialNotes);
  } catch (error) {
    console.error(`[report/generate] generateHandoffPDF failed for ${shop}:`, error);
    return Response.json({ error: "Failed to generate PDF" }, { status: 500 });
  }

  // ── Stream PDF to client ──────────────────────────────────────────────────
  const storeName = (storeData.store?.name ?? "store")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const date = new Date().toISOString().slice(0, 10);
  const filename = `launchgate-handoff-${storeName}-${date}.pdf`;

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdfBuffer.length),
      "Cache-Control": "no-store",
    },
  });
};
