import { Polyflow } from "../src/index.js";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const SERVER_URL = process.env.POLYFLOW_URL || "http://localhost:3000";

if (!PRIVATE_KEY) {
  console.error("Set PRIVATE_KEY environment variable");
  process.exit(1);
}

const wallet = createWalletClient({
  account: privateKeyToAccount(PRIVATE_KEY),
  chain: base,
  transport: http(),
});

const poly = new Polyflow(SERVER_URL, wallet, { agentId: "example-agent" });

async function main() {
  // Free endpoints
  const health = await poly.getHealth();
  console.log("Server health:", health);

  const pricing = await poly.getPricing();
  console.log("Pricing:", pricing);

  // Paid RPC calls
  const blockNumber = await poly.getBlockNumber();
  console.log("Block number:", blockNumber);
  console.log("Receipt:", poly.lastRequestMeta);

  const chainId = await poly.getChainId();
  console.log("Chain ID:", chainId);

  const gasPrice = await poly.getGasPrice();
  console.log("Gas price:", gasPrice);

  const balance = await poly.getBalance("0x0000000000000000000000000000000000000000");
  console.log("Zero address balance:", balance);
}

main().catch(console.error);
