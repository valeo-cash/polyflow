# polyflow-sdk

TypeScript SDK for [Polyflow](https://github.com/valeo-cash/polyflow) — machine-payable Polygon RPC for AI agents.

One line to query Polygon. Payment handled automatically via x402.

## Install

```bash
npm install polyflow-sdk viem
```

## Quick Start

```typescript
import { Polyflow } from "polyflow-sdk";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const wallet = createWalletClient({
  account: privateKeyToAccount("0xYOUR_PRIVATE_KEY"),
  chain: base,
  transport: http(),
});

const poly = new Polyflow("https://your-polyflow-server.com", wallet);

const blockNumber = await poly.getBlockNumber();
console.log("Block:", blockNumber); // 67000000n
```

## API

### Constructor

```typescript
new Polyflow(serverUrl: string, wallet: WalletClient, config?: {
  agentId?: string;    // Sent as X-Agent-Id header
  timeout?: number;    // Request timeout in ms (default: 30000)
})
```

### Paid Methods (auto-pay via x402)

| Method | Returns | RPC Method |
|--------|---------|------------|
| `getBlockNumber()` | `bigint` | eth_blockNumber |
| `getChainId()` | `number` | eth_chainId |
| `getGasPrice()` | `bigint` | eth_gasPrice |
| `getBalance(address, block?)` | `bigint` | eth_getBalance |
| `getTransactionCount(address, block?)` | `number` | eth_getTransactionCount |
| `getCode(address, block?)` | `HexString` | eth_getCode |
| `getStorageAt(address, slot, block?)` | `HexString` | eth_getStorageAt |
| `call(params, block?)` | `HexString` | eth_call |
| `estimateGas(params)` | `bigint` | eth_estimateGas |
| `getBlockByNumber(block?, full?)` | `Block` | eth_getBlockByNumber |
| `getBlockByHash(hash, full?)` | `Block` | eth_getBlockByHash |
| `getTransactionByHash(hash)` | `Transaction` | eth_getTransactionByHash |
| `getTransactionReceipt(hash)` | `TransactionReceipt` | eth_getTransactionReceipt |
| `getLogs(filter)` | `LogEntry[]` | eth_getLogs |
| `request(method, params?)` | `T` | Any JSON-RPC method |

### Free Methods (no payment)

| Method | Description |
|--------|-------------|
| `getHealth()` | Server health check |
| `getPricing()` | View pricing tiers |
| `getMethods()` | View supported methods |

### Receipts

Every paid call stores a receipt hash accessible via `poly.lastRequestMeta`:

```typescript
await poly.getBlockNumber();
console.log(poly.lastRequestMeta?.receiptHash); // SHA-256 hash
console.log(poly.lastRequestMeta?.receiptId);   // Receipt ID
```

### Error Handling

```typescript
import { Polyflow, RpcError, ConnectionError, PaymentError } from "polyflow-sdk";

try {
  await poly.getBlockNumber();
} catch (error) {
  if (error instanceof RpcError) {
    // JSON-RPC error (e.g. method not found)
  } else if (error instanceof PaymentError) {
    // x402 payment failed (e.g. insufficient USDC)
  } else if (error instanceof ConnectionError) {
    // Server unreachable
  }
}
```

## License

MIT

## Built with

- [Polyflow](https://github.com/valeo-cash/polyflow) — Machine-payable Polygon RPC
- [x402](https://x402.org) — Open payment protocol by Coinbase
- [Valeo Protocol](https://valeocash.com) — Payment infrastructure for AI agents
