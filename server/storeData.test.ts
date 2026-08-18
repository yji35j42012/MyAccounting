import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Transaction = [number, string, string, string, string, number, string];

function loadAccData(): Transaction[] {
	const source = readFileSync(resolve(import.meta.dirname, '..', 'store', 'store.js'), 'utf8');
	const Vuex = {
		Store: function Store(options: { state: { AccData: Transaction[] } }) {
			return options;
		}
	};
	return new Function('Vuex', `${source}; return store.state.AccData;`)(Vuex) as Transaction[];
}

describe('Vuex AccData 預設交易資料', () => {
	it('保留使用者指定的十四筆 2026 年餐飲支出', () => {
		const records = loadAccData();

		expect(records).toHaveLength(14);
		expect(records.map(([id]) => id)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
		expect(records[0]).toEqual([2, '2026.1.11', '支出', '餐飲', '刷卡(永豐)', 252, '熊貓-麥當勞']);
		expect(records.at(-1)).toEqual([15, '2026.12.12', '支出', '餐飲', '刷卡(永豐)', 168, '午餐熊貓-飯飯']);
		expect(records.filter(([, date]) => date === '2026.7.12')).toHaveLength(2);
		expect(records.filter(([, date]) => date === '2026.6.12')).toHaveLength(2);
		expect(records.reduce((total, [, , , , , amount]) => total + amount, 0)).toBe(2520);
	});
});
