import assert from "node:assert/strict";
import { streamMatterStatus } from "../src/device_status_service";

const calls: Array<{ path: string; body?: any }> = [];
const client = {
  createChannel: async (body: any) => { calls.push({ path: "/realtime/channel/create", body }); return {}; },
  publish: async (body: any) => { calls.push({ path: "/realtime/publish", body }); return {}; },
  queryMetrics: async (query: { name: string; agg: string }) => { calls.push({ path: "/metrics/query", body: query }); return {}; },
} as any;
const result = await streamMatterStatus(client, { matterId: "M-1", deviceId: "d-1", online: true, deadlineIso: "2000-01-01T00:00:00.000Z" }, "acct-1");
assert.equal(result.followUp, "required");
assert.deepEqual(calls[0].body, { channel: "matter-M-1", vendor: "legaltech" });
assert.equal(calls[1].body.event, "device.status");
assert.deepEqual(calls[2].body, { name: "device.status", agg: "count" });
console.log("status decision test passed");
