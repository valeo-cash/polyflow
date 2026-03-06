import type { PricingConfig } from "../types/index.js";

export class PricingResolver {
  private methodPriceMap: Map<string, string>;
  private defaultPrice: string;

  constructor(config: PricingConfig) {
    this.defaultPrice = config.defaultPrice;
    this.methodPriceMap = new Map();

    for (const tier of Object.values(config.tiers)) {
      for (const method of tier.methods) {
        this.methodPriceMap.set(method, tier.price);
      }
    }
  }

  resolve(method: string): string {
    return this.methodPriceMap.get(method) || this.defaultPrice;
  }

  getAllPricing(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [method, price] of this.methodPriceMap) {
      result[method] = price;
    }
    return result;
  }
}
