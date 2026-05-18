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

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Professional store handoffs, in one click</h1>
          <p>
            LaunchGate generates a complete PDF snapshot of your Shopify store —
            themes, shipping, markets, payment setup, and more — so you can hand
            off to clients with confidence.
          </p>
          <div className={styles.heroActions}>
            <a href="https://apps.shopify.com/launchgate">
              <button className={styles.primaryBtn}>Add to Shopify — $29</button>
            </a>
            <a href={`${styles.secondaryBtn}`} style={{ display: "none" }} />
          </div>

          {showForm && (
            <div className={styles.formCard}>
              <Form method="post" action="/auth/login">
                <label>
                  Shop domain
                  <input
                    className={styles.input}
                    type="text"
                    name="shop"
                    placeholder="my-shop-domain.myshopify.com"
                  />
                </label>
                <button className={styles.primaryBtn} type="submit">
                  Log in
                </button>
              </Form>
            </div>
          )}
        </div>

        <div className={styles.preview}>
          <div className={styles.previewCard}>
            <div className={styles.mockWindow}>
              <div className={`${styles.mockLine} ${styles.large}`} />
              <div className={`${styles.mockLine} ${styles.medium}`} />
              <div className={`${styles.mockLine} ${styles.small}`} />
              <div className={`${styles.mockLine} ${styles.large}`} />
              <div className={`${styles.mockLine} ${styles.medium}`} />
              <div className={`${styles.mockLine} ${styles.small}`} />
              <div className={`${styles.mockLine} ${styles.large}`} />
              <div className={`${styles.mockLine} ${styles.medium}`} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.featureCard}>
          <h3>One-click PDF report</h3>
          <p>Covers products, themes, shipping zones, markets, and orders in a clean, professional document.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Instant download</h3>
          <p>No waiting, no emails, no manual data collection — your report is ready in seconds.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Built for agencies</h3>
          <p>Perfect for developers and consultants handing off completed Shopify stores to clients.</p>
        </div>
      </div>
    </div>
  );
}
