import type { WalletClient } from "viem";

export type HexString = `0x${string}`;
export type BlockTag = "latest" | "earliest" | "pending" | "safe" | "finalized";
export type BlockIdentifier = HexString | BlockTag;

export interface PolyflowConfig {
  /** Polyflow server URL (e.g. "https://your-server.com") */
  serverUrl: string;
  /** Optional custom agent ID sent in X-Agent-Id header */
  agentId?: string;
  /** Optional request timeout in ms (default: 30000) */
  timeout?: number;
}

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params: unknown[];
  id: number;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface CallParams {
  from?: HexString;
  to: HexString;
  gas?: HexString;
  gasPrice?: HexString;
  value?: HexString;
  data?: HexString;
}

export interface LogFilter {
  address?: HexString | HexString[];
  fromBlock?: BlockIdentifier;
  toBlock?: BlockIdentifier;
  topics?: (HexString | HexString[] | null)[];
  blockHash?: HexString;
}

export interface LogEntry {
  address: HexString;
  topics: HexString[];
  data: HexString;
  blockNumber: HexString;
  transactionHash: HexString;
  transactionIndex: HexString;
  blockHash: HexString;
  logIndex: HexString;
  removed: boolean;
}

export interface TransactionReceipt {
  transactionHash: HexString;
  transactionIndex: HexString;
  blockHash: HexString;
  blockNumber: HexString;
  from: HexString;
  to: HexString | null;
  cumulativeGasUsed: HexString;
  gasUsed: HexString;
  contractAddress: HexString | null;
  logs: LogEntry[];
  status: HexString;
  effectiveGasPrice: HexString;
}

export interface Block {
  number: HexString;
  hash: HexString;
  parentHash: HexString;
  timestamp: HexString;
  gasLimit: HexString;
  gasUsed: HexString;
  miner: HexString;
  transactions: HexString[] | Transaction[];
}

export interface Transaction {
  hash: HexString;
  nonce: HexString;
  blockHash: HexString | null;
  blockNumber: HexString | null;
  transactionIndex: HexString | null;
  from: HexString;
  to: HexString | null;
  value: HexString;
  gas: HexString;
  gasPrice: HexString;
  input: HexString;
}

export interface PolyflowPricing {
  description: string;
  network: string;
  payTo: string;
  pricing: {
    defaultPrice: string;
    tiers: Record<string, { price: string; methods: string[] }>;
  };
}

export interface PolyflowMethods {
  methods: Record<string, string>;
  blocked: string[];
}

export interface PolyflowHealth {
  status: string;
  timestamp: number;
}

export interface RequestMetadata {
  receiptHash?: string;
  receiptId?: string;
}
