<style scoped></style>

<template>
	<div class="acc">
		<div class="content_h1" data-txt="管理您的所有交易">交易紀錄</div>
		<div class="filter normal_shadow">
			<div class="filter_title">篩選</div>
			<div class="filter_box ">
				<sel-component :selType="this.sel_type_child" @sel-return="selTypeChild"></sel-component>
				<label class="normal_inp">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="lucide lucide-search absolute left-3 top-3 w-4 h-4 text-slate-400"
						data-loc="client/src/pages/Transactions.tsx:140">
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.3-4.3"></path>
					</svg>
					<input type="text" placeholder="搜尋分類、備註或金額..." v-model="this.sel_type_child.filter_inp" />
				</label>
			</div>
		</div>

		<div class="acc_lists normal_shadow">
			<div class="acc_lists_title" data-txt="5">
				交易列表 ({{ this.showAccounting.length }})
				<button class="add_list" @click="isShowAlert('add')">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="lucide lucide-plus w-5 h-5" data-loc="client/src/pages/Transactions.tsx:118">
						<path d="M5 12h14"></path>
						<path d="M12 5v14"></path>
					</svg>
					新增交易
				</button>
			</div>
			<div class="normal_tb_box">
				<table class="normal_tb">
					<thead>
						<tr>
							<th>日期</th>
							<th>類型</th>
							<th>分類</th>
							<th>帳戶</th>
							<th>金額</th>
							<th>備註</th>
							<th>操作</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item, index) in this.showAccounting"
							:class="[item.accounting_type == '收入' ? 'income' : '']">
							<td>{{ item.accounting_date }}</td>
							<td><span class="type">{{ item.accounting_type }}</span></td>
							<td>{{ item.accounting_sort }}</td>
							<td class="acc">{{ item.accounting_acc }}</td>
							<td><span class="amont">{{ item.accounting_amount }}</span></td>
							<td>{{ item.accounting_remark }}</td>
							<td>
								<button class="normal_tb_edit" @click="isShowAlert('edit', item)">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
										fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
										stroke-linejoin="round" class="lucide lucide-pen w-4 h-4"
										data-loc="client/src/pages/Transactions.tsx:215">
										<path
											d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z">
										</path>
									</svg>
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<div id="alert" :class="['alert', this.alertData.class]">
			<div class="alert_box">
				<button class="alert_close" @click="(isShowAlert(''))">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="lucide lucide-x" data-loc="client/src/components/ui/dialog.tsx:139">
						<path d="M18 6 6 18"></path>
						<path d="m6 6 12 12"></path>
					</svg>
				</button>
				<div class="alert_title" @click="">
					<span class="acc_edit _new" v-if="this.alertData.class == 'showAdd'">新增交易</span>
					<span class="acc_edit _edit" v-if="this.alertData.class == 'showEdit'">編輯交易</span>
				</div>
				<div class="alert_content">
					<div class="alert_content_item" data-txt="日期">
						<input type="text" class="normal_inp" @click="showCalendar"
							v-model="this.accounting_edit.edit_date">
						<calendar-component v-if="calendar_data.isShow" :calendarDate="this.calendar_data.date"
							@calendar-return="calendarHandler"></calendar-component>
					</div>

					<div class="alert_content_item" data-txt="交易類型">
						<sel-component :selType="this.sel_alert_type" @sel-return="selAlertType"></sel-component>
					</div>
					<div class="alert_content_item" data-txt="分類">
						<sel-component :selType="this.sel_alert_sort" @sel-return="selAlertSort"></sel-component>
					</div>
					<div class="alert_content_item" data-txt="金額">
						<input type="number" class="alert_inp" placeholder="0" v-model="accounting_edit.edit_amount">
					</div>
					<div class="alert_content_item" data-txt="帳戶">
						<sel-component :selType="this.sel_alert_acc" @sel-return="selAlertAcc"></sel-component>
					</div>
					<div class="alert_content_item" data-txt="備註(選填)">
						<textarea class="normal_textarea" placeholder="輸入備註..."
							v-model="accounting_edit.edit_remark"></textarea>
					</div>

					<div class="alert_funcbox">
						<button class="normal_btn _secondary" @click="(isShowAlert(''))">取消</button>
						<button class="normal_btn _primary" @click="accountingChange"
							v-if="this.alertData.class == 'showEdit'">更新</button>
						<button class="normal_btn _primary" @click="accountingSave"
							v-if="this.alertData.class == 'showAdd'">新增</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
module.exports = {
	data() {
		return {
			calendar_data: {
				isShow: false,
				date: "",
			},
			accounting_data: [],
			accounting_edit: {
				edit_id: 0,
				edit_date: "",
				edit_type: "支出",
				edit_sort: "選擇分類",
				edit_amount: 0,
				edit_acc: "選擇帳戶",
				edit_remark: ""
			},
			sel_type_child: {
				selText: "全部",
				lists: ["全部", "收入", "支出"],
				filter: "全部",
				filter_inp: "",
			},
			sel_alert_type: {
				selText: "支出",
				lists: ["收入", "支出"]
			},
			sel_alert_sort: {
				selText: "餐飲",
				lists: ["餐飲", "薪資", "租金", "貸款", "投資", "生活雜費", "小孩雜費", "交通", "保險費", "娛樂", "獎金"],
			},
			sel_alert_acc: {
				selText: "信用卡(永豐)",
				lists: ["信用卡(永豐)", "信用卡(國泰)", "銀行(國泰)", "銀行(永豐)"],
			},
			alertData: {
				class: "",
			}
		};
	},
	mixins: [],
	components: {
		'sel-component': Vue.defineAsyncComponent(() => loadModule('./components/SelComponent.vue', options)),
		'calendar-component': Vue.defineAsyncComponent(() => loadModule('./components/CalendarComponent.vue', options)),
	},
	mounted() {
		var get_url = url + "?func=getAccounting";
		axios.get(get_url).then(res => {
			this.resetAccountingData(res.data);
			store.dispatch("SET_ACCDATA_ACTION", res.data);
			store.dispatch("SET_LOADING_ACTION", false);
		});

	},
	computed: {
		showAccounting() {
			var rShow = [];
			if (this.sel_type_child.selText == "全部") {
				rShow = this.accounting_data;
			} else {
				this.accounting_data.forEach(item => {
					if (item.accounting_type == this.sel_type_child.selText) {
						rShow.push(item);
					}
				});
			}
			if (this.sel_type_child.filter_inp !== "") {
				var filter = [];
				// sort amount acc remark
				rShow.forEach(item => {
					if (item.accounting_sort.indexOf(this.sel_type_child.filter_inp) !== -1 ||
						item.accounting_acc.indexOf(this.sel_type_child.filter_inp) !== -1 ||
						item.accounting_remark.indexOf(this.sel_type_child.filter_inp) !== -1 ||
						item.accounting_amount.toString().indexOf(this.sel_type_child.filter_inp) !== -1
					) {
						filter.push(item);
						return filter;
					}
				});
				rShow = filter;
			}
			if (!rShow) return;
			return rShow;
		}
	},
	methods: {
		calendarHandler(data) {
			this.calendar_data.isShow = false;
			this.accounting_edit.edit_date = data.y + "." + data.m + "." + data.d;
		},
		showCalendar() {
			this.calendar_data.isShow = !this.calendar_data.isShow;
			this.calendar_data.date = this.accounting_edit.edit_date
		},
		selTypeChild(data) {
			this.sel_type_child.selText = data;
		},
		selAlertType(data) {
			this.sel_alert_type.selText = data;
			this.accounting_edit.edit_type = data;
		},
		selAlertSort(data) {
			this.sel_alert_sort.selText = data;
			this.accounting_edit.edit_sort = data;
		},
		selAlertAcc(data) {
			this.sel_alert_acc.selText = data;
			this.accounting_edit.edit_acc = data;
		},
		resetAccountingData(data) {
			let objData = []
			data.forEach((element, index) => {
				if (element[0] !== '') {
					objData.push({
						accounting_id: element[0],
						accounting_date: element[1],
						accounting_type: element[2],
						accounting_sort: element[3],
						accounting_acc: element[4],
						accounting_amount: element[5],
						accounting_remark: element[6],
					});
				}
			});
			const reversed = [...data].reverse();
			this.accounting_data = [...objData].reverse();
		},
		isShowAlert(s, item) {
			if (s == "") {
				this.alertData.class = "";
				return;
			}
			this.calendar_data.isShow = false
			if (s == "add") {
				this.alertData.class = "showAdd";
				this.accounting_edit.edit_date = this.getDate();
				this.calendar_data.date = this.getDate();
			} else if (s == "edit") {
				this.sel_alert_acc.selText = item.accounting_acc;
				this.sel_alert_type.selText = item.accounting_type;
				this.sel_alert_sort.selText = item.accounting_sort;
				this.alertData.class = "showEdit";
				this.calendar_data.date = this.accounting_edit.edit_date;
				this.accounting_edit.edit_id = item.accounting_id;
				this.accounting_edit.edit_date = item.accounting_date;
				this.accounting_edit.edit_type = item.accounting_type;
				this.accounting_edit.edit_sort = item.accounting_sort;
				this.accounting_edit.edit_amount = item.accounting_amount;
				this.accounting_edit.edit_acc = item.accounting_acc;
				this.accounting_edit.edit_remark = item.accounting_remark;
			}
		},
		accountingSave() {
			store.dispatch("SET_LOADING_ACTION", true);
			this.accounting_edit.isShow = false;
			var get_url = url +
				"?func=setAccounting&date=" + this.accounting_edit.edit_date +
				"&type=" + this.accounting_edit.edit_type +
				"&sort=" + this.accounting_edit.edit_sort +
				"&amount=" + this.accounting_edit.edit_amount +
				"&acc=" + this.accounting_edit.edit_acc +
				"&remark=" + this.accounting_edit.edit_remark;
			this.alertData.class = "";
			axios.get(get_url).then(res => {
				this.resetAccountingData(res.data);
				setTimeout(() => {
					this.clearEdit();
					store.dispatch("SET_LOADING_ACTION", false);
				}, 500);
			});
		},
		accountingChange() {
			store.dispatch("SET_LOADING_ACTION", true);
			var get_url = url +
				"?func=updateAccounting&id=" + this.accounting_edit.edit_id +
				"&date=" + this.accounting_edit.edit_date +
				"&type=" + this.accounting_edit.edit_type +
				"&sort=" + this.accounting_edit.edit_sort +
				"&amount=" + this.accounting_edit.edit_amount +
				"&acc=" + this.accounting_edit.edit_acc +
				"&remark=" + this.accounting_edit.edit_remark;
			this.alertData.class = "";
			axios.get(get_url).then(res => {
				this.resetAccountingData(res.data);
				setTimeout(() => {
					this.clearEdit();
					store.dispatch("SET_LOADING_ACTION", false);
				}, 500);
			});
		},
		accountingList(obj) {
			this.accounting_edit.edit_state = 'showEdit';
			this.accounting_edit.edit_id = obj.accounting_id;
			this.accounting_edit.edit_date = obj.accounting_date;
			this.accounting_edit.edit_product = obj.accounting_product;
			this.accounting_edit.edit_amount = obj.accounting_amount;
			this.accounting_edit.edit_mode = obj.accounting_mode;
			this.accounting_edit.isShow = true;
			// accounting_id
		},
		clearEdit() {
			this.accounting_edit.edit_id = "";
			this.accounting_edit.edit_date = "";
			this.accounting_edit.edit_type = "支出";
			this.accounting_edit.edit_sort = "選擇分類";
			this.accounting_edit.edit_amount = 0;
			this.accounting_edit.edit_acc = "選擇帳戶";
			this.accounting_edit.edit_remark = "";
		},
		alertClose(s) {
			switch (s) {
				case 'accounting':
					this.accounting_edit.isShow = false;
					break;
			}
		},
		getDate() {
			let objectDate = new Date();
			let day = objectDate.getDate();
			let month = objectDate.getMonth() + 1;
			let year = objectDate.getFullYear();
			return year + "." + month + "." + day;
		}
	},
};
</script>
