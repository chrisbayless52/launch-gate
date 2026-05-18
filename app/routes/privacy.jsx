export default function PrivacyPolicy() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Privacy Policy — LaunchGate</title>
        <style>{`
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; line-height: 1.6; }
          h1 { font-size: 2rem; margin-bottom: 4px; }
          h2 { font-size: 1.2rem; margin-top: 2rem; }
          p, li { font-size: 1rem; color: #333; }
          a { color: #008060; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e1e3e5; font-size: 0.95rem; }
          th { background: #f6f6f7; font-weight: 600; }
          .subtitle { color: #6d7175; margin-bottom: 2rem; }
        `}</style>
      </head>
      <body>
        <h1>Privacy Policy</h1>
        <p className="subtitle">LaunchGate · Last updated: May 18, 2026 · <a href="mailto:support@getlaunchgate.com">support@getlaunchgate.com</a></p>

        <p>LaunchGate ("we", "our", "us") is a Shopify app that generates a one-time handoff PDF report of your store's configuration. This policy explains exactly what data we access, what we store, and how long we keep it.</p>

        <h2>Data we access (read-only)</h2>
        <p>When you generate a report, we make the following read-only API calls to your Shopify store. We never write, modify, or delete any store data.</p>
        <ul>
          <li><strong>Store overview</strong> — shop name, plan name, primary domain, currency, timezone, and contact email</li>
          <li><strong>Active theme</strong> — theme name and published status</li>
          <li><strong>Payment configuration</strong> — supported digital wallets and payment settings (no card or transaction data)</li>
          <li><strong>Shipping profiles</strong> — delivery profile names and zone counts</li>
          <li><strong>Custom domains</strong> — domain names and SSL status</li>
          <li><strong>Staff contact</strong> — the store owner's email address (used as the primary contact in the report)</li>
        </ul>
        <p>All data is fetched at report generation time and used only to produce your PDF. It is not retained in our database after the PDF is generated.</p>

        <h2>Data we do NOT access or store</h2>
        <ul>
          <li>Customer names, email addresses, or any PII</li>
          <li>Order history or transaction amounts</li>
          <li>Product catalog, inventory, or pricing</li>
          <li>Discount codes or gift cards</li>
          <li>Analytics or marketing data</li>
          <li>Payment card details (we never see these)</li>
        </ul>

        <h2>Data we store in our database</h2>
        <p><strong>Shopify session token</strong> — Required for OAuth authentication. Contains your shop domain and an encrypted access token. Deleted automatically when you uninstall the app.</p>
        <p><strong>Purchase record</strong> — When you complete the one-time purchase, we store your shop domain, the Shopify charge ID, and the timestamp of payment. Retained for 90 days, then deleted.</p>

        <h2>Data retention summary</h2>
        <table>
          <thead>
            <tr><th>Data type</th><th>Retention</th><th>Deletion trigger</th></tr>
          </thead>
          <tbody>
            <tr><td>Session token</td><td>Until uninstall</td><td>app/uninstalled webhook</td></tr>
            <tr><td>Purchase record</td><td>90 days</td><td>Automatic expiry</td></tr>
            <tr><td>Store data (for PDF)</td><td>Not stored</td><td>Discarded after PDF generation</td></tr>
          </tbody>
        </table>

        <h2>Third-party services</h2>
        <ul>
          <li><strong>Shopify</strong> — authentication, billing, and store data APIs.</li>
          <li><strong>Railway</strong> — server and database hosting. No customer data is shared.</li>
        </ul>
        <p>We do not use advertising networks, analytics trackers, or sell data to any third party.</p>

        <h2>Your rights</h2>
        <p>You may request deletion of all data we hold for your store at any time by emailing <a href="mailto:support@getlaunchgate.com">support@getlaunchgate.com</a>. We will respond within 5 business days. Uninstalling the app automatically triggers deletion of your session data.</p>

        <h2>Contact</h2>
        <p>Email: <a href="mailto:support@getlaunchgate.com">support@getlaunchgate.com</a><br />Response time: within 2 business days</p>
      </body>
    </html>
  );
}
