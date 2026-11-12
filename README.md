# PlanPilot

PlanPilot helps businesses turn an app, professional service, appointment or programme into clear pricing. Describe an offer, answer the assistant’s questions, review the costs and publish a complete pricing page or a cards-only embed. PayPal sandbox checkout can be included in the same publishing flow.

## Deployment flow

**Commit and push to GitHub → Render builds the linked `main` branch → the new version is deployed.**

`render.yaml` enables automatic deployment on commits. `.github/workflows/checks.yml` runs application checks and a Node production build. You can change Render’s trigger to `checksPass` if deployments should wait for GitHub checks instead of starting on every push.

This project has two supported runtime targets:

| Target | Authentication | Application records | Uploaded files |
| --- | --- | --- | --- |
| Render / Node (`DATA_BACKEND=firebase`) | Firebase Authentication | Cloud Firestore | Firebase Storage |
| Existing Sites deployment | Firebase Authentication | Cloudflare D1 | Cloudflare R2 |

The existing Sites deployment continues to use its current data. Selecting Firebase for a Render deployment does **not** automatically copy existing D1 records or R2 files. See **Existing data** below.

## Features

- AI pricing for subscription apps, one-time appointments, independent offers and programmes.
- Clarifying questions before generating offers when important details are missing.
- Editable prices, features, usage allowances, delivery costs and contribution-margin assumptions.
- Private saved conversations, each identified by a UUID.
- Isolated 24-hour guest demos with a sidebar Sandbox demo switch.
- One publishing dialog: pricing only, or pricing with PayPal sandbox checkout.
- Hosted pricing pages at `/pricing/:id`; cards-only embeds at `/embed/:id`.
- Customer checkout without a PlanPilot login.
- Owner-scoped PayPal connections with encrypted server-side credentials, friendly names and reversible archiving.
- Server-verified PayPal subscription returns, one-time captures and payment notifications.

**Sandbox only:** live PayPal merchant onboarding and live payments are not implemented. A completed sandbox checkout does not automatically provision access in another application.

## Requirements

- Node.js 24 and Corepack/pnpm (the package manager version is pinned in `package.json`).
- A Firebase project with Authentication, a Firestore database in Native mode and a Storage bucket.
- A server service account for that Firebase project.
- An OpenAI API key to generate pricing; without it, examples and editing remain available.
- PayPal sandbox app credentials to test checkout.

## Local development for Render

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
# Fill in your local environment variables. Do not commit .env.local.
pnpm run dev:render
```

The app runs at `http://localhost:3000`. Google/email-link authentication and Secure cookies should be tested on an HTTPS deployment. Local development is useful for rendering and unit tests; use an HTTPS local proxy or the deployed Render URL for a complete authentication/checkout test.

Build and run a production Node server:

```bash
pnpm run build:render
pnpm exec next start -H 0.0.0.0 -p 3000
```

The original Sites build commands (`dev`, `build`, `start`) retain their Cloudflare runtime configuration. Use the `:render` commands on Node/Render.

## Firebase setup

Use a dedicated Firebase project for this deployment, or carefully merge the supplied rules and indexes into a shared project. Do not overwrite another application’s rules.

1. Register a Firebase **web app**. Put its API key, auth domain, project ID and app ID in the corresponding environment variables below.
2. In Authentication, enable **Google** and **Email/Password → Email link (passwordless sign-in)**.
3. Add your Render hostname and any custom domain to Authentication’s **Authorized domains**. Check the email-link redirect domain if you customise it.
4. Create the Firestore database in **Native mode** and create/select the Firebase Storage bucket. Firebase service availability, billing requirements and quotas apply independently of Render.
5. Create a server service account with Firestore data access (`roles/datastore.user`) and object access to the selected Storage bucket (`roles/storage.objectAdmin`, preferably scoped to that bucket). Store the service-account JSON in the **server-only** `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable. Never commit or expose it to the browser.
6. Deploy the supplied rules and indexes using the Firebase CLI, or configure equivalent rules/indexes in the Firebase console:

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage --project YOUR_PROJECT_ID
   ```

   The supplied rules deny direct browser access. PlanPilot’s server authenticates users, checks ownership or receipt capabilities, then accesses Firestore/Storage using its service account. Firebase Authentication itself continues to use the browser SDK.

The default collection prefix is `planpilot_`. If you change `FIRESTORE_COLLECTION_PREFIX`, update the collection names in `firebase/firestore.indexes.json` as well. Firestore may return an index requirement for an additional query shape; create that index before relying on the corresponding feature.

Application records live in separate Firestore collections, including projects, pricing chats, saved connections, checkout sessions, deliveries and demo identities. The server’s repository compatibility layer translates the application’s fixed query subset into document operations; it does not expose a SQL endpoint or store the whole database in one document. Writes use Firestore transactions, with uniqueness records for fields such as receipt and PayPal IDs. Very large saved records are rejected before writing rather than truncated.

## Environment variables

`.env.example` contains **empty placeholders only**. Set actual values in `.env.local` locally and in Render’s **Environment** settings in production. Never add secrets to `render.yaml`, source files, GitHub Actions logs or browser code.

| Variable | Purpose |
| --- | --- |
| `DATA_BACKEND` | `firebase` on Render. Omit on the existing Sites deployment to retain D1/R2. |
| `PUBLIC_SITE_URL` | Optional canonical HTTPS origin. On Render, the automatically supplied `RENDER_EXTERNAL_URL` is used if this is absent. Set this for a custom domain. |
| `FIREBASE_APIKEY` | Firebase web-app API key. Public client configuration, not an administrator credential. |
| `FIREBASE_AUTHDOMAIN` | Firebase Authentication domain. |
| `FIREBASE_PROJECT_ID` | Firebase project ID; must match the server service account. |
| `FIREBASE_APPID` | Firebase web-app ID. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **Secret.** Entire service-account JSON, as a server environment variable. |
| `FIREBASE_STORAGE_BUCKET` | Bucket name, without `gs://`. |
| `FIRESTORE_COLLECTION_PREFIX` | Optional; defaults to `planpilot_`. |
| `STORE_CREDENTIAL_KEY` | **Secret.** Base64-encoded 32-byte AES key used to encrypt saved merchant credentials. Keep it stable across deploys. |
| `OPENAI_API_KEY` | **Secret.** Server-side key for pricing generation and research. Legacy `OPENAPI_KEY` is also recognised. |
| `OPENAI_MODEL` | Optional pricing model; defaults to `gpt-4.1-mini`. |
| `OPENAI_RESEARCH_MODEL` | Optional research model; defaults to `gpt-5-mini`. |
| `PAYPAL_CLIENT_ID` | PlanPilot’s server-side **sandbox** app Client ID for the shared demo. |
| `PAYPAL_CLIENT_SECRET` | **Secret.** Secret for the same sandbox app. |
| `PAYPAL_OWNER_EMAIL` | Verified Firebase email allowed to manage the configured workspace merchant outside demo mode. |
| `NEXT_TELEMETRY_DISABLED` | Set to `1` to disable Next.js telemetry. |

Generate the encryption key locally, then save the output directly into Render’s secret environment setting:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Do not rotate this key without migrating/reconnecting existing encrypted credentials. None of the secret variables should have a `NEXT_PUBLIC_` prefix. The intentionally public Firebase web configuration is served by `/api/auth/config`.

## Connect GitHub to Render

1. Push this repository, including its existing Git history, to your GitHub repository.
2. In Render, create a **Blueprint** from that GitHub repository and select `main` and `render.yaml`.
3. Review the planned web service and supply the variables marked `sync: false` through Render’s environment/secret interface.
4. Approve the first deployment. Render then builds and deploys on later pushes to the linked branch automatically.
5. Add the resulting Render hostname to Firebase Authentication’s Authorized domains. Set `PUBLIC_SITE_URL` only if a custom canonical origin is needed.
6. Verify `/api/health`, sign-in, a saved conversation, publishing and a PayPal sandbox checkout.

The Blueprint uses a free Node web service and external Firebase persistence. Render’s free-service spin-down/build limits still apply. No database or user upload depends on Render’s ephemeral local filesystem.

A manual Render deploy hook or a GitHub Actions deployment secret is not required: Render’s Git integration handles deployment. Render only deploys code that has actually been pushed to the linked repository and branch; publishing a Sites version alone does not push to GitHub.

## PayPal setup and checkout

For a merchant’s own connection:

1. Sign into PlanPilot and open **PayPal integration**.
2. Choose **Connect a PayPal sandbox app** and give the connection a friendly name.
3. Copy **Client ID** and **Secret** from **PayPal Developer → Apps & Credentials → Sandbox → your app**. A sandbox account email/password is not an app credential.
4. PlanPilot verifies the credentials, encrypts them with `STORE_CREDENTIAL_KEY` and registers its own payment webhook.

For a no-login demo, turn on **Sandbox demo**. It uses PlanPilot’s configured sandbox merchant; credentials are never exposed to visitors.

In **Share pricing → Publish pricing**, choose whether to include PayPal checkout. Subscription offers require matching active PayPal billing plans and explicit approval before those test plans are created. One-time offers use Orders v2 and do not create subscription plans. Choosing pricing only does not enable payments merely because PayPal is connected.

No custom webhook or redirect is required for the hosted test flow. PlanPilot supplies return/cancel URLs and verifies payment state server-side. Optional forwarding sends signed events to the merchant’s application; that application remains responsible for fulfilment and account access. Redirect query parameters are never proof of payment.

Published subscription pages can be upgraded to checkout on the same URL when the draft still matches the published offers. Cancellation returns to the hosted pricing page or cards view according to where checkout began, while preserving explicit custom cancellation URLs.

## Existing data and migration

A fresh Firebase deployment starts with empty collections. Existing D1/R2 data is not deleted or copied by deploying this repository.

Before switching a production hostname:

1. Back up D1 records and R2 objects using authorised exports.
2. Import records into the prefixed Firestore collections with their existing UUIDs; rebuild uniqueness records through the document repository layer. Copy file objects to the Firebase Storage bucket using their existing keys.
3. Keep the same credential-encryption key if encrypted PayPal connection records are migrated.
4. Update any absolute public file URLs to the new canonical origin where needed.
5. Reconnect/verify merchant apps on the new host so the appropriate PlanPilot webhook endpoints are registered there. Existing PayPal approval links retain the return URLs set when they were created; test a newly created checkout on the new deployment.
6. Validate owner isolation, receipts, saved conversations and webhook processing before directing traffic to the new deployment.

This repository does not silently migrate live payment data or reuse a service account from another environment.

## Checks

```bash
pnpm run test:core
pnpm exec tsc --noEmit
pnpm run build:render
```

The tests cover guest-session isolation, merchant access, saved connections, reversible archive behaviour, publication upgrades, PayPal plan matching and cancellation destinations. `DOCUMENT_DATABASE_TEST=1` runs the same repository tests through the document-operation layer, using a transactional local test driver. It is not a substitute for a real Firestore/PayPal staging test with your configured environment.

## History and attribution

The project retains its existing Git history, including development that began on **October 7, 2026**. New commits use the requested author name **Abisola with help from Codex**. Original historical authors, timestamps and commits are preserved; no commits are backdated or fabricated. Publishing files through GitHub’s single-file UI or squashing everything into one initial commit would lose that visible history—use a normal Git push.
