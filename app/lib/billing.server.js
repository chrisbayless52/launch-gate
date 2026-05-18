/**
 * billing.server.js
 *
 * Shopify one-time billing via the GraphQL Admin API.
 * Uses appPurchaseOneTimeCreate — the only approved billing method
 * for Shopify App Store apps. Custom payment flows are not permitted.
 *
 * Accepts `admin` (the graphql client from authenticate.admin(request)).
 */

const CHARGE_NAME = "Shopify Handoff Report";
const CHARGE_AMOUNT = "29.00";
const CHARGE_CURRENCY = "USD";

// ---------------------------------------------------------------------------
// createHandoffCharge
// ---------------------------------------------------------------------------

/**
 * Initiates a one-time charge and returns the Shopify confirmation URL.
 * The merchant must visit this URL to approve the charge.
 *
 * @param {object} admin      - graphql client from authenticate.admin()
 * @param {string} shopDomain - e.g. "merchant.myshopify.com"
 * @returns {{ confirmationUrl: string, id: string }}
 */
export async function createHandoffCharge(admin, shopDomain) {
  const appUrl = process.env.SHOPIFY_APP_URL?.replace(/\/$/, "");
  if (!appUrl) throw new Error("SHOPIFY_APP_URL is not set");

  const returnUrl = `${appUrl}/billing/confirm`;
  const isTest = process.env.NODE_ENV !== "production";

  const response = await admin.graphql(
    `#graphql
    mutation appPurchaseOneTimeCreate(
      $name: String!
      $price: MoneyInput!
      $returnUrl: URL!
      $test: Boolean
    ) {
      appPurchaseOneTimeCreate(
        name: $name
        returnUrl: $returnUrl
        price: $price
        test: $test
      ) {
        userErrors { field message }
        appPurchaseOneTime { id }
        confirmationUrl
      }
    }`,
    {
      variables: {
        name: CHARGE_NAME,
        price: { amount: CHARGE_AMOUNT, currencyCode: CHARGE_CURRENCY },
        returnUrl,
        test: isTest,
      },
    }
  );

  const json = await response.json();
  const result = json.data?.appPurchaseOneTimeCreate;

  if (result?.userErrors?.length) {
    throw new Error(
      result.userErrors.map((e) => `${e.field}: ${e.message}`).join("; ")
    );
  }

  if (!result?.confirmationUrl) {
    throw new Error("No confirmationUrl returned from Shopify billing API");
  }

  return {
    confirmationUrl: result.confirmationUrl,
    id: result.appPurchaseOneTime.id,
  };
}

// ---------------------------------------------------------------------------
// verifyCharge
// ---------------------------------------------------------------------------

/**
 * Checks the status of a one-time charge by its GID.
 *
 * @param {object} admin    - graphql client from authenticate.admin()
 * @param {string} chargeId - Shopify GID, e.g. "gid://shopify/AppPurchaseOneTime/123"
 * @returns {{ id: string, name: string, status: "PENDING"|"ACTIVE"|"DECLINED"|"EXPIRED" }}
 */
export async function verifyCharge(admin, chargeId) {
  const response = await admin.graphql(
    `#graphql
    query appPurchaseOneTime($id: ID!) {
      node(id: $id) {
        ... on AppPurchaseOneTime {
          id
          name
          status
        }
      }
    }`,
    { variables: { id: chargeId } }
  );

  const json = await response.json();
  const node = json.data?.node;

  if (!node) {
    throw new Error(`Charge not found: ${chargeId}`);
  }

  return {
    id: node.id,
    name: node.name,
    status: node.status,
  };
}
