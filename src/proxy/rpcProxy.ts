import type { JsonRpcRequest, JsonRpcResponse } from "../types/index.js";

export class RpcProxy {
  private upstreamUrl: string;
  private timeout: number;

  constructor(upstreamUrl: string, timeout = 30000) {
    this.upstreamUrl = upstreamUrl;
    this.timeout = timeout;
  }

  async forward(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.upstreamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        return {
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32603,
            message: `Upstream RPC error: ${response.status} ${response.statusText}`,
          },
        };
      }

      const data = (await response.json()) as JsonRpcResponse;
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown upstream error";
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: { code: -32603, message: `RPC proxy error: ${message}` },
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
