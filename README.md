# PlanPilot

Public chat-first app-pricing workspace with Firebase passwordless email links and Google sign-in. Customers can use published pricing tables anonymously. AG Grid Community edits tier names, prices, users, usage and features; edits invalidate the current PayPal billing snapshot.

## Runtime configuration

Configure FIREBASE_APIKEY, FIREBASE_AUTHDOMAIN, FIREBASE_PROJECT_ID and FIREBASE_APPID for your Firebase web app. These are public client configuration, intentionally served by /api/auth/config. Firebase Authentication must enable Google and Email link sign-in, and authorize planpilot-prabbis-demo.abisolaadeniran.chatgpt.site. Web API credentials cannot change these console settings.

OPENAPI_KEY (or OPENAI_API_KEY), PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET and PAYPAL_OWNER_EMAIL stay server-side. AG_STUDIO_KEY is kept private and is not treated as a browser AG Grid Enterprise licence. The community editor needs no licence key.

Google's accounts:lookup endpoint verifies the signed Firebase ID token against the configured project; expired, foreign-project, disabled or unverified identities are rejected. The token lives in a Secure, HttpOnly, SameSite cookie and the browser SDK refreshes it. Authoring requires login. AI use has per-user and global daily demo limits. Clients connect their own PayPal sandbox app in My stores. Each store’s app credentials are encrypted with a server-only AES-GCM key and bound to that store ID. Pricing-plan creation and embeds can use a selected connected store; the configured workspace merchant is restricted to its owner. Publishing and delivery inspection are scoped to the signed-in user. Partner OAuth onboarding and live payments are not implemented.

## Hosted checkout

D1 stores published pricing snapshots, checkout sessions, PayPal webhook registration and signed notification deliveries. Drizzle migrations own the schema. Publishing verifies all three active PayPal plans against the draft and registers or reuses this app's public /api/paypal/webhook listener. Each pricing table has a public /embed/:id page and an isolated JavaScript SDK served at /planpilot-sdk.js. Embed publish settings include HTTPS website origin, success/cancel redirects and merchant webhook URL on the same origin. The merchant is the owner who configures these URLs. Public pricing exposes no signing secrets or PayPal credentials.

Buyer checkout only accepts a published tier. The server checks current PayPal pricing, generates an unpredictable saved checkout session and creates a sandbox subscription with its own anonymous customer reference. PayPal return requires both the saved session and matching subscription ID, then verifies the current PayPal plan, custom reference and ACTIVE status before redirecting. Redirect query parameters are for display and never prove entitlement.

PayPal notifications use postback signature verification with the original webhook JSON bytes and the registered webhook ID. The receiver ignores unrelated subscriptions, deduplicates event IDs and re-reads subscription state. Merchant forwarding uses timestamped HMAC-SHA256 signatures. Failed deliveries remain persisted; non-2xx responses ask PayPal to retry, and the owner can manually retry from Embed & SDK. Retried deliveries re-read current subscription status so delayed activation notifications cannot restore cancelled access. Webhook targets are HTTPS, origin constrained, validated for public DNS addresses, and redirects are not followed. Browser redirect and server webhook delivery are independent.

The downloadable Node.js receiver verifies HMAC signatures and a five-minute timestamp window and has a persistent SQLite event ledger. Its account-provisioning callback deliberately fails until mapped to the merchant's app API. Anonymous references must be associated with the merchant's own authenticated users by a trusted server integration; browser-supplied user IDs must never grant access. A production multi-merchant release needs merchant onboarding, robust account mapping, operational queues and live payment testing. This release is sandbox only.

## Checks

Run node scripts/test-pricing.mjs, node scripts/test-paypal.mjs, node scripts/test-public-checkout.mjs and pnpm exec tsc --noEmit. Public-checkout tests use in-memory SQLite and mocked providers to verify authorization, pricing redaction, tier matching, redirect checks, PayPal verification bytes, durable retries and signed cancellation status. Real Google/email login and PayPal sandbox buyer approval still require interactive testing; simulator webhooks cannot use PayPal postback verification.

## APIMatic expansion

Accepting an API contract and language selection could support generation of merchant-specific entitlement/redirect code. That feature is not implemented here. The APIMatic PayPal Context Plugin requirement calls for actual plugin use while building the integration; ordinary documentation research and generic code generation do not establish compliance. See https://paypalaihackathon.devpost.com/details/apimatic and https://github.com/apimatic/context-matic.

## AI stores

My stores creates independent owner-scoped store records. Clients can generate a page from a brief, edit copy and styling, manage physical/digital/service products, import up to 20 PayPal catalog descriptions, and choose a unique public path such as /abistore. Imports require explicit prices: the subscription product catalog does not expose retail inventory/one-time prices. Reserved paths are blocked. Drafts are private and persist in D1; the public page uses a separate published snapshot. Save never changes that snapshot. Making a store private removes public page/checkout access.

The editor includes product images and a hero image through HTTPS URLs, private digital-file uploads to R2 (20 MB per file), accent/background/font/layout/corner controls, shipping/tax settings, and owner-scoped orders with delivery addresses from PayPal. Generate creates a draft only and any suggested prices need merchant review.

Carts keep only device-local IDs and quantities. The server prices against published products, rejects hidden/missing items, validates quantities and calculates CAD totals, tax and flat shipping in integer cents. Guest PayPal checkout needs no PlanPilot account. Optional Google/email sign-in uses the same Firebase project and store-scoped customer memberships; purchases are queried by both store and verified UID. Guest purchases remain receipt-based and are not automatically claimed by email matching.

Orders are created with the selected store’s credentials. Saved custom IDs, order IDs and exact CAD capture amounts must match before an order is marked paid. Verified store-specific PayPal webhooks can capture approved orders even if the buyer doesn’t return. Refund/reversal notifications revoke downloads. Retry captures use stable request IDs. Digital delivery checks a high-entropy receipt capability, current PayPal capture and store-bound private file key before returning an attachment. Receipt pages are noindex with no-referrer; receipts must be kept private. The order and subscription flows remain separate.

Email-link completion is automatic when the requesting device has the saved email. Opening on another device requires entering the recipient email, following Firebase’s protection against sign-in session injection. Links preserve a validated local return path so customers return to their store.

Run node scripts/test-stores.mjs for owner isolation, encrypted credentials, path constraints, draft/publish behaviour, cart repricing, paid file access and revoked downloads. This build supports sandbox checkout; live merchant onboarding, shipping automation, varied tax rules and real payment acceptance require further work.
