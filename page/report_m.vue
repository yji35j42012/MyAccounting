<style scoped></style>

<template>
	<div class="report">
		<div class="content_h1" data-txt="掌握您的財務狀況">現金流儀表板</div>
		<div class="report_title">
			<button @click="report_prev">上個月</button>
			<span>{{ report_data.title }}</span>
			<button @click="report_next">下個月</button>
		</div>
		<div class="report_group">
			<div class="report_item _good">
				<div class="report_item_title">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="lucide lucide-trending-up w-4 h-4 text-emerald-500"
						data-loc="client/src/pages/Dashboard.tsx:158">
						<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
						<polyline points="16 7 22 7 22 13"></polyline>
					</svg>
					本月收入
				</div>
				<div class="report_item_amount" data-btxt="總收入">
					${{ showAccounting.month_in }}
				</div>
			</div>
			<div class="report_item _bad">
				<div class="report_item_title">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="lucide lucide-trending-down w-4 h-4 text-red-500"
						data-loc="client/src/pages/Dashboard.tsx:174">
						<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
						<polyline points="16 17 22 17 22 11"></polyline>
					</svg>
					本月支出
				</div>
				<div class="report_item_amount" data-btxt="總支出">
					${{ showAccounting.month_out }}
				</div>
			</div>
			<div :class="['report_item', showAccounting.total < 0 ? '_bad' : '_good']">
				<div class="report_item_title">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="lucide lucide-dollar-sign w-4 h-4 text-emerald-500"
						data-loc="client/src/pages/Dashboard.tsx:206">
						<line x1="12" x2="12" y1="2" y2="22"></line>
						<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
					</svg>
					淨現金流
				</div>
				<div class="report_item_amount _total" data-btxt="收入－支出">
					${{ showAccounting.total }}
				</div>
			</div>
		</div>
	</div>
</template>


<script>
module.exports = {
	data() {
		return {
			accounting_data: [],
			report_count: 0,
			report_data: {
				data: {},
				y: 0,
				m: 0,
				title: "",
			},

		};
	},
	mixins: [],
	components: {},
	mounted() {
		let objectDate = new Date();
		let year = objectDate.getFullYear()
		let month = objectDate.getMonth() + 1;
		this.report_data.y = year;
		this.report_data.m = objectDate.getMonth() + 1;
		this.report_data.title = year + "年" + month + "月";
		console.log('this.$store.state.AccData', this.$store.state.AccData);
		if (this.$store.state.AccData == null) {
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
			if (this.report_data.data.objList && this.report_data.data.objList[this.report_data.title]) {
				return this.report_data.data.objList[this.report_data.title];
			}
			return "1";
		}
	},
	methods: {
		report_prev() {
			if (this.report_data.m == 1) {
				this.report_data.m = 12;
				this.report_data.y--;
			} else {
				this.report_data.m--;
			}
			this.report_data.title = this.report_data.y + "年" + this.report_data.m + "月";

		},
		report_next() {
			if (this.report_data.m == 12) {
				this.report_data.m = 1;
				this.report_data.y++;
			} else {
				this.report_data.m++;
			}
			this.report_data.title = this.report_data.y + "年" + this.report_data.m + "月";
		},
		resetAccountingData(data) {
			let objData = {
				dateItem: [],
				objList: {},
			}
			data.forEach(item => {
				if (item[0] !== '') {
					const type = item[2];
					const amount = item[5];
					const date = item[1];
					var dateTitle = date.split(".")[0] + "年" + date.split(".")[1] + "月";

					if (!objData.dateItem.includes(dateTitle)) {
						objData.dateItem.push(dateTitle);
						objData.objList[dateTitle] = {
							month_in: type == "收入" ? amount : 0,
							month_out: type == "支出" ? amount : 0,
							total: type == "收入" ? amount : amount * -1,
						}
						// console.log(objData.objList[dateTitle].month_in);
					} else {
						objData.objList[dateTitle] = {
							month_in: type == "收入" ? objData.objList[dateTitle].month_in + amount : objData.objList[dateTitle].month_in,
							month_out: type == "支出" ? objData.objList[dateTitle].month_out + amount : objData.objList[dateTitle].month_out,
							total: type == "收入" ? objData.objList[dateTitle].total + amount : objData.objList[dateTitle].total + amount * -1,
						}
					}
				}
			});
			this.report_data.data = objData;
		},
	}
};
</script>