import express from "express";
import cors from "cors";
import helmet from "helmet";
import pino from "pino";
import { loadConfig } from "./config/index.js";
import { createX402Middleware } from "./middleware/x402Payment.js";
import { createRpcValidator } from "./middleware/rpcValidator.js";
import { RpcProxy } from "./proxy/rpcProxy.js";
import type { JsonRpcRequest } from "./types/index.js";
import { PricingResolver } from "./pricing/resolver.js";

const config = loadConfig();
const logger = pino({ level: config.logLevel });
const rpcProxy = new RpcProxy(config.polygonRpcUrl);
const pricingResolver = new PricingResolver(config.pricing);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/pricing", (_req, res) => {
  res.json({
    description: "Polygon JSON-RPC proxy — pay-per-request via x402",
    network: config.settlementNetwork,
    payTo: config.walletAddress,
    pricing: config.pricing,
  });
});

app.get("/methods", (_req, res) => {
  res.json({
    methods: pricingResolver.getAllPricing(),
    blocked: config.blockedMethods,
  });
});

// x402 payment gate (single /rpc route at default price)
app.use(createX402Middleware(config));

// JSON-RPC validation + proxy (only reached after payment verification)
app.post(
  "/rpc",
  createRpcValidator({
    allowedMethods: config.allowedMethods,
    blockedMethods: config.blockedMethods,
  }),
  async (req, res) => {
    const rpcRequest = req.body as JsonRpcRequest;
    const startTime = Date.now();

    logger.info({ method: rpcRequest.method, id: rpcRequest.id }, "Proxying RPC request");

    const rpcResponse = await rpcProxy.forward(rpcRequest);
    const duration = Date.now() - startTime;

    logger.info(
      { method: rpcRequest.method, id: rpcRequest.id, duration, hasError: !!rpcResponse.error },
      "RPC response"
    );

    res.json(rpcResponse);
  }
);

app.listen(config.port, () => {
  logger.info({ port: config.port, network: config.settlementNetwork }, "Polyflow server started");
  logger.info({ facilitator: config.facilitatorUrl, wallet: config.walletAddress }, "Payment config");
  logger.info({ upstream: config.polygonRpcUrl.replace(/\/[^/]+$/, "/***") }, "RPC upstream");
});
