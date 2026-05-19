import puppeteer from "puppeteer-core";

// Resolve Chrome/Chromium executable path.
// In Docker (Cloud Run): PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
// Locally on Windows: falls back to the default Chrome install path
function getExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  if (process.platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }
  if (process.platform === "win32") {
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }
  return "/usr/bin/chromium";
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function esc(str) {
  if (str == null) return "—";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Component builders
// ---------------------------------------------------------------------------

function kvTable(rows) {
  return `
    <table class="kv-table">
      <tbody>
        ${rows
          .map(
            ([label, value], i) => `
          <tr class="${i % 2 === 1 ? "alt" : ""}">
            <td class="kv-label">${esc(label)}</td>
            <td class="kv-value">${value == null ? "—" : esc(String(value))}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>`;
}

function dataTable(headers, rows, emptyMessage = "No data available.") {
  if (!rows || rows.length === 0) {
    return `<p class="empty">${esc(emptyMessage)}</p>`;
  }
  return `
    <table class="data-table">
      <thead>
        <tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (cells, i) => `
          <tr class="${i % 2 === 1 ? "alt" : ""}">
            ${cells.map((c) => `<td>${c == null ? "—" : esc(String(c))}</td>`).join("")}
          </tr>`
          )
          .join("")}
      </tbody>
    </table>`;
}

function section(title, accentColor, content) {
  return `
    <div class="section">
      <div class="section-header" style="border-left-color: ${accentColor}">
        <h2>${esc(title)}</h2>
      </div>
      <div class="section-body">
        ${content}
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

function buildHTML(storeData, credentialNotes) {
  const {
    store: rawStore,
    apps = [],
    theme,
    paymentSettings,
    shippingProfiles = [],
    staff = [],
    domains = [],
    generatedAt,
  } = storeData;
  const store = rawStore ?? {};

  const generatedDate = formatDateTime(generatedAt);
  const storeName = store.name ?? "Unknown Store";
  const storeDomain = store.myshopifyDomain ?? "";

  // ── Store Overview ────────────────────────────────────────────────────────
  const overviewSection = section(
    "Store Overview",
    "#008060",
    kvTable([
      ["Store name",     store.name],
      ["Primary domain", store.primaryDomain?.url],
      ["Shopify plan",   store.plan?.displayName],
      ["Currency",       store.currencyCode],
      ["Timezone",       store.timezoneAbbreviation],
      ["Contact email",  store.email],
      ["Store created",  formatDate(store.createdAt)],
    ])
  );

  // ── Installed Apps ────────────────────────────────────────────────────────
  const appsSection = section(
    "Installed Apps",
    "#5c6ac4",
    dataTable(
      ["App Name", "Developer", "Description"],
      apps.map((a) => [a.title, a.developerName, a.description]),
      "No installed apps data available (requires elevated API access)."
    )
  );

  // ── Active Theme ──────────────────────────────────────────────────────────
  const themeSection = section(
    "Active Theme",
    "#47c1bf",
    theme
      ? dataTable(
          ["Theme Name", "Status", "Last Updated"],
          [[theme.name, theme.role, formatDate(theme.updatedAt)]]
        )
      : `<p class="empty">No theme data available.</p>`
  );

  // ── Payment Settings ──────────────────────────────────────────────────────
  const wallets = paymentSettings?.supportedDigitalWallets ?? [];
  const paymentSection = section(
    "Payment Settings",
    "#f49342",
    wallets.length > 0
      ? dataTable(
          ["Digital Wallet", "Status"],
          wallets.map((w) => [w, "Enabled"])
        )
      : `<p class="empty">No digital wallets configured.</p>`
  );

  // ── Shipping Profiles ─────────────────────────────────────────────────────
  const shippingSection = section(
    "Shipping Profiles",
    "#de3618",
    dataTable(
      ["Profile Name", "Default"],
      shippingProfiles.map((p) => [p.name, p.default ? "Yes" : "No"]),
      "No shipping profiles configured."
    )
  );

  // ── Staff Accounts ────────────────────────────────────────────────────────
  const staffSection = section(
    "Staff Accounts",
    "#9c6ade",
    dataTable(
      ["Name", "Email", "Role"],
      staff.map((s) => [s.name, s.email, s.isShopOwner ? "Owner" : "Staff"]),
      "No staff data available."
    )
  );

  // ── Custom Domains ────────────────────────────────────────────────────────
  const domainsSection = section(
    "Custom Domains",
    "#006fbb",
    dataTable(
      ["Domain", "SSL", "URL"],
      domains.map((d) => [d.host, d.sslEnabled ? "✓ Enabled" : "✗ Disabled", d.url]),
      "No custom domains configured."
    )
  );

  // ── Credential Notes ──────────────────────────────────────────────────────
  const notesContent = credentialNotes?.trim()
    ? `<div class="credential-box"><pre class="credential-pre">${esc(credentialNotes)}</pre></div>`
    : `<p class="empty">No credential notes provided.</p>`;
  const credentialSection = section("Credential Notes", "#ffc453", notesContent);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>LaunchGate Handoff Report — ${esc(storeName)}</title>
  <style>
    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Page setup ── */
    @page {
      size: A4;
      margin: 20mm 15mm;
    }
    @page :first { margin-top: 0; }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 12.5px;
      line-height: 1.5;
      color: #1a1a1a;
      background: #fff;
    }

    /* ── Cover page ── */
    .cover {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #fff;
      page-break-after: always;
    }
    .cover-top-bar {
      height: 8px;
      background: linear-gradient(90deg, #008060 0%, #47c1bf 100%);
    }
    .cover-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 56px;
    }
    .cover-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #008060;
      margin-bottom: 24px;
    }
    .cover-title {
      font-size: 38px;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1.15;
      margin-bottom: 8px;
    }
    .cover-subtitle {
      font-size: 20px;
      color: #6d7175;
      font-weight: 400;
      margin-bottom: 48px;
    }
    .cover-divider {
      width: 56px;
      height: 3px;
      background: #008060;
      border-radius: 2px;
      margin-bottom: 40px;
    }
    .cover-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px 40px;
      max-width: 480px;
    }
    .cover-meta-item {}
    .cover-meta-label {
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #8c9196;
      margin-bottom: 4px;
    }
    .cover-meta-value {
      font-size: 13px;
      color: #1a1a1a;
      font-weight: 500;
      word-break: break-word;
    }
    .cover-footer {
      padding: 24px 56px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e1e3e5;
    }
    .cover-footer-left {
      font-size: 11px;
      color: #8c9196;
    }
    .cover-footer-brand {
      font-size: 13px;
      font-weight: 700;
      color: #008060;
      letter-spacing: 0.02em;
    }

    /* ── Content area ── */
    .content {
      padding: 0 4px;
    }

    /* ── Sections ── */
    .section {
      margin-bottom: 28px;
      page-break-inside: avoid;
    }
    .section-header {
      border-left: 4px solid #008060;
      padding: 4px 0 4px 12px;
      margin-bottom: 10px;
    }
    .section-header h2 {
      font-size: 13px;
      font-weight: 700;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .section-body {
      padding-left: 16px;
    }

    /* ── Key-value table (Store Overview) ── */
    .kv-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .kv-table tr { page-break-inside: avoid; }
    .kv-table tr.alt td { background: #f6f6f7; }
    .kv-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: top;
    }
    .kv-label {
      width: 38%;
      font-weight: 600;
      color: #6d7175;
      font-size: 11.5px;
    }
    .kv-value {
      color: #1a1a1a;
    }

    /* ── Data tables ── */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      margin-bottom: 4px;
    }
    .data-table thead tr {
      background: #1a1a1a;
    }
    .data-table thead th {
      text-align: left;
      padding: 7px 10px;
      font-size: 10.5px;
      font-weight: 600;
      color: #fff;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .data-table tbody td {
      padding: 6px 10px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: top;
      color: #1a1a1a;
    }
    .data-table tbody tr.alt td { background: #f6f6f7; }
    .data-table tbody tr:last-child td { border-bottom: none; }

    /* ── Empty state ── */
    .empty {
      font-size: 11.5px;
      color: #8c9196;
      font-style: italic;
      padding: 4px 0;
    }

    /* ── Credential notes ── */
    .credential-box {
      background: #fffbf0;
      border: 1px solid #ffc453;
      border-left: 4px solid #ffc453;
      border-radius: 4px;
      padding: 14px 16px;
    }
    .credential-pre {
      font-family: "Courier New", Courier, monospace;
      font-size: 11.5px;
      line-height: 1.7;
      color: #1a1a1a;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* ── Security banner ── */
    .security-banner {
      background: #fff4f4;
      border: 1px solid #ffd2d2;
      border-radius: 4px;
      padding: 10px 14px;
      margin-bottom: 24px;
      font-size: 11px;
      color: #de3618;
      font-weight: 600;
      text-align: center;
      letter-spacing: 0.02em;
    }

    /* ── Footer (repeated via header/footer in @page — approximated here) ── */
    .page-footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #e1e3e5;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #b5babe;
    }
  </style>
</head>
<body>

  <!-- ═══════════════════════════════ COVER PAGE ═══════════════════════════ -->
  <div class="cover">
    <div class="cover-top-bar"></div>
    <div class="cover-body">
      <div class="cover-label">LaunchGate &nbsp;·&nbsp; Store Transition Document</div>
      <div class="cover-title">Shopify Store<br>Handoff Report</div>
      <div class="cover-subtitle">${esc(storeName)}</div>
      <div class="cover-divider"></div>
      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <div class="cover-meta-label">Store domain</div>
          <div class="cover-meta-value">${esc(storeDomain)}</div>
        </div>
        <div class="cover-meta-item">
          <div class="cover-meta-label">Shopify plan</div>
          <div class="cover-meta-value">${esc(store.plan?.displayName)}</div>
        </div>
        <div class="cover-meta-item">
          <div class="cover-meta-label">Currency</div>
          <div class="cover-meta-value">${esc(store.currencyCode)}</div>
        </div>
        <div class="cover-meta-item">
          <div class="cover-meta-label">Generated</div>
          <div class="cover-meta-value">${esc(generatedDate)}</div>
        </div>
      </div>
    </div>
    <div class="cover-footer">
      <div class="cover-footer-left">Confidential &nbsp;·&nbsp; For authorized recipients only</div>
      <div class="cover-footer-brand">LaunchGate</div>
    </div>
  </div>

  <!-- ════════════════════════════ CONTENT PAGES ══════════════════════════ -->
  <div class="content">

    <div class="security-banner">
      ⚠ CONFIDENTIAL — This document contains sensitive store information. Do not share or store insecurely.
    </div>

    ${overviewSection}
    ${appsSection}
    ${themeSection}
    ${paymentSection}
    ${shippingSection}
    ${staffSection}
    ${domainsSection}
    ${credentialSection}

    <div class="page-footer">
      <span>Generated by LaunchGate &nbsp;·&nbsp; ${esc(generatedDate)}</span>
      <span>Confidential — Keep this document secure</span>
    </div>

  </div>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// PDF generator
// ---------------------------------------------------------------------------

export async function generateHandoffPDF(storeData, credentialNotes = "") {
  const html = buildHTML(storeData, credentialNotes);

  const browser = await puppeteer.launch({
    executablePath: getExecutablePath(),
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
