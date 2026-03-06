import { paymentMiddleware } from "x402-express";
import type { Request, Response, NextFunction } from "express";
import type { AppConfig } from "../types/index.js";
import { PricingResolver } from "../pricing/resolver.js";
import { ReceiptLogger } from "../receipts/logger.js";

export function createX402Middleware(config: AppConfig) {
  const pricingResolver = new PricingResolver(config.pricing);
  const receiptLogger = new ReceiptLogger();

  const x402 = paymentMiddleware(
    config.walletAddress as `0x${string}`,
    {
      "/rpc": {
        price: config.pricing.defaultPrice,
        network: "base",
        config: { description: "Polyflow — machine-payable Polygon RPC" },
      },
    },
    { url: config.facilitatorUrl as `${string}://${string}` }
  );

  return function x402PaymentMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.path !== "/rpc") return next();

    const method = req.body?.method as string | undefined;
    const resolvedPrice = method ? pricingResolver.resolve(method) : config.pricing.defaultPrice;

    x402(req, res, () => {
      const receipt = receiptLogger.log({
        method: method || "unknown",
        price: resolvedPrice,
        network: "base",
        payTo: config.walletAddress,
        agentId: req.headers["x-agent-id"] as string | undefined,
      });

      res.setHeader("X-Receipt-Hash", receipt.receiptHash);
      res.setHeader("X-Receipt-Id", receipt.id);
      next();
    });
  };
}
