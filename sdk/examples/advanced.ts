import { Polyflow, RpcError, ConnectionError } from "../src/index.js";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const SERVER_URL = process.env.POLYFLOW_URL || "http://localhost:3000";

const wallet = createWalletClient({
  account: privateKeyToAccount(PRIVATE_KEY),
  chain: base,
  transport: http(),
});

const poly = new Polyflow(SERVER_URL, wallet, {
  agentId: "advanced-agent",
  timeout: 15000,
});

async function main() {
  // Raw JSON-RPC request for methods not covered by convenience methods
  const feeHistory = await poly.request("eth_feeHistory", ["0x5", "latest", [25, 75]]);
  console.log("Fee history:", feeHistory);

  // Error handling
  try {
    await poly.request("eth_sendRawTransaction", ["0x..."]);
  } catch (error) {
    if (error instanceof RpcError) {
      console.log("RPC error (expected — method is blocked):", error.message);
    }
  }

  // Get logs with filter
  const logs = await poly.getLogs({
    fromBlock: "0x0",
    toBlock: "latest",
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    topics: [],
  });
  console.log("Logs found:", logs.length);

  // Smart contract read via eth_call
  const result = await poly.call({
    to: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    data: "0x06fdde03",
  });
  console.log("Contract call result:", result);
}

main().catch(console.error);
