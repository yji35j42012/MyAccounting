import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

async function loadFundPageComponent() {
  const source = await readFile(new URL("../page/fund_analysis.vue", import.meta.url), "utf8");
  const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  if (!script) throw new Error("找不到基金頁腳本");

  const storage = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, String(value)),
    removeItem: (key: string) => storage.delete(key),
  };
  const context = { module: { exports: {} as Record<string, unknown> }, window: {}, localStorage, Intl, Date };
  vm.runInNewContext(script, context);
  return { source, component: context.module.exports as any, storage };
}

describe("fund page manual quote update binding", () => {
  it("invokes quote refresh without passing the browser click event as a fund key", async () => {
    const { source } = await loadFundPageComponent();

    expect(source).toContain('@click="refreshYahooQuotes()"');
    expect(source).toContain("if (typeof fundKey !== 'string' || !this.quotesByFund[fundKey]) fundKey = this.activeFundKey;");
		expect(source).toContain("if (window.FundUpdateTiming) return window.FundUpdateTiming;");
		expect(source).toContain("minutes >= 9 * 60 && minutes < 14 * 60");
		expect(source).toContain('clearFundNavCache()');
		expect(source).toContain("localStorage.removeItem(this.getFundStorageKey(type, fund.key))");
		expect(source).toContain('priceChange: quote.price - quote.previousClose');
		expect(source).toContain('formatQuoteChange(getQuoteChangeAmount(item))');
		expect(source).toContain('公開前十大持股加權漲跌');
		expect(source).toContain('holdingsWeightedChangePct()');
		expect(source).not.toContain('class="fund_progress"');
  });

  it("clears only the four funds' nav and history cache entries", async () => {
    const { component, storage } = await loadFundPageComponent();
    const state = component.data();
    const instance = { ...state, ...component.methods };
    const cacheKeys = state.funds.flatMap((fund: { key: string }) => [
      instance.getFundStorageKey("nav", fund.key),
      instance.getFundStorageKey("history", fund.key),
    ]);
    cacheKeys.forEach((key: string) => storage.set(key, "cached"));
    storage.set("cashflow-manager:quotes:keep", "quote cache");
    storage.set("unrelated-setting", "keep");

    instance.clearFundNavCache();

    expect(cacheKeys.every((key: string) => !storage.has(key))).toBe(true);
    expect(storage.get("cashflow-manager:quotes:keep")).toBe("quote cache");
    expect(storage.get("unrelated-setting")).toBe("keep");
    expect(state.funds.every((fund: { key: string }) => state.navsByFund[fund.key].cacheMode === "cleared" && state.historiesByFund[fund.key].cacheMode === "cleared")).toBe(true);
  });

  it("calculates and formats Yahoo price change amounts from price and previous close", async () => {
    const { component } = await loadFundPageComponent();
    const instance = { ...component.methods };

    expect(instance.getQuoteChangeAmount({ price: 182, previousClose: 177 })).toBe(5);
    expect(instance.getQuoteChangeAmount({ price: 622, previousClose: 662 })).toBe(-40);
    expect(instance.formatQuoteChange(instance.getQuoteChangeAmount({ price: 182, previousClose: 177 }))).toBe("TWD +5.00");
    expect(instance.formatQuoteChange(instance.getQuoteChangeAmount({ price: 622, previousClose: 662 }))).toBe("TWD -40.00");
    expect(instance.formatQuoteChange(instance.getQuoteChangeAmount({ price: 177, changePct: -0.56 }))).toBe("TWD -1.00");
    expect(instance.formatQuoteChange(instance.getQuoteChangeAmount({ price: 182 }))).toBe("TWD —");
  });

  it("calculates public top-ten holdings' weighted change and assessment", async () => {
    const { component } = await loadFundPageComponent();
    const instance = {
      activeFund: { holdings: [{ weight: 50, changePct: 2 }, { weight: 30, changePct: -1 }, { weight: 20, changePct: null }] },
      ...component.methods,
    };
    const weightedChange = component.computed.holdingsWeightedChangePct.call(instance);
    instance.holdingsWeightedChangePct = weightedChange;

    expect(weightedChange).toBeCloseTo(0.875, 8);
    expect(component.computed.holdingsChangeAssessment.call(instance)).toBe("列示持股整體偏多");
  });
});
