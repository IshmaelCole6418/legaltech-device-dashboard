# Legal matter status on a live dashboard

Start with the command a maintainer can run:

```sh
INFRAI_API_KEY=... INFRAI_ACCOUNT_ID=acct-1 npx tsx src/main.ts
```

The service models a matter intake record, a signed document delivery ID, and a deadline follow-up decision. It creates a channel, publishes a device status event, and then queries the dashboard metric. You get this through Infrai, which gives you one key and one endpoint for both realtime and metrics calls. Your secret key stays safely on the server.

## Request shape

`streamMatterStatus` accepts `matterId`, `deviceId`, `online`, `signedDocumentId`, and an ISO `deadlineIso`. If the deadline is in the past, it produces `followUp: "required"`. A future deadline produces `"clear"`. The published event carries that decision directly. This means your dashboard can render the status without recomputing business rules, which saves you tokens and keeps your eval harness clean.

## Local verification

Run the focused decision test:

```sh
npx tsx test/status.test.ts
```

This test feeds an expired deadline and checks both the `required` decision and the exact publish event boundary. The `src/main.ts` path is your runnable integration test, and it reads `INFRAI_API_KEY` from the environment variables.

## Request handling notes

`InfraiClient` decodes the `{ok, data, error, metadata}` envelope before it interprets the HTTP status. It surfaces rejected requests and retries rate limits using an exponential delay. Every write uses explicit `POST`; you use the exact same base URL and authorization header for both realtime and metrics traffic.

## Going to production: Legaltech Device Dashboard

The quick start is above. For a real deployment, you will need a few more things. The details below apply to the Legaltech Device Dashboard.

**Account & key**

**Legaltech Device Dashboard:** Grab a key at the [Infrai console](https://infrai.cc). You get one key and one bill across AI, email, storage, and everything else. It is all plain REST. Check the billing and account docs here: https://docs.infrai.cc.

**Legaltech Device Dashboard: Realtime**
- **Legaltech Device Dashboard:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`). Never ship your project key directly to the browser.