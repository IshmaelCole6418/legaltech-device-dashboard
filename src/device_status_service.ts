import { InfraiClient } from "./infrai_client";
import { z } from "zod";

export type StatusInput = { matterId: string; deviceId: string; online: boolean; signedDocumentId?: string; deadlineIso?: string };
export type StatusResult = { channel: string; followUp: "required" | "clear"; published: boolean };
const statusSchema = z.object({ matterId: z.string().min(1), deviceId: z.string().min(1), online: z.boolean(), signedDocumentId: z.string().optional(), deadlineIso: z.string().datetime().optional() });

export async function streamMatterStatus(client: InfraiClient, input: StatusInput, accountId: string): Promise<StatusResult> {
  input = statusSchema.parse(input);
  const channel = `matter-${input.matterId}`;
  await client.createChannel({ channel, vendor: "legaltech" });
  const followUp = input.deadlineIso && new Date(input.deadlineIso).getTime() < Date.now() ? "required" : "clear";
  await client.publish({
    channel,
    event: "device.status",
    data: { matterId: input.matterId, deviceId: input.deviceId, online: input.online, signedDocumentId: input.signedDocumentId, followUp },
    account_id: accountId,
  });
  await client.queryMetrics({ name: "device.status", agg: "count" });
  return { channel, followUp, published: true };
}
