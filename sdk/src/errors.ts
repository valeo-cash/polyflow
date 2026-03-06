export class PolyflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PolyflowError";
  }
}

export class RpcError extends PolyflowError {
  code: number;
  data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    super(`RPC Error ${code}: ${message}`);
    this.name = "RpcError";
    this.code = code;
    this.data = data;
  }
}

export class ConnectionError extends PolyflowError {
  constructor(url: string, cause?: Error) {
    super(`Failed to connect to Polyflow server at ${url}${cause ? `: ${cause.message}` : ""}`);
    this.name = "ConnectionError";
  }
}

export class PaymentError extends PolyflowError {
  constructor(message: string) {
    super(`Payment failed: ${message}`);
    this.name = "PaymentError";
  }
}
