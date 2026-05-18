/**
 * storeData.server.js
 *
 * Fetches all store data needed for a LaunchGate handoff report.
 * Every query runs in parallel via Promise.all. If an individual query
 * fails it logs the error and returns an empty value — the rest still succeed.
 *
 * Accepts the `admin` graphql client from authenticate.admin(request).
 * GraphQL Admin API only — zero REST calls.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function gql(admin, query, variables = {}) {
  const response = await admin.graphql(query, { variables });
  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data;
}

function safe(label, promise, fallback) {
  return promise.catch((err) => {
    console.error(`[storeData] ${label} failed:`, err.message ?? err);
    return fallback;
  });
}

// ---------------------------------------------------------------------------
// Individual queries
// ---------------------------------------------------------------------------

async function fetchShop(admin) {
  const data = await gql(admin, `#graphql
    query LaunchGateShop {
      shop {
        name
        myshopifyDomain
        primaryDomain { url }
        plan { displayName }
        currencyCode
        timezoneAbbreviation
        email
        createdAt
        # domains live on shop, not at root
        domains {
          host
          sslEnabled
          url
        }
        # payment settings live on shop
        paymentSettings {
          supportedDigitalWallets
        }
      }
    }
  `);

  const { domains, paymentSettings, ...store } = data.shop;
  return { store, domains, paymentSettings };
}

async function fetchApps(admin) {
  const data = await gql(admin, `#graphql
    query LaunchGateApps {
      appInstallations(first: 50) {
        nodes {
          app {
            title
            developerName
            description
            appStoreAppUrl
          }
          launchUrl
        }
      }
    }
  `);
  return data.appInstallations.nodes.map((node) => ({
    title: node.app.title,
    developerName: node.app.developerName,
    description: node.app.description,
    appStoreUrl: node.app.appStoreAppUrl,
    launchUrl: node.launchUrl,
  }));
}

async function fetchTheme(admin) {
  const data = await gql(admin, `#graphql
    query LaunchGateTheme {
      themes(first: 20) {
        nodes {
          name
          role
          createdAt
          updatedAt
        }
      }
    }
  `);
  const themes = data.themes.nodes;
  // Prefer published (MAIN) theme; fall back to first available.
  return themes.find((t) => t.role === "MAIN") ?? themes[0] ?? null;
}

async function fetchShippingProfiles(admin) {
  // locations sub-field requires read_locations — omit it, fetch profile names only.
  const data = await gql(admin, `#graphql
    query LaunchGateShipping {
      deliveryProfiles(first: 10) {
        nodes {
          name
          default
        }
      }
    }
  `);
  return data.deliveryProfiles.nodes;
}

async function fetchStaff(admin) {
  // staffMembers requires read_users scope which is unavailable to public apps.
  // Return the shop contact email as the owner entry instead.
  const data = await gql(admin, `#graphql
    query LaunchGateStaff {
      shop {
        name
        email
      }
    }
  `);
  return [{ name: data.shop.name, email: data.shop.email, isShopOwner: true }];
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Fetches all store data in parallel and returns a structured report object.
 *
 * @param {object} admin - The graphql client from authenticate.admin(request)
 * @returns {Promise<object>} Structured store data
 */
export async function fetchStoreData(admin) {
  const [shopResult, theme, shippingProfiles, staff] = await Promise.all([
    safe("shop",             fetchShop(admin),             { store: null, domains: [], paymentSettings: null }),
    safe("theme",            fetchTheme(admin),            null),
    safe("shippingProfiles", fetchShippingProfiles(admin), []),
    safe("staff",            fetchStaff(admin),            []),
  ]);

  return {
    store: shopResult.store,
    domains: shopResult.domains,
    paymentSettings: shopResult.paymentSettings,
    apps: [], // requires read_apps scope — not available for public apps
    theme,
    shippingProfiles,
    staff,
    generatedAt: new Date().toISOString(),
  };
}
