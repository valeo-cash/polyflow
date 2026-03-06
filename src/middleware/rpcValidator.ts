import type { Request, Response, NextFunction } from "express";
import type { JsonRpcRequest } from "../types/index.js";

export function createRpcValidator(opts: {
  allowedMethods: string[];
  blockedMethods: string[];
}) {
  return function rpcValidator(req: Request, res: Response, next: NextFunction) {
    const body = req.body as Partial<JsonRpcRequest>;

    if (body.jsonrpc !== "2.0") {
      res.status(400).json({
        jsonrpc: "2.0",
        id: body.id ?? null,
        error: { code: -32600, message: "Invalid Request: jsonrpc must be '2.0'" },
      });
      return;
    }

    if (!body.method || typeof body.method !== "string") {
      res.status(400).json({
        jsonrpc: "2.0",
        id: body.id ?? null,
        error: { code: -32600, message: "Invalid Request: method is required" },
      });
      return;
    }

    if (body.id === undefined || body.id === null) {
      res.status(400).json({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32600, message: "Invalid Request: id is required" },
      });
      return;
    }

    if (opts.blockedMethods.includes(body.method)) {
      res.status(403).json({
        jsonrpc: "2.0",
        id: body.id,
        error: { code: -32601, message: `Method not allowed: ${body.method}` },
      });
      return;
    }

    if (opts.allowedMethods.length > 0 && !opts.allowedMethods.includes(body.method)) {
      res.status(403).json({
        jsonrpc: "2.0",
        id: body.id,
        error: { code: -32601, message: `Method not allowed: ${body.method}` },
      });
      return;
    }

    next();
  };
}
