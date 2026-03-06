import { createHash } from "crypto";
import { appendFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { v4 as uuidv4 } from "uuid";
import type { RpcReceipt } from "../types/index.js";

export class ReceiptLogger {
  private logDir: string;
  private logFile: string;

  constructor(logDir = "data/receipts") {
    this.logDir = resolve(process.cwd(), logDir);
    this.logFile = resolve(this.logDir, "receipts.jsonl");
    mkdirSync(this.logDir, { recursive: true });
  }

  log(params: {
    method: string;
    price: string;
    network: string;
    payTo: string;
    agentId?: string;
  }): RpcReceipt {
    const receipt: RpcReceipt = {
      id: `rcpt_${uuidv4().replace(/-/g, "").slice(0, 12)}`,
      timestamp: new Date().toISOString(),
      method: params.method,
      price: params.price,
      network: params.network,
      payTo: params.payTo,
      agentId: params.agentId,
      receiptHash: "",
    };

    const canonical = JSON.stringify({
      id: receipt.id,
      timestamp: receipt.timestamp,
      method: receipt.method,
      price: receipt.price,
      network: receipt.network,
      payTo: receipt.payTo,
    });
    receipt.receiptHash = createHash("sha256").update(canonical).digest("hex");

    appendFileSync(this.logFile, JSON.stringify(receipt) + "\n");

    return receipt;
  }
}
