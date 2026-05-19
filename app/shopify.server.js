import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

class LoggingSessionStorage {
  constructor(inner) { this.inner = inner; }
  async storeSession(session) {
    console.log("[session] storeSession id:", session.id, "shop:", session.shop, "hasToken:", !!session.accessToken);
    try {
      const r = await this.inner.storeSession(session);
      console.log("[session] storeSession SUCCESS");
      return r;
    } catch (err) {
      console.error("[session] storeSession FAILED:", err.message);
      throw err;
    }
  }
  async loadSession(id) {
    console.log("[session] loadSession id:", id);
    try {
      const r = await this.inner.loadSession(id);
      console.log("[session] loadSession result:", r ? `FOUND shop:${r.shop} hasToken:${!!r.accessToken}` : "NOT FOUND");
      return r;
    } catch (err) {
      console.error("[session] loadSession FAILED:", err.message);
      throw err;
    }
  }
  async deleteSession(id) { return this.inner.deleteSession(id); }
  async deleteSessions(ids) { return this.inner.deleteSessions(ids); }
  async findSessionsByShop(shop) {
    console.log("[session] findSessionsByShop:", shop);
    const r = await this.inner.findSessionsByShop(shop);
    console.log("[session] findSessionsByShop count:", r.length);
    return r;
  }
}

const apiKey = (process.env.SHOPIFY_API_KEY ?? "").trim();
const apiSecret = (process.env.SHOPIFY_API_SECRET ?? "").trim();
console.log("[config] SHOPIFY_API_KEY length:", apiKey.length, "value:", JSON.stringify(apiKey));
console.log("[config] SHOPIFY_API_SECRET length:", apiSecret.length, "starts:", apiSecret.slice(0, 8));

const shopify = shopifyApp({
  apiKey: apiKey,
  apiSecretKey: apiSecret,
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new LoggingSessionStorage(new PrismaSessionStorage(prisma)),
  distribution: AppDistribution.AppStore,
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
