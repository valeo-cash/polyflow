import { wrapFetchWithPayment } from "x402-fetch";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

// -------------------------------------------------------------------
// Test client for polygon-x402
// Requires: npm install x402-fetch viem
// Usage:    PRIVATE_KEY=0x... SERVER_URL=http://localhost:3000 tsx scripts/test-client.ts
// -------------------------------------------------------------------

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

if (!PRIVATE_KEY) {
  console.error("Error: PRIVATE_KEY environment variable is required");
  process.exit(1);
}

const account = privateKeyToAccount(PRIVATE_KEY);
const wallet = createWalletClient({ account, chain: base, transport: http() });
const paidFetch = wrapFetchWithPayment(wallet);

async function testRpc(method: string, params: unknown[] = []) {
  console.log(`\n--- Testing ${method} ---`);

  try {
    const response = await paidFetch(`${SERVER_URL}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": "test-agent" },
      body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
    });

    const receiptHash = response.headers.get("X-Receipt-Hash");
    const receiptId = response.headers.get("X-Receipt-Id");
    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Receipt:", receiptId, receiptHash?.slice(0, 16) + "...");
    console.log("Result:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

async function main() {
  console.log("=== Free endpoints ===");

  const health = await fetch(`${SERVER_URL}/health`);
  console.log("Health:", await health.json());

  const pricing = await fetch(`${SERVER_URL}/pricing`);
  console.log("Pricing:", JSON.stringify(await pricing.json(), null, 2));

  console.log("\n=== Paid RPC calls ===");
  await testRpc("eth_blockNumber");
  await testRpc("eth_chainId");
  await testRpc("eth_getBalance", ["0x0000000000000000000000000000000000000000", "latest"]);
}

main().catch(console.error);
