# PlanPilot

AI-assisted pricing for apps, with real PayPal sandbox billing-plan creation.

## What works

Describe an app in the chat. OpenAI analyses its features, audience and usage to propose three editable flat-rate tiers. Follow-up messages can refine the tiers or explain the pricing. Structured responses are validated on the server. Cost assumptions remain visible, and contribution margins recalculate as prices and allowances change. AI does not call PayPal or approve plans.

After explicit user approval, the PayPal integration creates a sandbox product and three active monthly or annual plans. Test subscription opens PayPal-hosted sandbox checkout; a sandbox personal account must approve the subscription. Check subscription status reads its actual status from PayPal. No live payments are supported.

## Configuration and access

The hosted Site must remain private. Its access policy protects the shared API key and sandbox merchant. Public use requires per-user authorization and a separate merchant-onboarding architecture. The current version uses the owner's configured sandbox app, not multi-merchant OAuth.

Configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET as server-side secrets from a sandbox app. Configure OPENAI_API_KEY as a secret; OPENAPI_KEY is accepted as an alias for the current hosted configuration. OPENAI_MODEL optionally overrides the default gpt-4.1-mini. Never place credentials in browser code or commit actual keys. Hosted secrets are configured in Sites; .env.example lists local configuration names.

Use the package manager pinned in package.json to install dependencies. Run pnpm dev for development or pnpm build for a production build. POST origins are pinned to the current deployed Site. For an independent local deployment, update the route origin constants to your explicitly chosen origin and configure equivalent access protection. Browser drafts and checkout links are held in memory and reset on refresh. Sandbox products and plans persist in PayPal.

## Verification

Run node node_modules/typescript/bin/tsc --noEmit for type validation. Run node scripts/test-paypal.mjs and node scripts/test-pricing.mjs for mocked provider tests, including input validation, sandbox host restrictions, annual prices, stable retry IDs, partial successes, structured-output validation and provider errors. These tests are distinct from actual hosted API verification.

To test the end-to-end experience: describe an app, review the suggested tiers, edit costs, verify the sandbox connection, approve creation, and use Test subscription with a sandbox personal account. The AI response explains its assumptions. Prices are proposals, not guarantees of customer willingness to pay.

Prices use CAD. Annual plans charge 12 times the monthly price with a 20% discount. Monthly usage allowances and app features are enforced by the application, not PayPal. Costs assume full usage allowance consumption, a base per-account cost and CAD $0.50 per user per month, plus editable illustrative payment fees. Contribution excludes taxes, marketing, support labour and other overhead. Recalculating prices preserves user and usage allowances. Annual discounts can reduce margins below the target.

Unchanged creation retries reuse request IDs within PayPal's idempotency window. Partial successes are shown. Inspect the sandbox dashboard after an ambiguous timeout. Draft edits never update or delete previously created PayPal plans. Keys, provider tokens and raw provider error bodies are not returned to the browser. OpenAI requests use store:false; the description and recent chat context are sent to OpenAI for processing.

## Hackathon deliverables still outstanding

A public open-source repository with an agreed licence and a publicly available demo video under three minutes are still required. The private hosted Site is not by itself a completed submission.

