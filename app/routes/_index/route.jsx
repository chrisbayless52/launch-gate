import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return { showForm: Boolean(login) };
};

function BoltIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="g-bolt" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5b8cff"/><stop offset="1" stopColor="#7c4dff"/>
        </linearGradient>
      </defs>
      <path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12L13 2z" stroke="url(#g-bolt)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="g-doc" x1="4" y1="2" x2="22" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5b8cff"/><stop offset="1" stopColor="#7c4dff"/>
        </linearGradient>
      </defs>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="url(#g-doc)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="url(#g-doc)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="g-shield" x1="3" y1="2" x2="21" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5b8cff"/><stop offset="1" stopColor="#7c4dff"/>
        </linearGradient>
      </defs>
      <path d="M12 2L3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6L12 2z" stroke="url(#g-shield)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="url(#g-shield)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 4.5" stroke="#5b8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const FEATURES = [
  {
    icon: <BoltIcon />,
    title: "One-click generation",
    body: "Click Generate, approve the $29 one-time charge, and your PDF is ready in under 60 seconds. No setup, no configuration.",
  },
  {
    icon: <DocumentIcon />,
    title: "Complete store snapshot",
    body: "Themes, shipping profiles, payment methods, markets, custom domains, and staff contacts — everything in one clean document.",
  },
  {
    icon: <ShieldIcon />,
    title: "Read-only & secure",
    body: "LaunchGate never writes, modifies, or deletes any store data. Your client's store stays completely untouched.",
  },
];

const STEPS = [
  { n: "01", title: "Install", body: "Add LaunchGate to your Shopify store in one click from the App Store." },
  { n: "02", title: "Generate", body: "Open the app, click Generate Report, and approve the $29 one-time charge." },
  { n: "03", title: "Download", body: "Your PDF is ready instantly. Download it and send it straight to your client." },
];

const REPORT_LEFT = [
  ["Plan", "Shopify"],
  ["Currency", "USD"],
  ["Timezone", "America/New_York"],
  ["Primary domain", "acmesupply.com"],
];

const REPORT_RIGHT = [
  ["Active theme", "Dawn 14.0"],
  ["Markets", "US, CA, EU"],
  ["Shipping zones", "4 profiles"],
  ["SSL", "✓ Active"],
];

const PAYMENT_PILLS = ["Shopify Payments", "PayPal", "Apple Pay", "Google Pay", "Shop Pay"];

export default function LandingPage() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.root}>
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />
      <div className={styles.orb3} aria-hidden="true" />

      {/* Nav */}
      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.navInner}>
          <a href="/" className={styles.navLogo}>
            <div className={styles.logoMark}>L</div>
            LaunchGate
          </a>
          <div className={styles.navRight}>
            <a href="#how" className={styles.navLink}>How it works</a>
            <a href="/privacy" className={styles.navLink}>Privacy</a>
            <a href="mailto:support@getlaunchgate.com" className={styles.navLink}>Support</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Now on the Shopify App Store — $29 one-time
          </div>

          <h1 className={styles.headline}>
            Ship every Shopify project<br />
            <span className={styles.headlineGrad}>with a professional handoff</span>
          </h1>

          <p className={styles.heroSub}>
            LaunchGate generates a complete PDF snapshot of your client's store in one click —
            themes, shipping, markets, payment setup, and more. Built for agencies and freelancers
            who deliver Shopify stores professionally.
          </p>

          {showForm ? (
            <div className={styles.formCard}>
              <p className={styles.formTitle}>Open in your Shopify store</p>
              <Form method="post" action="/auth/login">
                <label className={styles.formLabel}>
                  Shop domain
                  <input
                    className={styles.formInput}
                    type="text"
                    name="shop"
                    placeholder="your-store.myshopify.com"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </label>
                <button className={styles.btnPrimary} type="submit">
                  Open LaunchGate →
                </button>
              </Form>
            </div>
          ) : (
            <div className={styles.heroActions}>
              <a href="https://apps.shopify.com" className={styles.btnPrimary}>
                Add to Shopify — $29
              </a>
              <a href="#how" className={styles.btnGhost}>
                See how it works
              </a>
            </div>
          )}

          <div className={styles.statsRow}>
            {[["$29", "one-time payment"], ["60 sec", "to generate"], ["100%", "read-only"]].map(
              ([num, label]) => (
                <div key={label} className={styles.stat}>
                  <span className={styles.statNum}>{num}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Mockup */}
      <section className={styles.mockupSection} aria-label="Product preview">
        <div className={styles.container}>
          <div className={styles.mockupWrap}>
            <div className={styles.mockupGlow} aria-hidden="true" />
            <div className={styles.mockupCard}>
              <div className={styles.mockupBar}>
                <div className={styles.mockupDots} aria-hidden="true">
                  <span className={styles.dot} style={{ background: "#ff5f57" }} />
                  <span className={styles.dot} style={{ background: "#febc2e" }} />
                  <span className={styles.dot} style={{ background: "#28c840" }} />
                </div>
                <span className={styles.mockupBarTitle}>LaunchGate — Handoff Report.pdf</span>
              </div>

              <div className={styles.reportBody}>
                <div className={styles.reportHeader}>
                  <div>
                    <div className={styles.reportStoreName}>Acme Supply Co.</div>
                    <div className={styles.reportMeta}>Generated May 18, 2026 · acmesupply.com</div>
                  </div>
                  <div className={styles.reportBadge}>Report Ready</div>
                </div>

                <div className={styles.reportGrid}>
                  <div className={styles.reportSection}>
                    <div className={styles.reportSectionTitle}>Store Overview</div>
                    {REPORT_LEFT.map(([k, v]) => (
                      <div key={k} className={styles.reportRow}>
                        <span className={styles.reportKey}>{k}</span>
                        <span className={styles.reportVal}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.reportSection}>
                    <div className={styles.reportSectionTitle}>Theme & Setup</div>
                    {REPORT_RIGHT.map(([k, v]) => (
                      <div key={k} className={styles.reportRow}>
                        <span className={styles.reportKey}>{k}</span>
                        <span className={styles.reportVal}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.reportSection}>
                  <div className={styles.reportSectionTitle}>Payment Methods</div>
                  <div className={styles.reportPills}>
                    {PAYMENT_PILLS.map((p) => (
                      <span key={p} className={styles.reportPill}>{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection} aria-labelledby="features-heading">
        <div className={styles.container}>
          <div className={styles.sectionMeta}>
            <span className={styles.sectionLabel}>Why LaunchGate</span>
            <h2 className={styles.sectionHeading} id="features-heading">
              Everything your client needs to know
            </h2>
            <p className={styles.sectionSub}>
              Stop sending handoff notes in Notion or Slack. One PDF — everything covered.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map(({ icon, title, body }) => (
              <div key={title} className={styles.featureCard}>
                <div className={styles.featureIconWrap}>{icon}</div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureBody}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howSection} id="how" aria-labelledby="how-heading">
        <div className={styles.container}>
          <div className={styles.sectionMeta}>
            <span className={styles.sectionLabel}>How it works</span>
            <h2 className={styles.sectionHeading} id="how-heading">
              Three steps, sixty seconds
            </h2>
          </div>
          <div className={styles.stepsGrid}>
            {STEPS.map(({ n, title, body }, i) => (
              <>
                <div key={n} className={styles.step}>
                  <div className={styles.stepNum}>{n}</div>
                  <h3 className={styles.stepTitle}>{title}</h3>
                  <p className={styles.stepBody}>{body}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div key={`arrow-${n}`} className={styles.stepArrow} aria-hidden="true">→</div>
                )}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaSection} aria-labelledby="cta-heading">
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaGlow} aria-hidden="true" />
            <h2 className={styles.ctaHeading} id="cta-heading">
              Ready to deliver like a pro?
            </h2>
            <p className={styles.ctaSub}>
              Join agencies and freelancers who use LaunchGate to close out Shopify projects
              professionally.
            </p>
            <div className={styles.ctaChecks}>
              {["$29 one-time — no subscription", "Instant PDF download", "Works on any Shopify plan"].map(
                (item) => (
                  <div key={item} className={styles.ctaCheck}>
                    <CheckIcon />
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>

            {showForm ? (
              <div className={styles.ctaFormWrap}>
                <Form method="post" action="/auth/login">
                  <div className={styles.ctaFormRow}>
                    <input
                      className={styles.ctaInput}
                      type="text"
                      name="shop"
                      placeholder="your-store.myshopify.com"
                      autoComplete="off"
                    />
                    <button className={styles.btnPrimary} type="submit">
                      Get Started →
                    </button>
                  </div>
                </Form>
              </div>
            ) : (
              <div className={styles.ctaBtnStandalone}>
                <a href="https://apps.shopify.com" className={styles.btnPrimary}
                  style={{ width: "auto", display: "inline-flex" }}>
                  Add to Shopify — $29
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>LaunchGate</span>
          <div className={styles.footerLinks}>
            <a href="/privacy" className={styles.footerLink}>Privacy Policy</a>
            <a href="mailto:support@getlaunchgate.com" className={styles.footerLink}>Support</a>
          </div>
          <span className={styles.footerCopy}>© 2026 LaunchGate. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
