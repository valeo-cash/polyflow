export interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: unknown[] | Record<string, unknown>;
  id: number | string;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number | string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface PricingTier {
  price: string;
  methods: string[];
}

export interface PricingConfig {
  defaultPrice: string;
  tiers: Record<string, PricingTier>;
}

export interface RpcReceipt {
  id: string;
  timestamp: string;
  method: string;
  price: string;
  network: string;
  payTo: string;
  agentId?: string;
  receiptHash: string;
}

export interface AppConfig {
  port: number;
  walletAddress: string;
  polygonRpcUrl: string;
  settlementNetwork: string;
  facilitatorUrl: string;
  logLevel: string;
  allowedMethods: string[];
  blockedMethods: string[];
  pricing: PricingConfig;
}
