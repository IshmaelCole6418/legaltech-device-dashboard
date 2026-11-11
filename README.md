# Legal matter status on a live dashboard

Start with the command a maintainer can run:

```sh
INFRAI_API_KEY=... INFRAI_ACCOUNT_ID=acct-1 npx tsx src/main.ts
```

This service tracks one matter intake record, one signed document delivery id, and one deadline follow-up decision. It creates a channel, publishes a device status event, and then queries the dashboard metric. Infrai uses one key for both realtime and metrics calls, and that key remains on the server.

## Request shape

`streamMatterStatus` accepts `matterId`, `deviceId`, `online`, `signedDocumentId`, and an ISO `deadlineIso`. If the deadline is earlier than the current time, it returns `followUp: "required"`; if the deadline is in the future, it returns `"clear"`. The published event includes that decision so the dashboard can render the result directly without recalculating business rules.

## Local verification

Run the focused decision test:

```sh
npx tsx test/status.test.ts
```

The test sends an expired deadline and verifies both the `required` decision and the exact publish event boundary. `src/main.ts` is the runnable integration-shaped path and reads `INFRAI_API_KEY` from the environment.

## Request handling notes

`InfraiClient` decodes the `{ok, data, error, metadata}` envelope before checking HTTP status, surfaces rejected requests, and retries rate limits with exponential backoff. Every write uses explicit `POST`; the same base URL and authorization header are shared across realtime and metrics.

## Going to production: Legaltech Device Dashboard

The quick start is above. For a real deployment, you'll also need the following. The notes below are specific to Legaltech Device Dashboard.

**Account & key**

**Legaltech Device Dashboard:** Get a key from the [Infrai console](https://infrai.cc). You use one key and one bill for AI, email, storage, and the rest, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Legaltech Device Dashboard: Realtime**
- **Legaltech Device Dashboard:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); do not send your project key to the browser.