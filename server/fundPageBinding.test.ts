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

function verifiedHolding<T extends Record<string, unknown>>(holding: T) {
	const timestamp = Date.now();
	return { ...holding, quoteVerified: true, marketTime: Math.floor(timestamp / 1000), quoteFetchedAt: timestamp };
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
			expect(source).toContain("this.applyYahooQuoteSnapshot(fundKey, { ...snapshot, holdingsDate: targetFund.holdingsDate }, 'remote')");
		expect(source).toContain('formatQuoteChange(getQuoteChangeAmount(item))');
		expect(source).toContain('公開前十大對基金淨值估計貢獻');
			expect(source).toContain('class="fund_hero_meta fund_hero_contribution_card"');
		expect(source).toContain('class="fund_nav_contribution_detail"');
		expect(source).not.toContain('class="fund_holdings_signal"');
		expect(source).toContain('const requestTimeoutMs = quoteRequest.isExternalProxy ? 25 * 1000 : 12 * 1000;');
		expect(source).toContain('holdingsWeightedChangePct()');
		expect(source).toContain('holdingsFundContributionPct()');
			expect(source).toContain('fundContributionPct');
			expect(source).toContain('hydrateHoldingsSignalCache(this.activeFundKey); this.hydrateYahooQuoteCache(this.activeFundKey)');
				expect(source).toContain('const coverage = this.getQuoteCacheCoverage(fundKey);');
			expect(source).toContain("'quotes'");
			expect(source).toContain('hydrateHoldingsSignalCache(this.activeFundKey)');
			expect(source).toContain('syncYahooQuoteAndHoldingsSignal(fundKey, fetchedAt = Date.now(), quotedCount = 0)');
			expect(source).toContain("refreshHoldingsSignalFromCurrentQuotes(fundKey, 'local', true)");
			expect(source).toContain("const signalStored = this.refreshHoldingsSignalFromCurrentQuotes(fundKey, 'remote', true);");
			expect(source).toContain("'holdings-signal'");
				expect(source).toContain("const FUND_ANALYSIS_VERSION = 'fund-analysis-v1.5.34-2026.08.20';");
			expect(source).not.toContain('資料揭露：');
			expect(source).not.toContain('class="fund_notice"');
			expect(source).toContain('class="fund_holdings_asof_inline"');
			expect(source.match(/持股資料基準日：\{\{ activeFund\.holdingsDate \}\}/g)).toHaveLength(1);
			expect(source).toContain('@click="manualRefreshOfficialNav"');
			expect(source).toContain('class="fund_nav_label_row"');
			expect(source).toContain('aria-label="重新整理最新公開淨值"');
			expect(source).toContain('class="fund_nav_last_updated"');
			expect(source).toContain('class="fund_nav_success_toast"');
			expect(source).toContain("showNavSuccessToast() { this.navSuccessToast = '最新公開淨值已更新'");
			expect(source).toContain('async manualRefreshOfficialNav() { const updated = await this.refreshOfficialNav(true); if (updated) this.showNavSuccessToast(); }');
			expect(source).not.toContain('持股資料：{{ activeFund.holdingsDate }}');
			expect(source).toContain('class="fund_nav_signal_line"');
			expect(source).toContain('holdingsSignalTimestamp()');
			expect(source).toContain('v-if="holdingsSignalTimestamp"');
			expect(source).toContain('holdingsSignalDateStatus()');
			expect(source).toContain('報價日期 ${quoteDateTime}，僅供方向觀察');
			expect(source).not.toContain('淨值日期 ${normalizedNavDate}');
			const heroStart = source.indexOf('<section class="fund_hero normal_shadow">');
			const heroEnd = source.indexOf('</section>', heroStart);
			const heroTemplate = source.slice(heroStart, heroEnd);
			expect(heroTemplate.indexOf('class="fund_hero_nav"')).toBeGreaterThan(heroTemplate.indexOf('class="fund_tags"'));
			expect(heroTemplate.indexOf('fund_hero_contribution_card')).toBeGreaterThan(heroTemplate.indexOf('class="fund_hero_nav"'));
			expect(source).toContain('前十大標準化日報酬（隨 Yahoo 報價同步）');
			expect(source).toContain('console.info(`[現金流管理] fund_analysis.vue 版本：${FUND_ANALYSIS_VERSION}`);');
			expect(source).not.toContain('class="fund_progress"');
			expect(source).toContain('class="fund_holdings_controls"');
			expect(source).toContain('aria-label="更新官方公開持股"');
			expect(source).toContain('getHoldingsRequest(fundKey, force = false)');
			expect(source).toContain("/api/trpc/market.publicHoldings?input=${input}");
			expect(source).toContain('hydrateHoldingsCache(this.activeFundKey)');
				expect(source).toContain('async refreshHoldingsIfNeeded(fundKey = this.activeFundKey)');
				expect(source).toContain('isHoldingsCheckedToday(state)');
				expect(source).toContain("this.writeFundStorage('holdings', fundKey, snapshot)");
				expect(source).toContain('if (holdingsChanged) await this.refreshYahooQuotes(fundKey);');
				expect(source).not.toContain('持股快取剩餘');
				expect(source).toContain('formatTaipeiDateTime(this.activeHoldings.fetchedAt + 24 * 60 * 60 * 1000)');
				expect(source).toContain("'國巨*': '2327.TW'");
				expect(source).toContain("'信驊': '5274.TWO'");
				expect(source).toContain("'創意': '3443.TW'");
				expect(source).toContain('quoteCacheIncompleteMessage()');
				expect(source).toContain('class="fund_quote_cache_warning"');
				expect(source).toContain('clearActiveFundHoldingsCache');
				expect(source).toContain('aria-label="一鍵清除持股快取"');
				expect(source).toContain("const holdingsUpdated = await this.refreshHoldings(true, fundKey);");
				expect(source).toContain('if (coverage.quotedCount < coverage.expectedCount) await this.refreshYahooQuotes(fundKey);');
				expect(source).toContain('class="fund_flat_badge">平盤</em>');
				expect(source).toContain('前收盤 TWD {{ formatPrice(item.previousClose) }}');
				expect(source).toContain('class="fund_quote_missing"');
				expect(source).toContain('quoteUnverifiedHoldings()');
				expect(source.match(/quoteUnverifiedHoldings\(\)/g)).toHaveLength(1);
				expect(source).toContain('isYahooQuoteVerified(quote, referenceTime = Date.now())');
				expect(source).toContain("'待確認'");
				expect(source).toContain('class="fund_company_link"');
				expect(source).toContain('target="_blank" rel="noopener noreferrer"');
				expect(source).not.toContain('<small>{{ item.market }}</small>');
				expect(source).not.toContain('{{ item.market }} ・ 比重');
				expect(source).toContain('clearAndRefreshActiveFundData');
				expect(source).toContain('清除快取並重新取得全部資料');
				expect(source).toContain('clearAndRefreshAllFundsData');
				expect(source).toContain('一鍵重整四檔基金');
				expect(source).toContain('batchRefreshRows()');
				expect(source).toContain('row.statusText');
				expect(source).toContain("['nav', 'history', 'holdings', 'quotes', 'holdings-signal']");
			});

	it("hydrates official public holdings per fund and invalidates stale quote data only when holdings change", async () => {
		const { component, storage } = await loadFundPageComponent();
		const state = component.data();
		const instance = { ...state, ...component.methods };
		const fundKey = "taiwanTechnology";
		const cacheKey = instance.getFundStorageKey("holdings", fundKey);
		const quoteKey = instance.getFundStorageKey("quotes", fundKey);
		const signalKey = instance.getFundStorageKey("holdings-signal", fundKey);
		storage.set(quoteKey, "old quote");
		storage.set(signalKey, "old signal");
		storage.set(cacheKey, JSON.stringify({
			fundKey,
			holdingsDate: "2026/07/31",
			fetchedAt: 1_786_900_000_000,
			sourceName: "安聯投信公開持股",
			sourceUrl: "https://example.test/portfolio",
			holdings: [
				{ rank: 1, name: "台積電", weight: 8.22, industry: "半導體業" },
				{ rank: 2, name: "旺矽", weight: 7.61, industry: "半導體業" },
			],
		}));

		expect(instance.hydrateHoldingsCache(fundKey)).toBe(true);
		const targetFund = state.funds.find((fund: { key: string }) => fund.key === fundKey);
		expect(targetFund).toMatchObject({ holdingsDate: "2026 / 07 / 31" });
		expect(targetFund.holdings).toEqual(expect.arrayContaining([
			expect.objectContaining({ rank: 1, name: "台積電", weight: 8.22, symbol: "2330.TW", industry: "半導體業" }),
		]));
		expect(state.holdingsByFund[fundKey]).toMatchObject({ cacheMode: "local", dataDate: "2026-07-31", sourceName: "安聯投信公開持股" });
		expect(storage.get(quoteKey)).toBe("old quote");
		expect(storage.get(signalKey)).toBe("old signal");
		expect(instance.hydrateHoldingsCache("taiwanDaba")).toBe(false);
	});

		it("checks holdings at most once per Taipei calendar day while allowing a manual refresh path", async () => {
		const { component } = await loadFundPageComponent();
		const instance = {
			...component.methods,
			holdingsByFund: { taiwanTechnology: { fetchedAt: 3_000 } },
			activeFundKey: "taiwanTechnology",
			getTiming: () => ({ getTaipeiCalendarDate: (timestamp: number) => timestamp < 2_000 ? "2026-08-19" : "2026-08-20" }),
			refreshHoldings: async (force: boolean) => force,
		};

		expect(instance.isHoldingsCheckedToday({ fetchedAt: 3_000 })).toBe(true);
		expect(instance.isHoldingsCheckedToday({ fetchedAt: 1_000 })).toBe(false);
			expect(await instance.refreshHoldings(true, "taiwanTechnology")).toBe(true);
		});

		it("shows the next daily holdings check as a Taiwan date, hour, and minute without cache countdown text", async () => {
			const { component } = await loadFundPageComponent();
			const timestamp = Date.UTC(2026, 7, 19, 5, 7, 45);
			const instance = {
				activeHoldings: { fetchedAt: timestamp },
				formatTaipeiDateTime: component.methods.formatTaipeiDateTime,
			};

			expect(component.methods.formatTaipeiDateTime(timestamp)).toMatch(/^2026 \/ 08 \/ 19 \d{2}:\d{2}$/);
			expect(component.computed.holdingsTimingStatus.call(instance)).toMatch(/^下次每日檢查 2026 \/ 08 \/ 20 \d{2}:\d{2}$/);
		});

	it("shows a success toast only after a manual official NAV refresh succeeds", async () => {
		const { component } = await loadFundPageComponent();
		let receivedForce = false;
		let successToastShown = false;
		const instance = {
			refreshOfficialNav: async (force: boolean) => { receivedForce = force; return true; },
			showNavSuccessToast: () => { successToastShown = true; },
		};

		await component.methods.manualRefreshOfficialNav.call(instance);

		expect(receivedForce).toBe(true);
		expect(successToastShown).toBe(true);
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

		it("clears the active fund's five cache records and forces every data source to refresh", async () => {
			const { component, storage } = await loadFundPageComponent();
			const state = component.data();
			const fundKey = "taiwanTechnology";
			const instance = { ...state, ...component.methods };
			["nav", "history", "holdings", "quotes", "holdings-signal"].forEach(type => storage.set(instance.getFundStorageKey(type, fundKey), "cached"));
			storage.set(instance.getFundStorageKey("quotes", "taiwanDaba"), "keep");
			const calls: Array<[string, boolean, string]> = [];
			instance.refreshOfficialNav = async (force: boolean, key: string) => { calls.push(["nav", force, key]); state.navsByFund[key].cacheMode = "remote"; return true; };
			instance.refreshRecentHistoryNav = async (force: boolean, key: string) => { calls.push(["history", force, key]); state.historiesByFund[key].cacheMode = "remote"; return true; };
			instance.refreshHoldings = async (force: boolean, key: string) => { calls.push(["holdings", force, key]); state.holdingsByFund[key].cacheMode = "remote"; return true; };
			instance.refreshYahooQuotes = async (key: string) => { calls.push(["quotes", true, key]); state.quotesByFund[key].cacheMode = "remote"; state.quotesByFund[key].savedAt = Date.now(); state.quotesByFund[key].quotedCount = 10; };

			const result = await instance.clearAndRefreshActiveFundData();

			expect(result).toBe(true);
			expect(calls).toEqual(expect.arrayContaining([["nav", true, fundKey], ["history", true, fundKey], ["holdings", true, fundKey], ["quotes", true, fundKey]]));
			expect(["nav", "history", "holdings", "quotes", "holdings-signal"].every(type => !storage.has(instance.getFundStorageKey(type, fundKey)))).toBe(true);
			expect(storage.get(instance.getFundStorageKey("quotes", "taiwanDaba"))).toBe("keep");
			expect(state.fullRefreshByFund[fundKey]).toMatchObject({ isRefreshing: false, isError: false, message: "本機快取已清除，淨值、歷史、持股與 Yahoo 報價皆已重新取得" });
		});

		it("keeps the current display values and reports partial failure when full refresh cannot obtain every source", async () => {
			const { component } = await loadFundPageComponent();
			const state = component.data();
			const fundKey = "taiwanTechnology";
			const targetFund = state.funds.find((fund: { key: string }) => fund.key === fundKey);
			const originalNav = targetFund.nav;
			const instance = { ...state, ...component.methods };
			instance.refreshOfficialNav = async () => false;
			instance.refreshRecentHistoryNav = async () => true;
			instance.refreshHoldings = async () => true;
			instance.refreshYahooQuotes = async (key: string) => { state.quotesByFund[key].quoteError = "Yahoo 更新失敗，已保留前次成功取得的報價"; };

			const result = await instance.clearAndRefreshActiveFundData();

			expect(result).toBe(false);
			expect(targetFund.nav).toBe(originalNav);
			expect(state.fullRefreshByFund[fundKey]).toMatchObject({ isRefreshing: false, isError: true, message: "已清除本機快取；部分資料更新失敗，畫面保留前次成功資料" });
		});

		it("refreshes all four funds from a single batch control and reports each result", async () => {
			const { component } = await loadFundPageComponent();
			const state = component.data();
			const instance = { ...state, ...component.methods };
			const calls: string[] = [];
			instance.formatQuoteTime = () => "2026 / 08 / 20 17:10";
			instance.clearAndRefreshFundData = async (fundKey: string) => { calls.push(fundKey); return fundKey !== "fuhwaOmni"; };

			const result = await instance.clearAndRefreshAllFundsData();

			expect(result).toBe(false);
			expect(calls).toEqual(state.funds.map((fund: { key: string }) => fund.key));
			expect(state.batchRefresh).toMatchObject({ isRefreshing: false, isError: true, message: "四檔基金已完成重整；1 檔有部分資料更新失敗" });
			expect(state.batchRefresh.results).toMatchObject({ taiwanTechnology: { success: true, completedAt: "2026 / 08 / 20 17:10" }, fuhwaOmni: { success: false, message: "部分資料更新失敗，已保留前次成功資料" } });
			const rows = component.computed.batchRefreshRows.call(instance);
			expect(rows.find((row: { key: string }) => row.key === "fuhwaOmni")).toMatchObject({ isError: true, statusText: "部分資料更新失敗，已保留前次成功資料（本次完成 2026 / 08 / 20 17:10）" });
		});

		it("detects incomplete local Yahoo quote caches and clears only the active fund's holdings caches", async () => {
			const { component, storage } = await loadFundPageComponent();
			const state = component.data();
			const fundKey = "taiwanTechnology";
			const targetFund = state.funds.find((fund: { key: string }) => fund.key === fundKey);
				targetFund.holdings = targetFund.holdings.map((holding: { symbol: string }, index: number) => index === 0 ? verifiedHolding({ ...holding, price: 2350, previousClose: 2380 }) : { ...holding, price: null, previousClose: null });
			state.quotesByFund[fundKey] = { ...state.quotesByFund[fundKey], cacheMode: "local", quotedCount: 1 };
			const instance = { ...state, ...component.methods, activeFund: targetFund, activeQuote: state.quotesByFund[fundKey] };
			Object.defineProperty(instance, "quoteCacheCoverage", { get: () => component.computed.quoteCacheCoverage.call(instance) });

			expect(component.computed.quoteCacheIncomplete.call(instance)).toBe(true);
			expect(component.computed.quoteCacheIncompleteMessage.call(instance)).toBe("本機報價快取不完整（1/10 檔）；請按「更新股價」補齊目前持股報價。");
			["holdings", "quotes", "holdings-signal"].forEach(type => storage.set(instance.getFundStorageKey(type, fundKey), "cached"));
			storage.set(instance.getFundStorageKey("quotes", "taiwanDaba"), "keep");

			const refreshCalls: Array<[string, boolean, string]> = [];
			instance.refreshHoldings = async (force: boolean, requestedFundKey: string) => { refreshCalls.push(["holdings", force, requestedFundKey]); return true; };
			instance.refreshYahooQuotes = async (requestedFundKey: string) => { refreshCalls.push(["quotes", true, requestedFundKey]); };
			await instance.clearActiveFundHoldingsCache();

			expect(["holdings", "quotes", "holdings-signal"].every(type => !storage.has(instance.getFundStorageKey(type, fundKey)))).toBe(true);
			expect(storage.get(instance.getFundStorageKey("quotes", "taiwanDaba"))).toBe("keep");
			expect(state.quotesByFund[fundKey]).toMatchObject({ cacheMode: "cleared", quotedCount: 0 });
			expect(state.holdingsByFund[fundKey].cacheMode).toBe("cleared");
			expect(targetFund.holdings.every((holding: { price: unknown; previousClose: unknown }) => holding.price === null && holding.previousClose === null)).toBe(true);
			expect(refreshCalls).toEqual([["holdings", true, fundKey], ["quotes", true, fundKey]]);
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

		it("builds a safe Yahoo stock link only for supported Taiwanese stock symbols", async () => {
			const { component } = await loadFundPageComponent();
			const instance = { ...component.methods };

			expect(instance.getYahooQuoteUrl({ name: "台積電", symbol: "2330.TW" })).toBe("https://tw.stock.yahoo.com/quote/2330.TW");
			expect(instance.getYahooQuoteUrl({ name: "旺矽", symbol: "6223.TWO" })).toBe("https://tw.stock.yahoo.com/quote/6223.TWO");
			expect(instance.getYahooQuoteUrl({ name: "台積電" })).toBe("https://tw.stock.yahoo.com/quote/2330.TW");
			expect(instance.getYahooQuoteUrl({ name: "未知公司", symbol: "javascript:alert(1)" })).toBe("");
		});

		it("labels flat quotes and lists holdings whose Yahoo prices are unavailable", async () => {
			const { component } = await loadFundPageComponent();
			const instance = {
				activeFund: { holdings: [
					verifiedHolding({ name: "國巨", symbol: "2327.TW", price: 576, previousClose: 576, changePct: 0 }),
					{ name: "待確認公司", symbol: "", price: null, previousClose: null, changePct: null },
					{ name: "暫無報價公司", symbol: "9999.TW", price: null, previousClose: null, changePct: null },
				] },
				...component.methods,
			};

			expect(instance.isFlatQuote(instance.activeFund.holdings[0])).toBe(true);
			expect(instance.isFlatQuote({ changePct: 0.006 })).toBe(false);
			expect(component.methods.quoteUnverifiedHoldings).toBeUndefined();
			expect(component.computed.quoteUnverifiedHoldings.call(instance)).toEqual([
					{ name: "待確認公司", reason: "尚未確認 Yahoo 代號" },
					{ name: "暫無報價公司", reason: "尚無法取得已驗證 Yahoo 報價" },
			]);
		});

	it("shows the holdings quote date with time without displaying the NAV date", async () => {
		const { component } = await loadFundPageComponent();
		const instance = { ...component.methods };

		expect(instance.getHoldingsQuoteDateStatus("2026 / 08 / 13 13:55")).toBe("報價日期 2026-08-13 13:55，僅供方向觀察");
		expect(instance.getHoldingsQuoteDateStatus("2026 / 08 / 14 09:00")).toBe("報價日期 2026-08-14 09:00，僅供方向觀察");
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
					{ symbol: targetFund.holdings[0].symbol, price: 6700, previousClose: 6600, marketTime: Math.floor(1_786_700_000_000 / 1000), priceChange: 999, changePct: 999 },
					{ symbol: targetFund.holdings[1].symbol, price: 1610, previousClose: 1600, marketTime: Math.floor(1_786_700_000_000 / 1000), priceChange: 999, changePct: 999 },
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
				activeFund: { holdings: [verifiedHolding({ weight: 50, changePct: 2, price: 102, previousClose: 100 }), verifiedHolding({ weight: 30, changePct: -1, price: 99, previousClose: 100 }), { weight: 20, changePct: null }] },
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

	it("prefers freshly refreshed Yahoo holdings over an older standardized-return cache", async () => {
		const { component } = await loadFundPageComponent();
		const instance = {
			activeFundKey: "taiwanTechnology",
				activeFund: { holdings: [verifiedHolding({ weight: 50, changePct: -2, price: 98, previousClose: 100 }), verifiedHolding({ weight: 30, changePct: 1, price: 101, previousClose: 100 })] },
			activeQuote: { cacheMode: "remote", quotedCount: 2, quoteUpdatedAt: "2026 / 08 / 18 10:40" },
			holdingsSignalsByFund: {
				taiwanTechnology: { weightedChangePct: 9.99, fundContributionPct: 5.37, quoteUpdatedAt: "2026 / 08 / 18 10:36" },
			},
			...component.methods,
		};

		expect(component.computed.holdingsWeightedChangePct.call(instance)).toBeCloseTo(-0.875, 8);
		expect(component.computed.holdingsFundContributionPct.call(instance)).toBeCloseTo(-0.7, 8);
	});

	it("recalculates the contribution from a loaded Yahoo quote cache instead of retaining an older signal cache", async () => {
		const { component, storage } = await loadFundPageComponent();
		const state = component.data();
		const instance = { ...state, ...component.methods };
		const fundKey = "taiwanDaba";
		const targetFund = state.funds.find((fund: { key: string }) => fund.key === fundKey);
		const quoteCacheKey = instance.getFundStorageKey("quotes", fundKey);
		const signalCacheKey = instance.getFundStorageKey("holdings-signal", fundKey);

		storage.set(signalCacheKey, JSON.stringify({
			fundKey,
			holdingsDate: targetFund.holdingsDate,
			weightedChangePct: 8.88,
			fundContributionPct: 5.55,
			totalWeight: 58.5,
			quotedCount: 10,
			holdingsCount: 10,
			quoteUpdatedAt: "2026 / 08 / 19 09:00",
		}));
		storage.set(quoteCacheKey, JSON.stringify({
			fundKey,
			holdingsDate: targetFund.holdingsDate,
			quoteUpdatedAt: "2026 / 08 / 19 09:05",
			fetchedAt: 1_786_801_500_000,
			quotes: [
					{ symbol: targetFund.holdings[0].symbol, price: 6700, previousClose: 6600, marketTime: Math.floor(1_786_801_500_000 / 1000) },
					{ symbol: targetFund.holdings[1].symbol, price: 1568, previousClose: 1600, marketTime: Math.floor(1_786_801_500_000 / 1000) },
			],
		}));

		expect(instance.hydrateHoldingsSignalCache(fundKey)).toBe(true);
		expect(state.holdingsSignalsByFund[fundKey].fundContributionPct).toBe(5.55);
		expect(instance.hydrateYahooQuoteCache(fundKey)).toBe(true);

		const calculation = instance.calculateHoldingsWeightedChange(targetFund.holdings);
		expect(state.holdingsSignalsByFund[fundKey]).toMatchObject({
			fundContributionPct: calculation.fundContributionPct,
			weightedChangePct: calculation.weightedChangePct,
			quoteUpdatedAt: "2026 / 08 / 19 09:05",
			cacheMode: "local",
		});
		expect(state.holdingsSignalsByFund[fundKey].fundContributionPct).not.toBe(5.55);
		const rewrittenSignal = JSON.parse(storage.get(signalCacheKey) ?? "{}");
		expect(rewrittenSignal.fundContributionPct).toBeCloseTo(calculation.fundContributionPct, 8);
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

			targetFund.holdings = targetFund.holdings.map((holding: Record<string, unknown>) => {
				const price = Number(holding.price);
				const changePct = Number(holding.changePct);
				const previousClose = Number.isFinite(price) && Number.isFinite(changePct) && 100 + changePct !== 0 ? price / (1 + changePct / 100) : price;
				return verifiedHolding({ ...holding, previousClose });
			});
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

	it("synchronizes the refreshed Yahoo quote snapshot and fund NAV contribution in one update", async () => {
		const { component, storage } = await loadFundPageComponent();
		const state = component.data();
		const instance = { ...state, ...component.methods };
		const fundKey = "taiwanTechnology";
		const targetFund = state.funds.find((fund: { key: string }) => fund.key === fundKey);

			targetFund.holdings = targetFund.holdings.map((holding: { price: number; symbol: string; weight: number }, index: number) => ({
				...holding,
				price: 100 + index * 10,
				previousClose: 99 + index * 10,
				marketTime: Math.floor(1_786_750_500_000 / 1000),
				quoteFetchedAt: 1_786_750_500_000,
				quoteVerified: true,
				priceChange: 1,
			changePct: 1 / (99 + index * 10) * 100,
		}));
		state.quotesByFund[fundKey].quoteUpdatedAt = "2026 / 08 / 18 13:55";

		expect(instance.syncYahooQuoteAndHoldingsSignal(fundKey, 1_786_750_500_000, 10)).toBe(true);
		const calculation = instance.calculateHoldingsWeightedChange(targetFund.holdings);
		const signalSnapshot = JSON.parse(storage.get(instance.getFundStorageKey("holdings-signal", fundKey)) ?? "{}");

		expect(state.quotesByFund[fundKey]).toMatchObject({ quotedCount: 10, cacheMode: "remote" });
		expect(state.holdingsSignalsByFund[fundKey]).toMatchObject({
			fundContributionPct: calculation.fundContributionPct,
			weightedChangePct: calculation.weightedChangePct,
			quoteUpdatedAt: "2026 / 08 / 18 13:55",
			cacheMode: "remote",
		});
		expect(signalSnapshot).toMatchObject({
			fundKey,
			quotedCount: 10,
			fundContributionPct: calculation.fundContributionPct,
			quoteUpdatedAt: "2026 / 08 / 18 13:55",
		});
		expect(storage.get(instance.getFundStorageKey("quotes", fundKey))).toBeTruthy();
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
