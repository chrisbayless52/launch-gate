import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  List,
  Divider,
  Box,
} from "@shopify/polaris";

export default function PrivacyPolicy() {
  return (
    <Page
      title="Privacy Policy"
      subtitle="LaunchGate — Shopify Handoff Report"
      backAction={{ content: "Back", url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">

            <Card>
              <BlockStack gap="400">
                <Text as="p" tone="subdued">
                  Last updated: May 16, 2025 · Contact:{" "}
                  <a href="mailto:support@launchgate.app">support@launchgate.app</a>
                </Text>
                <Text as="p">
                  LaunchGate ("we", "our", "us") is a Shopify app that generates
                  a one-time handoff PDF report of your store's configuration.
                  This policy explains exactly what data we access, what we
                  store, and how long we keep it.
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Data we access (read-only)</Text>
                <Text as="p">
                  When you generate a report, we make the following read-only
                  API calls to your Shopify store. We never write, modify, or
                  delete any store data.
                </Text>
                <List type="bullet">
                  <List.Item>
                    <strong>Store overview</strong> — shop name, plan name,
                    primary domain, currency, timezone, and contact email
                  </List.Item>
                  <List.Item>
                    <strong>Installed apps</strong> — app names and developer
                    names (requires read access granted at install)
                  </List.Item>
                  <List.Item>
                    <strong>Active theme</strong> — theme name and published
                    status
                  </List.Item>
                  <List.Item>
                    <strong>Payment configuration</strong> — supported digital
                    wallets and payment settings (no card or transaction data)
                  </List.Item>
                  <List.Item>
                    <strong>Shipping profiles</strong> — delivery profile names
                    and zone counts
                  </List.Item>
                  <List.Item>
                    <strong>Custom domains</strong> — domain names and SSL
                    status
                  </List.Item>
                  <List.Item>
                    <strong>Staff contact</strong> — the store owner's email
                    address (used as the primary contact in the report)
                  </List.Item>
                </List>
                <Text as="p" tone="subdued" variant="bodySm">
                  All data is fetched at report generation time and used only
                  to produce your PDF. It is not retained in our database after
                  the PDF is generated.
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Data we do NOT access or store</Text>
                <List type="bullet">
                  <List.Item>Customer names, email addresses, or any PII</List.Item>
                  <List.Item>Order history or transaction amounts</List.Item>
                  <List.Item>Product catalog, inventory, or pricing</List.Item>
                  <List.Item>Discount codes or gift cards</List.Item>
                  <List.Item>Analytics or marketing data</List.Item>
                  <List.Item>Payment card details (we never see these)</List.Item>
                  <List.Item>Any data from your customers' browsers</List.Item>
                </List>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Data we store in our database</Text>
                <BlockStack gap="300">
                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">Shopify session token</Text>
                    <Text as="p">
                      Required for OAuth authentication. Contains your shop
                      domain and an encrypted access token so you stay logged
                      in. This is standard for all Shopify embedded apps.
                    </Text>
                    <Text as="p" tone="subdued" variant="bodySm">
                      Retention: deleted automatically when you uninstall the
                      app (via the <code>app/uninstalled</code> webhook).
                    </Text>
                  </BlockStack>

                  <Divider />

                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">Purchase record</Text>
                    <Text as="p">
                      When you complete the one-time purchase, we store your
                      shop domain, the Shopify charge ID (a reference number
                      from Shopify's billing system), and the timestamp of
                      payment. This lets us verify you have an active purchase
                      within the 30-day window.
                    </Text>
                    <Text as="p" tone="subdued" variant="bodySm">
                      Retention: 90 days from purchase date, then deleted.
                    </Text>
                  </BlockStack>

                  <Divider />

                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">Credential notes (optional)</Text>
                    <Text as="p">
                      If you type notes into the credential notes field, that
                      text is sent directly to our server, used to render your
                      PDF, and then immediately discarded. It is never stored
                      in our database.
                    </Text>
                  </BlockStack>
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Data retention summary</Text>
                <Box overflowX="scroll">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f6f6f7" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #e1e3e5" }}>Data type</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #e1e3e5" }}>Retention</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #e1e3e5" }}>Deletion trigger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Session token", "Until uninstall", "app/uninstalled webhook"],
                        ["Purchase record", "90 days", "Automatic expiry"],
                        ["Store data (for PDF)", "Not stored", "Discarded after PDF generation"],
                        ["Credential notes", "Not stored", "Discarded after PDF generation"],
                      ].map(([type, retention, trigger]) => (
                        <tr key={type} style={{ borderBottom: "1px solid #e1e3e5" }}>
                          <td style={{ padding: "8px 12px" }}>{type}</td>
                          <td style={{ padding: "8px 12px" }}>{retention}</td>
                          <td style={{ padding: "8px 12px", color: "#6d7175" }}>{trigger}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Third-party services</Text>
                <List type="bullet">
                  <List.Item>
                    <strong>Shopify</strong> — authentication, billing, and
                    store data APIs. Governed by Shopify's Privacy Policy.
                  </List.Item>
                  <List.Item>
                    <strong>Railway</strong> (or similar cloud host) — server
                    hosting. No customer data is shared; only our application
                    code runs on their infrastructure.
                  </List.Item>
                  <List.Item>
                    <strong>Prisma / SQLite</strong> — local database for
                    session and purchase records only.
                  </List.Item>
                </List>
                <Text as="p">
                  We do not use advertising networks, analytics trackers, or
                  sell data to any third party.
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Your rights</Text>
                <Text as="p">
                  You may request deletion of all data we hold for your store at
                  any time by emailing{" "}
                  <a href="mailto:support@launchgate.app">support@launchgate.app</a>.
                  We will respond within 5 business days. Uninstalling the app
                  automatically triggers deletion of your session data via the
                  Shopify GDPR webhook.
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Changes to this policy</Text>
                <Text as="p">
                  If we make material changes, we will update the "Last updated"
                  date above and notify you via the Shopify Partner Dashboard
                  notification system. Continued use of the app after changes
                  constitutes acceptance of the revised policy.
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Contact</Text>
                <Text as="p">
                  Questions about this privacy policy or your data:
                </Text>
                <Text as="p">
                  Email:{" "}
                  <a href="mailto:support@launchgate.app">
                    support@launchgate.app
                  </a>
                  <br />
                  Response time: within 2 business days
                </Text>
              </BlockStack>
            </Card>

          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
