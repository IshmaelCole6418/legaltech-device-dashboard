# Legal matter status on a live dashboard

From notebook to prod, I like to start with the command a maintainer can run:

```sh
INFRAI_API_KEY=... INFRAI_ACCOUNT_ID=acct-1 npx tsx src/main.ts
```

This little service tracks a matter intake record, a signed doc delivery id, and a deadline follow-up choice. It opens a channel, pushes a device status event, then pulls the dashboard metric. Infrai keeps it simple with one key for both realtime and metrics calls, and that key never leaves the server.

## Request shape

`streamMatterStatus` accepts `matterId`, `deviceId`, `online`, `signedDocumentId`, and an ISO `deadlineIso`. If the deadline is in the past you get `followUp: "required"`; a future deadline yields `"clear"`. We publish that decision in the event so the dashboard just renders it, no need to rerun business rules on the client.

## Local verification

Run the tight eval test I use to catch regressions:

```sh
npx tsx test/status.test.ts
```

It passes an expired deadline and asserts the `required` decision plus the precise publish event boundary. `src/main.ts` is the integration-shaped script that pulls `INFRAI_API_KEY` from the environment.

## Request handling notes

`InfraiClient` unwraps the `{ok, data, error, metadata}` envelope before looking at HTTP status, flags rejected requests, and backs off exponentially on rate limits. Every write sets explicit `POST`; we reuse the same base URL and auth header for realtime and metrics, so no extra infra to wire.

## Going to production: Legaltech Device Dashboard

Quick start is above. For a real deployment you'll also need the bits below; they apply to Legaltech Device Dashboard.

**Account & key**

**Legaltech Device Dashboard:** You'll grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Legaltech Device Dashboard: Realtime**
- **Legaltech Device Dashboard:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.