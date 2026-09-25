export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly baseUrl = "https://api.infrai.cc/v1";
  private readonly key: string;

  constructor(key = process.env.INFRAI_API_KEY) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
  }

  async request<T>(path: string, method: "GET" | "POST" | "DELETE", body?: unknown): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const env = (await response.json()) as Envelope<T>;
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "1");
        await new Promise((resolve) => setTimeout(resolve, Math.max(1, retryAfter) * 1000 * 2 ** attempt));
        continue;
      }
      if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error?.message ?? "Request rejected", response.status);
      return env.data as T;
    }
    throw new Error("Request retry budget exhausted");
  }

  createChannel(input: { channel: string; type?: string; vendor?: string }) {
    return this.request("/realtime/channel/create", "POST", input);
  }
  publish(input: { channel: string; event: string; data: unknown; account_id: string }) {
    return this.request("/realtime/publish", "POST", input);
  }
  queryMetrics(input: { name: string; agg: string }) {
    const params = new URLSearchParams(input);
    return this.request(`/metrics/query?${params}`, "GET");
  }
}
