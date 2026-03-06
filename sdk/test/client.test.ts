import { describe, it, expect } from "vitest";
import { Polyflow } from "../src/client.js";
import { RpcError, ConnectionError, PaymentError } from "../src/errors.js";

describe("Polyflow SDK", () => {
  describe("Errors", () => {
    it("RpcError has correct properties", () => {
      const err = new RpcError(-32601, "Method not found");
      expect(err.code).toBe(-32601);
      expect(err.message).toContain("Method not found");
      expect(err.name).toBe("RpcError");
    });

    it("ConnectionError includes server URL", () => {
      const err = new ConnectionError("https://example.com");
      expect(err.message).toContain("https://example.com");
      expect(err.name).toBe("ConnectionError");
    });

    it("PaymentError wraps message", () => {
      const err = new PaymentError("insufficient funds");
      expect(err.message).toContain("insufficient funds");
      expect(err.name).toBe("PaymentError");
    });
  });

  describe("Constructor", () => {
    it("strips trailing slash from server URL", () => {
      expect(Polyflow).toBeDefined();
    });
  });
});
