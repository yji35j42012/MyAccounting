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
		expect(source).toContain('公開前十大對基金淨值估計貢獻');
		expect(source).toContain('class="fund_nav_contribution"');
		expect(source).toContain('class="fund_nav_contribution_detail"');
		expect(source).not.toContain('class="fund_holdings_signal"');
		expect(source).toContain('holdingsWeightedChangePct()');
		expect(source).toContain('holdingsFundContributionPct()');
		expect(source).toContain('fundContributionPct');
		expect(source).toContain('hydrateYahooQuoteCache(this.activeFundKey)');
		expect(source).toContain('this.persistYahooQuoteSnapshot(fundKey, snapshot.fetchedAt);');
		expect(source).toContain("'quotes'");
		expect(source).toContain('hydrateHoldingsSignalCache(this.activeFundKey)');
		expect(source).toContain("this.persistHoldingsSignalSnapshot(fundKey);");
		expect(source).toContain("'holdings-signal'");
		expect(source).toContain("const FUND_ANALYSIS_VERSION = 'fund-analysis-v1.4.0-2026.08.17';");
		expect(source).toContain('console.info(`[現金流管理] fund_analysis.vue 版本：${FUND_ANALYSIS_VERSION}`);');
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
		state.funds.forEach((fund: { key: string }) => {
			storage.set(instance.getFundStorageKey("quotes", fund.key), "quote cache");
			storage.set(instance.getFundStorageKey("holdings-signal", fund.key), "holding signal cache");
		});
		storage.set("unrelated-setting", "keep");

    instance.clearFundNavCache();

		expect(cacheKeys.every((key: string) => !storage.has(key))).toBe(true);
		expect(storage.get("cashflow-manager:quotes:keep")).toBe("quote cache");
		expect(state.funds.every((fund: { key: string }) => storage.get(instance.getFundStorageKey("quotes", fund.key)) === "quote cache")).toBe(true);
		expect(state.funds.every((fund: { key: string }) => storage.get(instance.getFundStorageKey("holdings-signal", fund.key)) === "holding signal cache")).toBe(true);
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

	it("labels holdings contribution as same-day comparable only when quote and NAV dates match", async () => {
		const { component } = await loadFundPageComponent();
		const instance = { ...component.methods };

		expect(instance.getHoldingsNavDateStatus("2026 / 08 / 13 13:55", "2026 / 08 / 13")).toContain("可作同日方向對照");
		expect(instance.getHoldingsNavDateStatus("2026 / 08 / 14 13:55", "2026 / 08 / 13")).toContain("僅供方向觀察");
	});

	it("hydrates and persists each fund's Yahoo quote cache with price, percent, and amount changes", async () => {
		const { component, storage } = await loadFundPageComponent();
		const state = component.data();
		const instance = { ...state, ...component.methods };
		const fundKey = "taiwanDaba";
		const targetFund = state.funds.find((fund: { key: string }) => fund.key === fundKey);
		const cacheKey = instance.getFundStorageKey("quotes", fundKey);
		const snapshot = {
			fundKey,
			holdingsDate: targetFund.holdingsDate,
			quoteUpdatedAt: "2026 / 08 / 17 13:55",
			fetchedAt: 1_786_700_000_000,
			quotes: [
				{ symbol: targetFund.holdings[0].symbol, price: 6700, previousClose: 6600, priceChange: 999, changePct: 999 },
				{ symbol: targetFund.holdings[1].symbol, price: 1610, previousClose: 1600, priceChange: 999, changePct: 999 },
			],
		};
		storage.set(cacheKey, JSON.stringify(snapshot));

		expect(instance.hydrateYahooQuoteCache(fundKey)).toBe(true);
		expect(targetFund.holdings[0]).toMatchObject({ price: 6700, previousClose: 6600, priceChange: 100 });
		expect(targetFund.holdings[0].changePct).toBeCloseTo(100 / 6600 * 100, 8);
		expect(state.quotesByFund[fundKey]).toMatchObject({ quoteUpdatedAt: "2026 / 08 / 17 13:55", quotedCount: 2, cacheMode: "local" });
		expect(instance.hydrateYahooQuoteCache("taiwanIntelligence")).toBe(false);

		expect(instance.persistYahooQuoteSnapshot(fundKey, 1_786_700_100_000)).toBe(true);
		const refreshedSnapshot = JSON.parse(storage.get(cacheKey) ?? "{}");
		expect(refreshedSnapshot).toMatchObject({ fundKey, holdingsDate: targetFund.holdingsDate, quoteUpdatedAt: "2026 / 08 / 17 13:55" });
		expect(refreshedSnapshot.quotes).toHaveLength(2);
		expect(state.quotesByFund[fundKey].cacheMode).toBe("remote");
	});

	it("rejects a Yahoo quote cache snapshot after the public holdings date changes", async () => {
		const { component, storage } = await loadFundPageComponent();
		const state = component.data();
		const instance = { ...state, ...component.methods };
		const fundKey = "taiwanIntelligence";
		const targetFund = state.funds.find((fund: { key: string }) => fund.key === fundKey);
		storage.set(instance.getFundStorageKey("quotes", fundKey), JSON.stringify({
			fundKey,
			holdingsDate: "2026 / 03 / 31",
			quoteUpdatedAt: "2026 / 08 / 17 13:55",
			quotes: [{ symbol: targetFund.holdings[0].symbol, price: 6700, previousClose: 6600 }],
		}));

		expect(instance.hydrateYahooQuoteCache(fundKey)).toBe(false);
		expect(targetFund.holdings[0].price).toBeNull();
	});

	it("calculates public top-ten standardized return and fund-level contribution separately", async () => {
		const { component } = await loadFundPageComponent();
		const instance = {
			activeFund: { holdings: [{ weight: 50, changePct: 2 }, { weight: 30, changePct: -1 }, { weight: 20, changePct: null }] },
			...component.methods,
		};
		const calculation = instance.calculateHoldingsWeightedChange(instance.activeFund.holdings);
		const weightedChange = component.computed.holdingsWeightedChangePct.call(instance);
		const fundContribution = component.computed.holdingsFundContributionPct.call(instance);
		instance.holdingsWeightedChangePct = weightedChange;
		instance.holdingsFundContributionPct = fundContribution;

		expect(calculation.totalWeight).toBe(80);
		expect(weightedChange).toBeCloseTo(0.875, 8);
		expect(fundContribution).toBeCloseTo(0.7, 8);
		expect(component.computed.holdingsChangeAssessment.call(instance)).toBe("列示持股整體偏多");
	});

	it("hydrates and refreshes each fund's weighted-holdings signal cache independently", async () => {
		const { component, storage } = await loadFundPageComponent();
		const state = component.data();
		const instance = { ...state, ...component.methods };
		const fundKey = "taiwanTechnology";
		const targetFund = state.funds.find((fund: { key: string }) => fund.key === fundKey);
		const cacheKey = instance.getFundStorageKey("holdings-signal", fundKey);
		const snapshot = {
			fundKey,
			holdingsDate: targetFund.holdingsDate,
			weightedChangePct: 1.2345,
			fundContributionPct: 0.6642,
			totalWeight: 53.8,
			quotedCount: 10,
			holdingsCount: 10,
			quoteUpdatedAt: "2026 / 08 / 13 13:55",
			savedAt: 1_786_700_000_000,
		};
		storage.set(cacheKey, JSON.stringify(snapshot));

		expect(instance.hydrateHoldingsSignalCache(fundKey)).toBe(true);
		expect(state.holdingsSignalsByFund[fundKey]).toMatchObject({
			weightedChangePct: 1.2345,
			fundContributionPct: 0.6642,
			totalWeight: 53.8,
			quotedCount: 10,
			cacheMode: "local",
		});
		expect(instance.hydrateHoldingsSignalCache("taiwanDaba")).toBe(false);

		state.quotesByFund[fundKey].quoteUpdatedAt = "2026 / 08 / 13 14:00";
		expect(instance.persistHoldingsSignalSnapshot(fundKey)).toBe(true);
		const refreshedSnapshot = JSON.parse(storage.get(cacheKey) ?? "{}");
		const calculated = instance.calculateHoldingsWeightedChange(targetFund.holdings);
		expect(refreshedSnapshot).toMatchObject({
			fundKey,
			holdingsDate: targetFund.holdingsDate,
			quoteUpdatedAt: "2026 / 08 / 13 14:00",
			quotedCount: 10,
			holdingsCount: 10,
		});
		expect(refreshedSnapshot.weightedChangePct).toBeCloseTo(calculated.weightedChangePct, 8);
		expect(refreshedSnapshot.fundContributionPct).toBeCloseTo(calculated.fundContributionPct, 8);
		expect(state.holdingsSignalsByFund[fundKey].cacheMode).toBe("remote");
	});

	it("rejects a weighted-holdings cache snapshot when the public holdings date has changed", async () => {
		const { component, storage } = await loadFundPageComponent();
		const state = component.data();
		const instance = { ...state, ...component.methods };
		const fundKey = "taiwanDaba";
		storage.set(instance.getFundStorageKey("holdings-signal", fundKey), JSON.stringify({
			fundKey,
			holdingsDate: "2026 / 03 / 31",
			weightedChangePct: -0.45,
			fundContributionPct: -0.26325,
			totalWeight: 58.5,
			quotedCount: 10,
			holdingsCount: 10,
			savedAt: Date.now(),
		}));

		expect(instance.hydrateHoldingsSignalCache(fundKey)).toBe(false);
		expect(state.holdingsSignalsByFund[fundKey].weightedChangePct).toBeNull();
	});

  it("keeps each fund's public top-ten weight total aligned with its displayed summary", async () => {
    const { component } = await loadFundPageComponent();
    const state = component.data();

    state.funds.forEach((fund: { holdings: Array<{ weight: number; symbol: string }>; summaryCards: Array<{ label: string; value: string }> }) => {
      const declaredWeight = Number(fund.summaryCards.find(card => card.label === "前十大列示比重")?.value.replace("%", ""));
      const calculatedWeight = fund.holdings.reduce((total, holding) => total + holding.weight, 0);

      expect(fund.holdings).toHaveLength(10);
      expect(new Set(fund.holdings.map(holding => holding.symbol)).size).toBe(10);
      expect(calculatedWeight).toBeCloseTo(declaredWeight, 8);
    });
  });
});
