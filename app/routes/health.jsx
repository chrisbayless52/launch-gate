/**
 * GET /health
 *
 * Lightweight liveness probe for Railway (and any other uptime monitor).
 * Returns 200 immediately — no auth, no DB query, no external calls.
 * Shopify reviewers also use this to confirm the server is reachable.
 */
export const loader = () => {
  return Response.json(
    { status: "ok", timestamp: new Date().toISOString() },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
};
