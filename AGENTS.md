# Project Architecture Rules

- Use the Firebase Web SDK for browser authentication, Firestore, and Storage; use callable Firebase Cloud Functions for privileged operations because stock, order totals, admin claims, and payment verification must never be trusted to the browser.
- Keep storefront products, variants, categories, orders, and settings in Firestore so the catalog and order history remain durable across devices.
