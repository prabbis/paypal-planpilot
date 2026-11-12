# PlanPilot

**Turn an idea into clear pricing—and a page customers can pay through.**

Founders and service providers often struggle to decide what to charge, what each offer includes and how to start accepting payments. PlanPilot brings those steps into one workspace: describe your offer, refine an AI pricing draft, then publish with optional PayPal sandbox checkout.

Built for the [PayPal AI Hackathon](https://paypalaihackathon.devpost.com/) by **Abisola, with help from Codex**.

[Try the hosted demo](https://planpilot-prabbis-demo.abisolaadeniran.chatgpt.site) · [Run locally](#run-locally) · [Deploy to Render](#deploy-to-render) · [Configuration guide](docs/setup.md)

## Try it

1. Open the demo and choose **Try the demo — no sign-in**.
2. Describe an app, service or programme. Answer any clarifying questions.
3. Review the suggested offers. Edit prices, inclusions and usage limits in **Edit table**, or ask the assistant for changes.
4. Open **Share pricing → Publish pricing**. Choose a pricing page alone or include **PayPal checkout**.
5. For checkout, follow the connection and plan-approval steps, open the published page and pay with a **PayPal sandbox personal account**.

You receive a hosted pricing-page link and a cards-only iframe embed. Guest workspaces expire after 24 hours; sign in to keep your work. **All payments are sandbox tests; no live money is charged.**

## How PayPal and AI work together

| Tool | Role in PlanPilot |
| --- | --- |
| OpenAI | Asks clarifying questions, proposes an appropriate payment structure and estimates prices, delivery costs and usage guardrails. Estimates and margin assumptions remain editable. |
| PayPal | Creates sandbox subscription plans for recurring offers, handles one-time checkout through Orders v2, and supplies payment status verified by the server and webhooks. |
| AG Grid Community | Powers the editable pricing table so users can refine AI suggestions directly. No AG Grid licence key is required. |
| Firebase | Provides sign-in and, on the Render deployment, Firestore persistence for conversations, pricing and payment records. |
| Render | Hosts the Node application and automatically deploys updates pushed to GitHub. |

AI suggests the pricing; the merchant reviews it and approves payment setup. Customers can check out without a PlanPilot account. PlanPilot handles hosted return/cancel URLs and payment notifications.

## Run locally

**You need:** Node.js 24, Corepack/pnpm, a Firebase project, an OpenAI API key and PayPal sandbox app credentials for payment testing.

```bash
git clone https://github.com/prabbis/paypal-planpilot.git
cd paypal-planpilot
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Fill in `.env.local` using the [configuration guide](docs/setup.md#environment-variables). It explains Firebase setup, service-account JSON, PayPal credentials and the encryption key. Secrets stay in environment variables.

```bash
pnpm run dev:render
```

Open **http://localhost:3000**. You can explore the interface and sample pricing there. For complete sign-in, saved guest sessions and PayPal testing, use an HTTPS deployment: the application uses secure cookies, and PayPal webhooks need a public HTTPS address.

To check a production build locally:

```bash
pnpm run build:render
pnpm exec next start -H 0.0.0.0 -p 3000
```

## Deploy to Render

Render runs PlanPilot’s Next.js application as a Node web service. It serves the pricing workspace, public pricing pages, embeds and server API routes—including PayPal checkout returns and webhooks. Firebase Authentication and Firestore remain the identity and data services.

The repository includes `render.yaml`, which defines the build command, server start command, environment-variable prompts, `/api/health` check and automatic deployment from GitHub. You do not need to enter build and start commands manually.

1. Fork this repository, or push the source to your own GitHub repository.
2. In [Render](https://dashboard.render.com/), select **New → Blueprint**, connect GitHub and choose your repository's **main** branch. Use `render.yaml`.
3. Review the web service and enter the environment values requested by the Blueprint. Use the same keys as `.env.local`; the Blueprint already supplies `DATA_BACKEND=firebase`.
4. Approve the deployment. If any secrets are added afterward, save them under the service's **Environment** page and redeploy.
5. Add your new `onrender.com` hostname under **Firebase Authentication → Settings → Authorized domains**.
6. Open your Render URL and test sign-in, a saved conversation, publishing and sandbox checkout. `/api/health` checks that the server is running.

**Future updates:** commit and push to GitHub's `main` branch. Render automatically builds and deploys the new version.

Render uses Firebase Authentication and Firestore. **Firebase Storage is not required.** A new Firebase deployment starts empty; it does not import the hosted demo's existing data. See the [configuration guide](docs/setup.md) for provider setup details.

## Checks

```bash
pnpm run test:core
pnpm exec tsc --noEmit
pnpm run build:render
```

Tests cover pricing rules, guest and owner isolation, saved connections, publishing, PayPal plan matching and cancellation redirects. A full payment test still requires configured Firebase and PayPal sandbox accounts.

## Current scope

PayPal integration is **sandbox-only**. Live merchant onboarding and automatic fulfilment/access in a customer's application are not implemented. Service prices and delivery costs are estimates for merchant review.

## Licence

[MIT](LICENSE) · Copyright © 2026 Abisola. Third-party components retain their respective licences.
