# Polyflow

Machine-payable Polygon RPC using the x402 payment protocol.

**No API keys. No accounts. No rate limits. Just HTTP.**

AI agents pay per JSON-RPC request in USDC via HTTP 402. Settlement on Base (default) or Polygon.

## Quick Start

```bash
git clone https://github.com/valeo-cash/polyflow.git
cd polyflow
npm install
cp .env.example .env
# Edit .env with your WALLET_ADDRESS and POLYGON_RPC_URL
npm run dev
```

## How It Works

1. Agent sends JSON-RPC request to `/rpc`
2. Server responds `402 Payment Required` with USDC price
3. Agent signs payment via x402 protocol
4. Server verifies payment through facilitator
5. Request is proxied to Polygon RPC node
6. Response returned with receipt hash

## Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /rpc` | x402 payment | JSON-RPC proxy (paid) |
| `GET /health` | None | Health check |
| `GET /pricing` | None | View pricing tiers |
| `GET /methods` | None | View supported methods |

## Client Example

```typescript
import { wrapFetchWithPayment } from "x402-fetch";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const wallet = createWalletClient({
  account: privateKeyToAccount("0xYOUR_PRIVATE_KEY"),
  chain: base,
  transport: http(),
});

const paidFetch = wrapFetchWithPayment(wallet);

const response = await paidFetch("https://polygon-rpc.example.com/rpc", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_blockNumber",
    params: [],
    id: 1,
  }),
});

const data = await response.json();
// { jsonrpc: "2.0", id: 1, result: "0x134a3b7" }
```

## Configuration

See `.env.example` for all options. Key settings:

- `WALLET_ADDRESS` — Your USDC receiving address
- `POLYGON_RPC_URL` — Upstream Polygon RPC (Alchemy, Infura, etc.)
- `SETTLEMENT_NETWORK` — `eip155:8453` (Base) or `eip155:137` (Polygon)

## Pricing

Configurable in `config/pricing.json`. Default tiers:

- **Tier 1** ($0.0001): eth_blockNumber, eth_chainId, net_version
- **Tier 2** ($0.001): eth_getBalance, eth_getTransactionCount, eth_call
- **Tier 3** ($0.005): eth_getLogs, eth_estimateGas, debug_traceTransaction

## Receipts

Every paid request generates a Sentinel-compatible receipt with SHA-256 hash, returned in the `X-Receipt-Hash` response header. Receipts are stored in `data/receipts/receipts.jsonl`.

## Docker

```bash
docker build -t polyflow .
docker run -p 3000:3000 --env-file .env polyflow
```

## License

MIT

## Built with

- [x402](https://x402.org) — Open payment protocol by Coinbase
- [Valeo Protocol](https://valeocash.com) — Payment infrastructure for AI agents
