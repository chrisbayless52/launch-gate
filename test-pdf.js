/**
 * test-pdf.js
 * Run with: node test-pdf.js
 * Generates test-output.pdf in the project root for visual verification.
 */

import { writeFileSync } from "fs";
import { generateHandoffPDF } from "./app/lib/generatePDF.server.js";

const mockStoreData = {
  store: {
    name: "Acme Outdoors",
    myshopifyDomain: "acme-outdoors.myshopify.com",
    primaryDomain: { url: "https://acmeoutdoors.com" },
    plan: { displayName: "Shopify" },
    currencyCode: "USD",
    timezoneAbbreviation: "PST",
    email: "owner@acmeoutdoors.com",
    createdAt: "2021-03-15T10:00:00Z",
  },
  domains: [
    { host: "acmeoutdoors.com", sslEnabled: true, url: "https://acmeoutdoors.com" },
    { host: "www.acmeoutdoors.com", sslEnabled: true, url: "https://www.acmeoutdoors.com" },
  ],
  paymentSettings: {
    supportedDigitalWallets: ["APPLE_PAY", "GOOGLE_PAY", "SHOP_PAY"],
  },
  apps: [
    {
      title: "Klaviyo",
      developerName: "Klaviyo",
      description: "Email marketing and SMS automation",
      appStoreUrl: "https://apps.shopify.com/klaviyo",
    },
    {
      title: "Recharge Subscriptions",
      developerName: "Recharge",
      description: "Subscription billing and management",
      appStoreUrl: "https://apps.shopify.com/subscription-payments",
    },
    {
      title: "Gorgias",
      developerName: "Gorgias",
      description: "Customer support helpdesk",
      appStoreUrl: "https://apps.shopify.com/gorgias",
    },
  ],
  theme: {
    name: "Dawn",
    role: "MAIN",
    createdAt: "2022-06-01T00:00:00Z",
    updatedAt: "2024-11-20T14:32:00Z",
  },
  shippingProfiles: [
    { name: "General profile", default: true },
    { name: "Oversized items", default: false },
  ],
  staff: [
    { name: "Jordan Smith", email: "jordan@acmeoutdoors.com", isShopOwner: true },
    { name: "Casey Lee", email: "casey@acmeoutdoors.com", isShopOwner: false },
    { name: "Alex Rivera", email: "alex@acmeoutdoors.com", isShopOwner: false },
  ],
  generatedAt: new Date().toISOString(),
};

const mockCredentialNotes = `Shopify Admin Login
URL: https://acme-outdoors.myshopify.com/admin
Email: owner@acmeoutdoors.com
Password: [stored in 1Password under "Acme Shopify Admin"]

Klaviyo API Key: pk_abc123xyz (stored in 1Password)
Recharge API Key: rc_def456uvw (stored in 1Password)

Domain registrar: Namecheap
DNS managed by: Cloudflare
Cloudflare login: cloudflare@acmeoutdoors.com`;

console.log("Generating test PDF...");

generateHandoffPDF(mockStoreData, mockCredentialNotes)
  .then((buffer) => {
    writeFileSync("./test-output.pdf", buffer);
    console.log(`✅ PDF saved to test-output.pdf (${(buffer.length / 1024).toFixed(1)} KB)`);
  })
  .catch((err) => {
    console.error("❌ PDF generation failed:", err);
    process.exit(1);
  });
