import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

type Transaction = [number, string, string, string, string, number, string];

async function loadReportComponent() {
	const source = await readFile(new URL('../page/report_m.vue', import.meta.url), 'utf8');
	const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
	if (!script) throw new Error('找不到儀表板腳本');

	const context = { module: { exports: {} as Record<string, unknown> } };
	vm.runInNewContext(script, context, { filename: 'report_m.vue' });
	return { source, component: context.module.exports as any };
}

const fixture: Transaction[] = [
	[2, '2026.1.11', '支出', '餐飲', '刷卡(永豐)', 252, '熊貓-麥當勞'],
	[3, '2026.2.11', '收入', '薪資', '現金', 1000, '薪資'],
	[4, '2026.6.12', '支出', '餐飲', '刷卡(永豐)', 168, '午餐熊貓-飯飯'],
	[5, '2026.6.12', '支出', '餐飲', '刷卡(永豐)', 168, '午餐熊貓-飯飯'],
	[6, '2026.12.12', '支出', '餐飲', '刷卡(永豐)', 168, '午餐熊貓-飯飯']
];

describe('儀表板年報表', () => {
	it('按年度彙總收入、支出、淨現金流，並保留空月份', async () => {
		const { source, component } = await loadReportComponent();
		const state = component.data();
		const instance = { ...state, ...component.methods };

		instance.resetAccountingData(fixture);
		instance.setAnnualYear(2026);
		const annual = instance.report_data.data.yearList[2026];

		expect(source).toContain('年度報表');
		expect(source).toContain('yearList');
		expect(annual).toMatchObject({ year: 2026, year_in: 1000, year_out: 756, total: 244 });
		expect(annual.months).toHaveLength(12);
		expect(annual.months[0]).toMatchObject({ month: 1, month_out: 252, total: -252 });
		expect(annual.months[1]).toMatchObject({ month: 2, month_in: 1000, total: 1000 });
		expect(annual.months[5]).toMatchObject({ month: 6, month_out: 336, total: -336 });
		expect(annual.months[7]).toMatchObject({ month: 8, month_in: 0, month_out: 0, total: 0 });
		expect(annual.months[11]).toMatchObject({ month: 12, month_out: 168, total: -168 });
		expect(instance.annual_report).toMatchObject({ y: 2026, title: '2026 年度報表' });
	});

	it('年度切換能往前與往後移動，且沒有交易的年度保持零值', async () => {
		const { component } = await loadReportComponent();
		const state = component.data();
		const instance = { ...state, ...component.methods };

		instance.resetAccountingData(fixture);
		instance.setAnnualYear(2026);
		instance.annual_prev();
		expect(instance.annual_report).toMatchObject({ y: 2025, title: '2025 年度報表' });
		const emptyAnnual = component.computed.showAnnualAccounting.call(instance);
		expect(emptyAnnual).toMatchObject({ year: 2025, year_in: 0, year_out: 0, total: 0 });
		expect(emptyAnnual.months).toHaveLength(12);
		instance.annual_next();
		expect(instance.annual_report.y).toBe(2026);
	});

	it('以月報表與年報表頁籤切換時保留各自的彙總與控制狀態', async () => {
		const { source, component } = await loadReportComponent();
		const state = component.data();
		const instance = { ...state, ...component.methods };

		instance.resetAccountingData(fixture);
		instance.setReportMonth(2026, 6);
		instance.setAnnualYear(2026);

		expect(source).toContain("activeReportView === 'monthly'");
		expect(source).toContain("activeReportView === 'annual'");
		expect(source).toContain("setReportView('monthly')");
		expect(source).toContain("setReportView('annual')");
		expect(instance.activeReportView).toBe('monthly');
		expect(component.computed.showAccounting.call(instance)).toMatchObject({ month: 6, month_out: 336, total: -336 });

		instance.setReportView('annual');
		expect(instance.activeReportView).toBe('annual');
		expect(component.computed.showAnnualAccounting.call(instance)).toMatchObject({ year: 2026, year_out: 756, total: 244 });

		instance.setReportView('unexpected');
		expect(instance.activeReportView).toBe('monthly');
		expect(component.computed.showAccounting.call(instance)).toMatchObject({ month: 6, month_out: 336, total: -336 });
	});

	it('月報表與年報表會彙總餐飲、生活雜費、交通與投資的分類支出', async () => {
		const { source, component } = await loadReportComponent();
		const state = component.data();
		const instance = { ...state, ...component.methods };
		const categoryFixture: Transaction[] = [
			[1, '2026.8.05', '收入', '薪資', '轉帳', 58400, '八月薪資'],
			[2, '2026.8.13', '支出', '餐飲', '刷卡', 920, '午餐聚會'], [3, '2026.8.16', '支出', '餐飲', '刷卡', 380, '咖啡與點心'],
			[4, '2026.8.19', '支出', '生活雜費', '現金', 1260, '超市採買'], [5, '2026.8.21', '支出', '生活雜費', '刷卡', 560, '家用清潔品'],
			[6, '2026.8.24', '支出', '交通', '悠遊卡', 220, '捷運儲值'], [7, '2026.8.27', '支出', '交通', '刷卡', 1260, '高鐵車票'],
			[8, '2026.8.11', '支出', '投資', '轉帳', 9500, '基金定期定額'], [9, '2026.6.11', '支出', '投資', '轉帳', 9200, '基金定期定額']
		];

		instance.resetAccountingData(categoryFixture);
		instance.setReportMonth(2026, 8);
		const monthly = component.computed.showAccounting.call(instance);
		instance.showAccounting = monthly;

		expect(source).toContain('monthlyCategoryExpenses');
		expect(source).toContain('annualCategoryExpenses');
		expect(source).toContain('本月分類支出');
		expect(source).toContain('全年分類支出');
		expect(monthly.categoryExpenses).toEqual({ '餐飲': 1300, '生活雜費': 1820, '交通': 1480, '投資': 9500 });
		expect(component.computed.monthlyCategoryExpenses.call(instance)).toEqual([
			{ category: '餐飲', amount: 1300 }, { category: '生活雜費', amount: 1820 }, { category: '交通', amount: 1480 }, { category: '投資', amount: 9500 }
		]);
		instance.setAnnualYear(2026);
		instance.showAnnualAccounting = component.computed.showAnnualAccounting.call(instance);
		expect(component.computed.annualCategoryExpenses.call(instance)).toEqual([
			{ category: '餐飲', amount: 1300 }, { category: '生活雜費', amount: 1820 }, { category: '交通', amount: 1480 }, { category: '投資', amount: 18700 }
		]);
	});
});
