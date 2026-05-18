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
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Professional store handoff reports, in one click</h1>
        <p className={styles.text}>
          LaunchGate generates a complete PDF snapshot of your Shopify store — themes, shipping, markets, payment setup, and more — so you can hand off to clients with confidence.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>One-click PDF report</strong>. Covers products, themes, shipping zones, markets, and orders in a clean, professional document.
          </li>
          <li>
            <strong>Instant download</strong>. No waiting, no emails, no manual data collection — your report is ready in seconds.
          </li>
          <li>
            <strong>Built for agencies</strong>. Perfect for developers and consultants handing off completed Shopify stores to clients.
          </li>
        </ul>
      </div>
    </div>
  );
}
