import dotenv from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { AppConfig, PricingConfig } from "../types/index.js";

dotenv.config();

function loadPricing(): PricingConfig {
  const raw = readFileSync(resolve(process.cwd(), "config/pricing.json"), "utf-8");
  return JSON.parse(raw) as PricingConfig;
}

function parseList(value: string | undefined): string[] {
  if (!value || value.trim() === "") return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export function loadConfig(): AppConfig {
  const walletAddress = process.env.WALLET_ADDRESS;
  const polygonRpcUrl = process.env.POLYGON_RPC_URL;

  if (!walletAddress) throw new Error("WALLET_ADDRESS is required");
  if (!polygonRpcUrl) throw new Error("POLYGON_RPC_URL is required");

  return {
    port: parseInt(process.env.PORT || "3000", 10),
    walletAddress,
    polygonRpcUrl,
    settlementNetwork: process.env.SETTLEMENT_NETWORK || "eip155:8453",
    facilitatorUrl: process.env.FACILITATOR_URL || "https://x402.org/facilitator",
    logLevel: process.env.LOG_LEVEL || "info",
    allowedMethods: parseList(process.env.ALLOWED_METHODS),
    blockedMethods: parseList(process.env.BLOCKED_METHODS || "eth_sendRawTransaction"),
    pricing: loadPricing(),
  };
}
