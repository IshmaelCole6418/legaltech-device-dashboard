import { InfraiClient } from "./infrai_client";
import { streamMatterStatus } from "./device_status_service";

const input = { matterId: "M-104", deviceId: "signer-7", online: true, signedDocumentId: "doc-88", deadlineIso: "2099-01-01T00:00:00.000Z" };
streamMatterStatus(new InfraiClient(), input, process.env.INFRAI_ACCOUNT_ID ?? "demo-account")
  .then((result) => console.log(JSON.stringify(result)))
  .catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
