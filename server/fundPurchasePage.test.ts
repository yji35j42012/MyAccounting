import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

function loadFundData() {
  const source = readFileSync(resolve(import.meta.dirname, '..', 'store', 'store.js'), 'utf8');
  const Vuex = { Store: function Store(options: { state: { FundData: Record<string, unknown[]> } }) { return options; } };
  return new Function('Vuex', `${source}; return store.state.FundData;`)(Vuex) as Record<string, any[]>;
}

async function loadPurchasePageComponent() {
  const source = await readFile(new URL("../page/fund_purchase.vue", import.meta.url), "utf8");
  const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  if (!script) throw new Error("找不到基金申購紀錄頁腳本");

  const storage = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, String(value)),
  };
  const context = { module: { exports: {} as Record<string, unknown> }, window: {}, localStorage, Intl, Date };
  vm.runInNewContext(script, context);
  return { source, component: context.module.exports as any, storage };
}

function buildInstance(component: any) {
  const state = component.data();
  const fundData = loadFundData();
  const commits: Array<{ type: string; payload: any }> = [];
  const commit = (type: string, payload: any) => {
    commits.push({ type, payload });
    const records = fundData[payload.fundKey];
    if (type === 'ADD_FUND_PURCHASE_RECORD') records.unshift(payload.record);
    if (type === 'UPDATE_FUND_PURCHASE_RECORD') {
      const index = records.findIndex((record: any) => String(record.id) === String(payload.record.id));
      if (index >= 0) records.splice(index, 1, payload.record);
    }
  };
  const instance = { ...state, ...component.methods, $store: { state: { FundData: fundData }, commit }, commits } as any;
  Object.defineProperty(instance, "activeFund", { get: () => component.computed.activeFund.call(instance) });
  Object.defineProperty(instance, "activePurchaseRecords", { get: () => component.computed.activePurchaseRecords.call(instance) });
  Object.defineProperty(instance, "visiblePurchaseRecords", { get: () => component.computed.visiblePurchaseRecords.call(instance) });
  Object.defineProperty(instance, "recordsByFund", { get: () => component.computed.recordsByFund.call(instance) });
  return instance;
}

describe("基金申購紀錄頁", () => {
  it("uses the fund-analysis-style selector and reads the selected fund's purchase records from Vuex FundData", async () => {
    const { source } = await loadPurchasePageComponent();

    expect(source).toContain("一鍵重整四檔基金資料");
    expect(source).toContain("store.dispatch('SET_LOADING_ACTION', false);");
    expect(source).toContain('class="fund_selector fund_purchase_page_selector normal_shadow"');
    expect(source).toContain('role="tablist" aria-label="選擇基金申購紀錄"');
    expect(source).toContain('@click="selectFund(fund.key)"');
	    expect(source).toContain('v-for="record in visiblePurchaseRecords"');
	    expect(source).toContain('四檔基金合計總損益');
	    expect(source).toContain('{{ activeFund.name }}總損益');
	    expect(source).toContain('目前基金待補資料');
	    expect(source).toContain('待補資料');
	    expect(source).toContain('＋ 新增申購紀錄');
	    expect(source).toContain('編輯這筆紀錄');
	    expect(source).toContain("openPurchaseModal('add')");
	    expect(source).toContain("openPurchaseModal('edit', record)");
	    expect(source).toContain('僅顯示待補資料');
	    expect(source).toContain('v-model="purchaseModal.form.date"');
	    expect(source).toContain('v-model="purchaseModal.form.principal"');
	    expect(source).toContain('v-model="purchaseModal.form.subscriptionNav"');
	    expect(source).toContain('v-model="purchaseModal.form.units"');
	    expect(source).toContain('@submit.prevent="savePurchaseRecord"');
    expect(source).toContain("日期</th><th>投入本金</th><th>申購淨值</th><th>庫存單位數</th><th>市值</th><th>報酬率</th><th>損益");
    expect(source).toContain('this.$store?.state?.FundData?.[fundKey]');
    expect(source).not.toContain('const PURCHASE_RECORDS =');
    expect(source).not.toContain('purchaseRecords: PURCHASE_RECORDS');
  });

  it("switches the active fund and calculates only that fund's Vuex records from its latest NAV", async () => {
    const { component } = await loadPurchasePageComponent();
    const instance = buildInstance(component);

    const technologyRecords = component.computed.activePurchaseRecords.call(instance);
    expect(instance.activeFund.key).toBe("taiwanTechnology");
    expect(technologyRecords).toHaveLength(21);
	    expect(technologyRecords[0].marketValue).toBeNull();
	    expect(technologyRecords[0].profitLoss).toBeNull();
	    expect(technologyRecords[0].isIncomplete).toBe(true);
	    expect(component.computed.activeIncompleteRecordCount.call(instance)).toBe(1);
	    expect(technologyRecords[1].marketValue).toBeCloseTo(13.3 * instance.activeFund.nav);

    component.methods.selectFund.call(instance, "fuhwaOmni");
    const fuhwaRecords = component.computed.activePurchaseRecords.call(instance);
    expect(instance.activeFund.key).toBe("fuhwaOmni");
    expect(fuhwaRecords).toHaveLength(10);
    expect(fuhwaRecords[0].marketValue).toBeNull();
    expect(fuhwaRecords[1].marketValue).toBeCloseTo(51.4 * instance.activeFund.nav);
	    expect(fuhwaRecords[1].profitLoss).toBeCloseTo((51.4 * instance.activeFund.nav) - 10000);
	    expect(fuhwaRecords[1].returnPct).toBeCloseTo((((51.4 * instance.activeFund.nav) - 10000) / 10000) * 100);

	    component.methods.selectFund.call(instance, "taiwanDaba");
	    const dabaRecords = component.computed.activePurchaseRecords.call(instance);
	    expect(dabaRecords).toHaveLength(8);
	    expect(dabaRecords[0].marketValue).toBeNull();
	    expect(dabaRecords[0].profitLoss).toBeNull();
	    expect(dabaRecords[0].isIncomplete).toBe(true);
	    expect(component.computed.activeIncompleteRecordCount.call(instance)).toBe(1);
	    expect(dabaRecords[1].marketValue).toBeCloseTo(31.9 * instance.activeFund.nav);
	    const partiallyMissing = component.methods.calculateRecord.call(instance, { principal: 5000, subscriptionNav: '', units: 10 }, instance.activeFund.nav);
	    expect(partiallyMissing.isIncomplete).toBe(true);
	    expect(partiallyMissing.marketValue).toBeNull();
    expect(component.methods.formatSignedTwd(-1250)).toBe("-TWD 1,250");
  });

  it("opens add and edit modals, writes Vuex records, and filters incomplete records without affecting fund totals", async () => {
    const { component } = await loadPurchasePageComponent();
    const instance = buildInstance(component);

    component.methods.openPurchaseModal.call(instance, 'add');
    expect(instance.purchaseModal.mode).toBe('add');
    expect(instance.purchaseModal.form.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    instance.purchaseModal.form = { date: '2026-08-26', principal: '12000', subscriptionNav: '', units: '' };
    component.methods.savePurchaseRecord.call(instance);
    expect(instance.commits.at(-1)?.type).toBe('ADD_FUND_PURCHASE_RECORD');
    expect(instance.$store.state.FundData.taiwanTechnology[0]).toMatchObject({ date: '2026.08.26', principal: 12000, subscriptionNav: '', units: '' });
    expect(component.computed.activeIncompleteRecordCount.call(instance)).toBe(2);

    instance.showOnlyIncomplete = true;
    expect(instance.visiblePurchaseRecords).toHaveLength(2);
    expect(instance.visiblePurchaseRecords.every((record: any) => record.isIncomplete)).toBe(true);

    const existing = instance.$store.state.FundData.taiwanTechnology[0];
    component.methods.openPurchaseModal.call(instance, 'edit', existing);
    expect(instance.purchaseModal.mode).toBe('edit');
    expect(instance.purchaseModal.form.principal).toBe(12000);
    instance.purchaseModal.form.subscriptionNav = '750.1';
    instance.purchaseModal.form.units = '16';
    component.methods.savePurchaseRecord.call(instance);
    expect(instance.commits.at(-1)?.type).toBe('UPDATE_FUND_PURCHASE_RECORD');
    expect(instance.$store.state.FundData.taiwanTechnology[0]).toMatchObject({ subscriptionNav: 750.1, units: 16 });
    expect(component.computed.activeIncompleteRecordCount.call(instance)).toBe(1);
    expect(instance.visiblePurchaseRecords).toHaveLength(1);
  });

  it("calculates selected-fund and four-fund totals from the same store records while excluding incomplete rows", async () => {
    const { component } = await loadPurchasePageComponent();
    const instance = buildInstance(component);

    const selectedTotal = component.computed.activeFundProfitLoss.call(instance);
    const allFundsTotal = component.computed.allFundsProfitLoss.call(instance);
    const expectedSelectedTotal = instance.activePurchaseRecords.reduce((sum: number, record: { profitLoss: number | null }) => sum + (record.profitLoss ?? 0), 0);
    const expectedAllFundsTotal = instance.recordsByFund.flatMap((fund: { records: Array<{ profitLoss: number | null }> }) => fund.records).reduce((sum: number, record: { profitLoss: number | null }) => sum + (record.profitLoss ?? 0), 0);

    expect(selectedTotal).toBeCloseTo(expectedSelectedTotal);
    expect(allFundsTotal).toBeCloseTo(expectedAllFundsTotal);
    component.methods.selectFund.call(instance, "taiwanIntelligence");
    expect(component.computed.activeFundProfitLoss.call(instance)).not.toBeCloseTo(selectedTotal);
    expect(component.computed.allFundsProfitLoss.call(instance)).toBeCloseTo(expectedAllFundsTotal);
  });

  it("runs all four NAV refreshes together and keeps failed funds' previous values", async () => {
    const { component } = await loadPurchasePageComponent();
    const state = component.data();
    const refreshed: Array<[string, boolean]> = [];
    const instance = {
      ...state,
      ...component.methods,
      refreshFundNav: async (fundKey: string, force: boolean) => {
        refreshed.push([fundKey, force]);
        return fundKey !== "fuhwaOmni";
      },
    };

    await component.methods.refreshAllFunds.call(instance, true);

    expect(refreshed).toHaveLength(4);
    expect(refreshed).toEqual([
      ["taiwanTechnology", true], ["taiwanDaba", true], ["taiwanIntelligence", true], ["fuhwaOmni", true],
    ]);
    expect(instance.refreshHasError).toBe(true);
    expect(instance.refreshSummary).toContain("1 檔基金更新失敗");
  });
});
