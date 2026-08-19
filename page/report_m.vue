<style scoped></style>

<template>
	<div class="report">
		<div class="content_h1" data-txt="掌握您的財務狀況">現金流儀表板</div>

		<section class="report_selector normal_shadow" aria-label="選擇報表類型">
			<button type="button" role="tab" :aria-selected="activeReportView === 'monthly'"
				:class="['report_selector_button', activeReportView === 'monthly' ? 'is-active' : '']"
				@click="setReportView('monthly')">
				<span>月報表</span>
				<small>依月份檢視收支</small>
			</button>
			<button type="button" role="tab" :aria-selected="activeReportView === 'annual'"
				:class="['report_selector_button', activeReportView === 'annual' ? 'is-active' : '']"
				@click="setReportView('annual')">
				<span>年報表</span>
				<small>全年彙總與月明細</small>
			</button>
		</section>

		<section v-if="activeReportView === 'monthly'" class="report_monthly" aria-labelledby="monthly-report-title">
			<div class="report_title">
				<button type="button" @click="report_prev">上個月</button>
				<span id="monthly-report-title">{{ report_data.title }}</span>
				<button type="button" @click="report_next">下個月</button>
			</div>
			<div class="report_group">
				<div class="report_item _good">
					<div class="report_item_title">本月收入</div>
					<div class="report_item_amount" data-btxt="總收入">${{ formatAmount(showAccounting.month_in) }}</div>
				</div>
				<div class="report_item _bad">
					<div class="report_item_title">本月支出</div>
					<div class="report_item_amount" data-btxt="總支出">${{ formatAmount(showAccounting.month_out) }}</div>
				</div>
				<div :class="['report_item', showAccounting.total < 0 ? '_bad' : '_good']">
					<div class="report_item_title">淨現金流</div>
					<div class="report_item_amount _total" data-btxt="收入－支出">${{ formatAmount(showAccounting.total) }}
					</div>
				</div>
			</div>
			<section class="report_category_expenses normal_shadow" aria-label="本月指定分類消費總額">
				<div class="report_category_expenses_head">
					<div>
						<p>本月分類支出</p>
						<h3>日常消費總額</h3>
					</div><span>餐飲、生活雜費、交通</span>
				</div>
				<div class="report_category_expenses_grid">
					<div v-for="item in monthlyCategoryExpenses" :key="item.category"
						class="report_category_expenses_item"><span>{{ item.category }}</span><strong>${{
				formatAmount(item.amount) }}</strong></div>
				</div>
			</section>
		</section>

		<section v-else class="report_annual normal_shadow" aria-labelledby="annual-report-title">
			<div class="report_annual_head">
				<div>
					<p class="report_annual_kicker">年度報表</p>
					<h2 id="annual-report-title">{{ annual_report.title }}</h2>
					<p>依目前交易資料彙總全年收入、支出與每月淨現金流。</p>
				</div>
				<div class="report_annual_controls" aria-label="切換年度">
					<button type="button" @click="annual_prev">上一年</button>
					<button type="button" @click="annual_next">下一年</button>
				</div>
			</div>

			<div class="report_group report_annual_summary">
				<div class="report_item _good">
					<div class="report_item_title">全年收入</div>
					<div class="report_item_amount" data-btxt="年度總收入">${{ formatAmount(showAnnualAccounting.year_in) }}
					</div>
				</div>
				<div class="report_item _bad">
					<div class="report_item_title">全年支出</div>
					<div class="report_item_amount" data-btxt="年度總支出">${{ formatAmount(showAnnualAccounting.year_out) }}
					</div>
				</div>
				<div :class="['report_item', showAnnualAccounting.total < 0 ? '_bad' : '_good']">
					<div class="report_item_title">全年淨現金流</div>
					<div class="report_item_amount _total" data-btxt="全年收入－支出">${{
				formatAmount(showAnnualAccounting.total) }}</div>
				</div>
			</div>

			<div class="report_annual_table_box">
				<table class="report_annual_table">
					<thead>
						<tr>
							<th>月份</th>
							<th>收入</th>
							<th>支出</th>
							<th>淨現金流</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in annualMonths" :key="item.month">
							<td>{{ item.month }} 月</td>
							<td class="report_annual_income">${{ formatAmount(item.month_in) }}</td>
							<td class="report_annual_expense">${{ formatAmount(item.month_out) }}</td>
							<td :class="item.total < 0 ? 'report_annual_expense' : 'report_annual_income'">${{
				formatAmount(item.total) }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>
	</div>
</template>

<script>
module.exports = {
	data() {
		return {
			report_data: { data: {}, y: 0, m: 0, title: "" },
			annual_report: { y: 0, title: "" },
			activeReportView: 'monthly'
		};
	},
	mounted() {
		const objectDate = new Date();
		const year = objectDate.getFullYear();
		const month = objectDate.getMonth() + 1;
		this.setReportMonth(year, month);
		this.setAnnualYear(year); if (this.$store.state.AccData == null) {
			var get_url = url + "?func=getAccounting";
			axios.get(get_url).then(res => {
				this.resetAccountingData(res.data);
			store.dispatch("SET_ACCDATA_ACTION", res.data);
				store.dispatch("SET_LOADING_ACTION", false);
			});
		} else {
			this.resetAccountingData(this.$store.state.AccData);
			store.dispatch("SET_LOADING_ACTION", false);
		}
	},
	computed: {
		showAccounting() {
			return this.report_data.data.objList?.[this.report_data.title] || this.createMonthlySummary(this.report_data.m);
		},
		showAnnualAccounting() {
			return this.report_data.data.yearList?.[this.annual_report.y] || this.createAnnualSummary(this.annual_report.y);
		},
		annualMonths() {
			return this.showAnnualAccounting.months;
		},
		monthlyCategoryExpenses() {
			const categoryExpenses = this.showAccounting.categoryExpenses || {};
			return ['餐飲', '生活雜費', '交通'].map(category => ({ category, amount: Number(categoryExpenses[category]) || 0 }));
		}
	},
	methods: {
		formatAmount(value) {
			return Number(value || 0).toLocaleString('en-US');
		},
		createMonthlySummary(month) {
			return { month: Number(month) || 0, month_in: 0, month_out: 0, total: 0, categoryExpenses: { '餐飲': 0, '生活雜費': 0, '交通': 0 } };
		},
		createAnnualSummary(year) {
			return {
				year: Number(year) || 0,
				year_in: 0,
				year_out: 0,
				total: 0,
				months: Array.from({ length: 12 }, (_, index) => this.createMonthlySummary(index + 1))
			};
		},
		setReportMonth(year, month) {
			this.report_data.y = year;
			this.report_data.m = month;
			this.report_data.title = year + "年" + month + "月";
		},
		setAnnualYear(year) {
			this.annual_report.y = year;
			this.annual_report.title = year + " 年度報表";
		},
		setReportView(view) {
			this.activeReportView = view === 'annual' ? 'annual' : 'monthly';
		},
		report_prev() {
			const year = this.report_data.m === 1 ? this.report_data.y - 1 : this.report_data.y;
			const month = this.report_data.m === 1 ? 12 : this.report_data.m - 1;
			this.setReportMonth(year, month);
		},
		report_next() {
			const year = this.report_data.m === 12 ? this.report_data.y + 1 : this.report_data.y;
			const month = this.report_data.m === 12 ? 1 : this.report_data.m + 1;
			this.setReportMonth(year, month);
		},
		annual_prev() {
			this.setAnnualYear(this.annual_report.y - 1);
		},
		annual_next() {
			this.setAnnualYear(this.annual_report.y + 1);
		},
		resetAccountingData(data) {
			const objData = { dateItem: [], objList: {}, yearList: {} };
			(data || []).forEach(item => {
				if (!item || item[0] === '') return;
				const type = item[2];
				const amount = Number(item[5]) || 0;
				const parts = String(item[1] || '').split('.');
				const year = Number(parts[0]);
				const month = Number(parts[1]);
				if (!Number.isInteger(year) || month < 1 || month > 12) return;

				const dateTitle = year + "年" + month + "月";
				if (!objData.dateItem.includes(dateTitle)) objData.dateItem.push(dateTitle);
				if (!objData.objList[dateTitle]) objData.objList[dateTitle] = this.createMonthlySummary(month);
				if (!objData.yearList[year]) objData.yearList[year] = this.createAnnualSummary(year);

				const monthData = objData.objList[dateTitle];
				const annualData = objData.yearList[year];
				const annualMonthData = annualData.months[month - 1];
				const isIncome = type === "收入";
				const cashflow = isIncome ? amount : -amount;

				if (isIncome) {
					monthData.month_in += amount;
					annualData.year_in += amount;
					annualMonthData.month_in += amount;
				} else if (type === "支出") {
					monthData.month_out += amount;
					annualData.year_out += amount;
					annualMonthData.month_out += amount;
					if (Object.prototype.hasOwnProperty.call(monthData.categoryExpenses, item[3])) monthData.categoryExpenses[item[3]] += amount;
				}
				monthData.total += cashflow;
				annualData.total += cashflow;
				annualMonthData.total += cashflow;
			});
			this.report_data.data = objData;
		}
	}
};
</script>
