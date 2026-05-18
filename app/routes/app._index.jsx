import { useEffect, useState } from "react";
import { useFetcher, useLoaderData, useNavigation, useSearchParams } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { fetchStoreData } from "../lib/storeData.server";
import { generateHandoffPDF } from "../lib/generatePDF.server";
import db from "../db.server";

import {
  Page,
  Layout,
  Card,
  Banner,
  Button,
  TextField,
  List,
  Spinner,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Divider,
} from "@shopify/polaris";

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------
export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [storeData, purchase] = await Promise.all([
    fetchStoreData(admin),
    db.purchase.findFirst({
      where: { shop: session.shop, paidAt: { gte: thirtyDaysAgo } },
      orderBy: { paidAt: "desc" },
    }),
  ]);

  // Self-heal: if no purchase in DB, check Shopify directly for a recent
  // active charge. This recovers from the case where /billing/confirm was
  // interrupted by re-authentication and never recorded the purchase.
  let activePurchase = purchase;
  if (!purchase) {
    try {
      const response = await admin.graphql(`#graphql
        query {
          currentAppInstallation {
            oneTimePurchases(first: 5, sortKey: CREATED_AT, reverse: true) {
              edges {
                node {
                  id
                  name
                  status
                  createdAt
                }
              }
            }
          }
        }
      `);
      const json = await response.json();
      const edges = json.data?.currentAppInstallation?.oneTimePurchases?.edges ?? [];
      const active = edges.find((e) => e.node.status === "ACTIVE");

      if (active) {
        activePurchase = await db.purchase.upsert({
          where: { chargeId: active.node.id },
          update: {},
          create: {
            shop: session.shop,
            chargeId: active.node.id,
            paidAt: new Date(active.node.createdAt),
          },
        });
      }
    } catch (e) {
      console.error("[loader] billing self-heal failed:", e);
    }
  }

  return {
    storeData,
    hasPurchase: !!activePurchase,
    paidAt: activePurchase?.paidAt?.toISOString() ?? null,
  };
};

// ---------------------------------------------------------------------------
// Action — billing check + PDF generation (base64 for iframe download)
// ---------------------------------------------------------------------------
export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const credentialNotes = String(formData.get("credentialNotes") ?? "").slice(0, 2000);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const purchase = await db.purchase.findFirst({
    where: { shop: session.shop, paidAt: { gte: thirtyDaysAgo } },
  });

  if (!purchase) {
    return { error: "Payment required", code: "PAYMENT_REQUIRED" };
  }

  const storeData = await fetchStoreData(admin);
  const pdfBuffer = await generateHandoffPDF(storeData, credentialNotes);

  const storeName = (storeData.store?.name ?? "store")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const date = new Date().toISOString().slice(0, 10);

  return {
    pdfBase64: pdfBuffer.toString("base64"),
    filename: `launchgate-handoff-${storeName}-${date}.pdf`,
  };
};

// ---------------------------------------------------------------------------
// STATE 1 — Loading
// ---------------------------------------------------------------------------
function LoadingState() {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Box paddingBlockStart="2400">
            <BlockStack gap="400" align="center" inlineAlign="center">
              <Spinner size="large" />
              <Text as="p" tone="subdued">Loading store data…</Text>
            </BlockStack>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// STATE 2 — Ready to purchase
// ---------------------------------------------------------------------------
function PurchaseState({ onBuy, isBillingPending, notes, onNotesChange }) {
  return (
    <Page title="LaunchGate — Shopify Handoff">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Banner tone="info">
              <p>
                Generate a complete handoff PDF for your client — covering all
                installed apps, theme, payment gateways, staff accounts, and
                more. Everything a new agency or owner needs to take over the
                store.
              </p>
            </Banner>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">What's included in your report</Text>
                <List type="bullet">
                  <List.Item>Store overview — plan, domain, currency, timezone</List.Item>
                  <List.Item>All installed apps and their developers</List.Item>
                  <List.Item>Active theme name and status</List.Item>
                  <List.Item>Payment gateway configuration</List.Item>
                  <List.Item>Delivery profiles and shipping setup</List.Item>
                  <List.Item>Staff accounts and roles</List.Item>
                  <List.Item>Custom domains and SSL status</List.Item>
                  <List.Item>Your credential notes (manually entered)</List.Item>
                </List>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Credential notes (optional)</Text>
                <TextField
                  label="Add API keys, DNS login, hosting credentials, or any notes for your client"
                  value={notes}
                  onChange={onNotesChange}
                  multiline={6}
                  maxLength={2000}
                  showCharacterCount
                  helpText="This section is manually entered and will appear in the report. Never store passwords here — use a password manager link instead."
                  autoComplete="off"
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">Ready to generate?</Text>
                  <Text as="p" tone="subdued">
                    One-time purchase per store. Charged securely through your Shopify account.
                  </Text>
                </BlockStack>
                <Divider />
                <InlineStack gap="400" align="space-between" blockAlign="center">
                  <BlockStack gap="100">
                    <Text as="p" variant="headingXl">$29</Text>
                    <Text as="p" tone="subdued" variant="bodySm">one-time charge</Text>
                  </BlockStack>
                  <Button
                    variant="primary"
                    size="large"
                    onClick={onBuy}
                    loading={isBillingPending}
                  >
                    Generate handoff report — $29
                  </Button>
                </InlineStack>
                <Text as="p" tone="subdued" variant="bodySm">
                  Secured by Shopify Payments. No card information touches our servers.
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">How it works</Text>
              <BlockStack gap="200">
                {[
                  ["1", "Enter any credential notes below"],
                  ["2", "Click purchase — approve via Shopify's secure payment page"],
                  ["3", "Return here and download your PDF instantly"],
                  ["4", "Re-download any time within 30 days"],
                ].map(([step, text]) => (
                  <InlineStack key={step} gap="300" blockAlign="start">
                    <Box
                      background="bg-surface-active"
                      borderRadius="full"
                      padding="100"
                      minWidth="24px"
                    >
                      <Text as="span" variant="bodySm" fontWeight="bold" alignment="center">
                        {step}
                      </Text>
                    </Box>
                    <Text as="p" variant="bodySm">{text}</Text>
                  </InlineStack>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// STATE 3 — Paid / Generate Report
// ---------------------------------------------------------------------------
function GenerateState({ onGenerate, isGenerating, notes, onNotesChange, paidAt, paymentJustConfirmed }) {
  return (
    <Page title="LaunchGate — Shopify Handoff">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {paymentJustConfirmed && (
              <Banner
                tone="success"
                title="Payment confirmed"
                onDismiss={() => {}}
              >
                <p>Your purchase is active for 30 days. Generate your handoff report below.</p>
              </Banner>
            )}

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Credential notes (optional)</Text>
                <TextField
                  label="Add API keys, DNS login, hosting credentials, or any notes for your client"
                  value={notes}
                  onChange={onNotesChange}
                  multiline={8}
                  maxLength={2000}
                  showCharacterCount
                  helpText="This section is manually entered and will appear in the report. Never store passwords here — use a password manager link instead."
                  autoComplete="off"
                  placeholder={`Example:\nShopify Admin: admin@store.com\nKlaviyo API Key: pk_xxx\nDomain registrar: Namecheap\nDNS: Cloudflare`}
                />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd">Your report is ready</Text>
                    {paidAt && (
                      <Text as="p" tone="subdued" variant="bodySm">
                        Purchased {new Date(paidAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                        })} · Valid for 30 days
                      </Text>
                    )}
                  </BlockStack>
                  <Button
                    variant="primary"
                    size="large"
                    onClick={onGenerate}
                    loading={isGenerating}
                  >
                    {isGenerating ? "Generating PDF…" : "Download handoff report"}
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">What's included</Text>
              <List type="bullet">
                <List.Item>Store overview & plan details</List.Item>
                <List.Item>Active theme & domain info</List.Item>
                <List.Item>Payment configuration</List.Item>
                <List.Item>Shipping profiles</List.Item>
                <List.Item>Staff accounts</List.Item>
                <List.Item>Custom domains & SSL</List.Item>
                <List.Item>Your credential notes</List.Item>
                <List.Item>Professional PDF cover page</List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------
export default function Index() {
  const { hasPurchase, paidAt } = useLoaderData();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const fetcher = useFetcher();
  const billingFetcher = useFetcher();
  const shopify = useAppBridge();

  const [notes, setNotes] = useState("");
  const paymentParam = searchParams.get("payment");
  const paymentJustConfirmed = paymentParam === "success";

  const isPageLoading = navigation.state === "loading";
  const isGenerating = fetcher.state !== "idle";
  const isBillingPending = billingFetcher.state !== "idle";

  // Toast for payment outcomes
  useEffect(() => {
    if (paymentParam === "success") {
      shopify.toast.show("Payment confirmed — generate your report below");
    } else if (paymentParam === "declined") {
      shopify.toast.show("Payment declined", { isError: true });
    } else if (paymentParam === "error") {
      shopify.toast.show("Payment error — please try again", { isError: true });
    }
  }, [paymentParam]);

  // Redirect to Shopify billing confirmation page.
  // Must navigate the top frame (not the iframe) so Shopify's payment
  // page renders correctly. App Bridge v4 uses window.top for this.
  useEffect(() => {
    if (!billingFetcher.data?.confirmationUrl) return;
    // eslint-disable-next-line no-undef
    window.top.location.href = billingFetcher.data.confirmationUrl;
  }, [billingFetcher.data?.confirmationUrl]);

  // Trigger file download when PDF base64 data is returned
  useEffect(() => {
    if (fetcher.data?.code === "PAYMENT_REQUIRED") {
      shopify.toast.show("Purchase required to generate a report", { isError: true });
      return;
    }
    if (!fetcher.data?.pdfBase64) return;

    try {
      const binary = atob(fetcher.data.pdfBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fetcher.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      shopify.toast.show("Report downloaded successfully");
    } catch {
      shopify.toast.show("Download failed — please try again", { isError: true });
    }
  }, [fetcher.data?.pdfBase64]);

  const handleBuy = () => {
    billingFetcher.submit({}, { method: "POST", action: "/api/billing/initiate" });
  };

  const handleGenerate = () => {
    fetcher.submit({ credentialNotes: notes }, { method: "POST" });
  };

  // STATE 1 — Loading
  if (isPageLoading) {
    return <LoadingState />;
  }

  // STATE 2 — Ready to purchase
  if (!hasPurchase) {
    return (
      <PurchaseState
        onBuy={handleBuy}
        isBillingPending={isBillingPending}
        notes={notes}
        onNotesChange={setNotes}
      />
    );
  }

  // STATE 3 — Paid, generate report
  return (
    <GenerateState
      onGenerate={handleGenerate}
      isGenerating={isGenerating}
      notes={notes}
      onNotesChange={setNotes}
      paidAt={paidAt}
      paymentJustConfirmed={paymentJustConfirmed}
    />
  );
}

export function ErrorBoundary() {
  return boundary.error();
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
