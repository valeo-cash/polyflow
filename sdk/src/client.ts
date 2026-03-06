import { wrapFetchWithPayment } from "x402-fetch";
import type { Signer } from "x402-fetch";
import type {
  PolyflowConfig,
  JsonRpcRequest,
  JsonRpcResponse,
  HexString,
  BlockIdentifier,
  CallParams,
  LogFilter,
  LogEntry,
  TransactionReceipt,
  Block,
  Transaction,
  PolyflowPricing,
  PolyflowMethods,
  PolyflowHealth,
  RequestMetadata,
} from "./types.js";
import { RpcError, ConnectionError, PaymentError } from "./errors.js";

export class Polyflow {
  private serverUrl: string;
  private paidFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  private agentId?: string;
  private timeout: number;
  private requestId: number = 0;
  public lastRequestMeta?: RequestMetadata;

  constructor(serverUrl: string, wallet: Signer, config?: Partial<PolyflowConfig>) {
    this.serverUrl = serverUrl.replace(/\/+$/, "");
    this.paidFetch = wrapFetchWithPayment(fetch, wallet);
    this.agentId = config?.agentId;
    this.timeout = config?.timeout ?? 30000;
  }

  // ─── Core JSON-RPC transport ───

  async request<T = unknown>(method: string, params: unknown[] = []): Promise<T> {
    const id = ++this.requestId;
    const body: JsonRpcRequest = { jsonrpc: "2.0", method, params, id };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.agentId) headers["X-Agent-Id"] = this.agentId;

    try {
      const response = await this.paidFetch(`${this.serverUrl}/rpc`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      this.lastRequestMeta = {
        receiptHash: response.headers.get("X-Receipt-Hash") ?? undefined,
        receiptId: response.headers.get("X-Receipt-Id") ?? undefined,
      };

      if (!response.ok && response.status !== 200) {
        throw new PaymentError(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as JsonRpcResponse<T>;

      if (data.error) {
        throw new RpcError(data.error.code, data.error.message, data.error.data);
      }

      return data.result as T;
    } catch (error) {
      if (error instanceof RpcError || error instanceof PaymentError) throw error;
      const msg = error instanceof Error ? error.message : "Unknown error";
      throw new ConnectionError(this.serverUrl, new Error(msg));
    } finally {
      clearTimeout(timer);
    }
  }

  // ─── Typed convenience methods ───

  async getBlockNumber(): Promise<bigint> {
    const hex = await this.request<HexString>("eth_blockNumber");
    return BigInt(hex);
  }

  async getChainId(): Promise<number> {
    const hex = await this.request<HexString>("eth_chainId");
    return Number(hex);
  }

  async getGasPrice(): Promise<bigint> {
    const hex = await this.request<HexString>("eth_gasPrice");
    return BigInt(hex);
  }

  async getBalance(address: HexString, block: BlockIdentifier = "latest"): Promise<bigint> {
    const hex = await this.request<HexString>("eth_getBalance", [address, block]);
    return BigInt(hex);
  }

  async getTransactionCount(address: HexString, block: BlockIdentifier = "latest"): Promise<number> {
    const hex = await this.request<HexString>("eth_getTransactionCount", [address, block]);
    return Number(hex);
  }

  async getCode(address: HexString, block: BlockIdentifier = "latest"): Promise<HexString> {
    return this.request<HexString>("eth_getCode", [address, block]);
  }

  async getStorageAt(address: HexString, slot: HexString, block: BlockIdentifier = "latest"): Promise<HexString> {
    return this.request<HexString>("eth_getStorageAt", [address, slot, block]);
  }

  async call(params: CallParams, block: BlockIdentifier = "latest"): Promise<HexString> {
    return this.request<HexString>("eth_call", [params, block]);
  }

  async estimateGas(params: CallParams): Promise<bigint> {
    const hex = await this.request<HexString>("eth_estimateGas", [params]);
    return BigInt(hex);
  }

  async getBlockByNumber(block: BlockIdentifier = "latest", fullTransactions = false): Promise<Block> {
    return this.request<Block>("eth_getBlockByNumber", [block, fullTransactions]);
  }

  async getBlockByHash(hash: HexString, fullTransactions = false): Promise<Block> {
    return this.request<Block>("eth_getBlockByHash", [hash, fullTransactions]);
  }

  async getTransactionByHash(hash: HexString): Promise<Transaction> {
    return this.request<Transaction>("eth_getTransactionByHash", [hash]);
  }

  async getTransactionReceipt(hash: HexString): Promise<TransactionReceipt> {
    return this.request<TransactionReceipt>("eth_getTransactionReceipt", [hash]);
  }

  async getLogs(filter: LogFilter): Promise<LogEntry[]> {
    return this.request<LogEntry[]>("eth_getLogs", [filter]);
  }

  // ─── Free endpoints (no payment required) ───

  async getHealth(): Promise<PolyflowHealth> {
    const response = await fetch(`${this.serverUrl}/health`);
    return response.json() as Promise<PolyflowHealth>;
  }

  async getPricing(): Promise<PolyflowPricing> {
    const response = await fetch(`${this.serverUrl}/pricing`);
    return response.json() as Promise<PolyflowPricing>;
  }

  async getMethods(): Promise<PolyflowMethods> {
    const response = await fetch(`${this.serverUrl}/methods`);
    return response.json() as Promise<PolyflowMethods>;
  }
}
