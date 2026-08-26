import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Transaction = [number, string, string, string, string, number, string];
type FundPurchaseRecord = {
  id: number | string;
  date: string;
  principal: number;
  subscriptionNav: number | '';
  units: number | '';
};
type StoreState = {
  AccData: Transaction[];
  FundData: Record<string, FundPurchaseRecord[]>;
};

function loadStore() {
  const source = readFileSync(resolve(import.meta.dirname, '..', 'store', 'store.js'), 'utf8');
  const Vuex = {
    Store: function Store(options: { state: StoreState; mutations: Record<string, Function> }) {
      return options;
    }
  };
  return new Function('Vuex', `${source}; return store;`)(Vuex) as { state: StoreState; mutations: Record<string, Function> };
}

function loadStoreState(): StoreState {
  return loadStore().state;
}

describe('Vuex 預設資料', () => {
  it('提供跨十二個月、涵蓋指定分類的隨機化 2026 年交易資料', () => {
    const records = loadStoreState().AccData;

    expect(records).toHaveLength(55);
    expect(records.map(([id]) => id)).toEqual(Array.from({ length: 55 }, (_, index) => index + 1));
    expect(new Set(records.map(([, date]) => Number(date.split('.')[1]))).size).toBe(12);
    expect([...new Set(records.map(([, , , category]) => category))].sort()).toEqual(['交通', '保險費', '娛樂', '小孩雜費', '投資', '生活雜費', '租金', '獎金', '薪資', '貸款', '餐飲'].sort());
    expect(records.filter(([, , type]) => type === '收入')).not.toHaveLength(0);
    expect(records.filter(([, , type]) => type === '支出')).not.toHaveLength(0);
    expect(records.filter(([, date]) => date.startsWith('2026.8.'))).toHaveLength(11);
  });

  it('將使用者提供的四檔基金申購紀錄儲存在 FundData，並保留尚待補齊的申購欄位', () => {
    const fundData = loadStoreState().FundData;

    expect(Object.keys(fundData).sort()).toEqual(['fuhwaOmni', 'taiwanDaba', 'taiwanIntelligence', 'taiwanTechnology']);
    expect(fundData.taiwanTechnology).toHaveLength(21);
    expect(fundData.taiwanDaba).toHaveLength(8);
    expect(fundData.taiwanIntelligence).toHaveLength(3);
    expect(fundData.fuhwaOmni).toHaveLength(10);
	    expect(fundData.taiwanTechnology[0]).toMatchObject({ id: 2, date: '2026.08.25', principal: 5000, subscriptionNav: '', units: '' });
	    expect(fundData.taiwanTechnology.at(-1)).toMatchObject({ id: 22, principal: 18000, subscriptionNav: 710.63, units: 25.3 });
	    expect(fundData.taiwanDaba[0]).toMatchObject({ id: '2', date: '2026.08.25', principal: 5000, subscriptionNav: '', units: '' });
	    expect(fundData.taiwanDaba[1]).toMatchObject({ id: '3', date: '2026.08.11', principal: 10000, subscriptionNav: 313.43, units: 31.9 });
	    expect(fundData.taiwanIntelligence[0]).toMatchObject({ id: 2, date: '2026.08.14', principal: 200000, subscriptionNav: 424.42, units: 471.2 });
	    expect(fundData.fuhwaOmni[0]).toMatchObject({ id: 2, date: '2026.08.25', principal: 5000, subscriptionNav: '', units: '' });
	    const indexSource = readFileSync(resolve(import.meta.dirname, '..', 'index.html'), 'utf8');
	    expect(indexSource).toContain('<script src="./store/store.js?v=fund-data-v1.0.3-2026.08.25"></script>');
	  });

  it('以 FundData mutations 新增或更新目前基金的申購紀錄', () => {
    const store = loadStore();
    const record = { id: '23', date: '2026.08.26', principal: 12000, subscriptionNav: '', units: '' };

    store.mutations.ADD_FUND_PURCHASE_RECORD(store.state, { fundKey: 'taiwanTechnology', record });
    expect(store.state.FundData.taiwanTechnology[0]).toEqual(record);

    const updated = { ...record, subscriptionNav: 750.1, units: 16 };
    store.mutations.UPDATE_FUND_PURCHASE_RECORD(store.state, { fundKey: 'taiwanTechnology', record: updated });
    expect(store.state.FundData.taiwanTechnology[0]).toEqual(updated);
    expect(store.state.FundData.taiwanTechnology).toHaveLength(22);
  });
});
