<style scoped></style>

<template>
	<div class="acc">
		<div class="content_h1" data-txt="管理您的所有交易">交易紀錄</div>
		<div class="filter normal_shadow">
			<div class="filter_title">篩選</div>
			<div class="filter_box ">
				<label class="normal_inp">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="lucide lucide-search absolute left-3 top-3 w-4 h-4 text-slate-400"
						data-loc="client/src/pages/Transactions.tsx:140">
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.3-4.3"></path>
					</svg>
					<input type="text" placeholder="搜尋分類、備註或金額..." />
				</label>
				<div class="normal_sel">
					<span class="normal_sel_txt">全部</span>
					<ul class="normal_sel_ul">
						<li class="normal_sel_li">全部</li>
						<li class="normal_sel_li">收入</li>
						<li class="normal_sel_li">支出</li>
					</ul>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="lucide lucide-chevron-down size-4 opacity-50"
						data-loc="client/src/components/ui/select.tsx:45" aria-hidden="true">
						<path d="m6 9 6 6 6-6"></path>
					</svg>
				</div>
			</div>
		</div>

		<div class="acc_lists normal_shadow">
			<div class="acc_lists_title" data-txt="5">
				交易列表 ({{this.accounting_data.length}})

				<button class="add_list">
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
						<tr v-for="(item, index) in this.accounting_data"
							:class="[item.accounting_type == '收入' ? 'income' : '']">
							<td>{{ item.accounting_date }}</td>
							<td><span class="type">{{ item.accounting_type }}</span></td>
							<td>{{ item.accounting_sort }}</td>
							<td class="acc">{{ item.accounting_acc }}</td>
							<td><span class="amont">{{ item.accounting_amount }}</span></td>
							<td>{{ item.accounting_remark }}</td>
							<td>
								<button class="normal_tb_edit">
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

		<div class="alert" style="display: none;">
			<div class="alert_box">
				<button class="alert_close">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
						class="lucide lucide-x" data-loc="client/src/components/ui/dialog.tsx:139">
						<path d="M18 6 6 18"></path>
						<path d="m6 6 12 12"></path>
					</svg>
				</button>
				<div class="alert_title">新增交易</div>
				<div class="alert_content">
					<div class="alert_content_item" data-txt="日期">
						<input type="date" class="alert_inp">
					</div>

					<div class="alert_content_item" data-txt="交易類型">
						<div class="normal_sel">
							<span class="normal_sel_txt">支出</span>
							<ul class="normal_sel_ul">
								<li class="normal_sel_li">收入</li>
								<li class="normal_sel_li">支出</li>
							</ul>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
								stroke-linejoin="round" class="lucide lucide-chevron-down size-4 opacity-50"
								data-loc="client/src/components/ui/select.tsx:45" aria-hidden="true">
								<path d="m6 9 6 6 6-6"></path>
							</svg>
						</div>
					</div>
					<div class="alert_content_item" data-txt="分類">
						<div class="normal_sel">
							<span class="normal_sel_txt">選擇分類</span>
							<ul class="normal_sel_ul">
								<li class="normal_sel_li">薪資</li>
								<li class="normal_sel_li">租金</li>
								<li class="normal_sel_li">餐飲</li>
								<li class="normal_sel_li">交通</li>
								<li class="normal_sel_li">娛樂</li>
							</ul>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
								stroke-linejoin="round" class="lucide lucide-chevron-down size-4 opacity-50"
								data-loc="client/src/components/ui/select.tsx:45" aria-hidden="true">
								<path d="m6 9 6 6 6-6"></path>
							</svg>
						</div>
					</div>
					<div class="alert_content_item" data-txt="金額">
						<input type="number" class="alert_inp" placeholder="0">
					</div>
					<div class="alert_content_item" data-txt="帳戶">
						<div class="normal_sel">
							<span class="normal_sel_txt">選擇帳戶</span>
							<ul class="normal_sel_ul">
								<li class="normal_sel_li">銀行(國泰)</li>
								<li class="normal_sel_li">信用卡(國泰)</li>
								<li class="normal_sel_li">信用卡(永豐)</li>
								<li class="normal_sel_li">銀行(永豐)</li>
							</ul>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
								stroke-linejoin="round" class="lucide lucide-chevron-down size-4 opacity-50"
								data-loc="client/src/components/ui/select.tsx:45" aria-hidden="true">
								<path d="m6 9 6 6 6-6"></path>
							</svg>
						</div>
					</div>
					<div class="alert_content_item" data-txt="備註(選填)">
						<textarea class="normal_textarea" placeholder="輸入備註..."></textarea>
					</div>

					<div class="alert_funcbox">
						<button class="normal_btn _secondary">取消</button>
						<button class="normal_btn _primary">新增</button>
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
			accounting_data: [],
			accounting_edit: {
				isShow: false,
				edit_state: "",
				edit_id: "",
				edit_date: "",
				edit_product: "",
				edit_amount: "",
				edit_mode: "",
			},
		};
	},
	mixins: [],
	components: {},
	mounted() {
		store.dispatch("SET_LOADING_ACTION", false);
		var get_url = url + "?func=getAccounting";
		axios.get(get_url).then(res => {
			this.resetAccountingData(res.data);
			store.dispatch("SET_LOADING_ACTION", false);
		});
	},
	computed: {
		// showAccounting() {
		// 	var rShow = this.accounting_data
		// 	if (!rShow) return
		// 	return rShow
		// }
	},
	methods: {
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
					// let dateTitle = element[1].split('.')[0] + "/" + element[1].split('.')[1]
					// if (objData.dateItem.indexOf(dateTitle) == -1) {
					// 	objData.dateItem.push(dateTitle)
					// 	objData.objList[dateTitle] = {
					// 		id: index,
					// 		// totalAmount: element[3],
					// 		lists: [{
					// 			accounting_id: element[0],
					// 			accounting_date: element[1],
					// 			accounting_type: element[2],
					// 			accounting_sort: element[3],
					// 			accounting_acc: element[4],
					// 			accounting_amount: element[5],
					// 			accounting_remark: element[6],
					// 		}]
					// 	}
					// } else {
					// 	objData.objList[dateTitle].totalAmount = objData.objList[dateTitle].totalAmount + element[3]
					// 	objData.objList[dateTitle].lists.push({
					// 		accounting_id: element[0],
					// 		accounting_date: element[1],
					// 		accounting_type: element[2],
					// 		accounting_sort: element[3],
					// 		accounting_acc: element[4],
					// 		accounting_amount: element[5],
					// 		accounting_remark: element[6],
					// 	});
					// }
				}
			});
			const reversed = [...data].reverse(); 
			this.accounting_data = [...objData].reverse()
			console.log('objData', objData);
		},
		// accountingChange() {
		// 	store.dispatch("SET_LOADING_ACTION", true);
		// 	this.accounting_edit.isShow = false;
		// 	var get_url = url +
		// 		"?func=updateAccounting&id=" + this.accounting_edit.edit_id +
		// 		"&date=" + this.accounting_edit.edit_date +
		// 		"&product=" + this.accounting_edit.edit_product +
		// 		"&amount=" + this.accounting_edit.edit_amount +
		// 		"&mode=" + this.accounting_edit.edit_mode;
		// 	axios.get(get_url).then(res => {
		// 		this.resetAccountingData(res.data);
		// 		setTimeout(() => {
		// 			this.clearEdit();
		// 			store.dispatch("SET_LOADING_ACTION", false);
		// 		}, 500);
		// 	});
		// },
		// accountingList(obj) {
		// 	console.log('accountingList', obj);
		// 	this.accounting_edit.edit_state = 'showEdit';
		// 	this.accounting_edit.edit_id = obj.accounting_id;
		// 	this.accounting_edit.edit_date = obj.accounting_date;
		// 	this.accounting_edit.edit_product = obj.accounting_product;
		// 	this.accounting_edit.edit_amount = obj.accounting_amount;
		// 	this.accounting_edit.edit_mode = obj.accounting_mode;
		// 	this.accounting_edit.isShow = true;
		// 	// accounting_id
		// },

		// accountingTitle(index) {
		// 	if (this.$refs['title_' + index][0].classList.contains('on')) {
		// 		this.$refs['title_' + index][0].classList.remove("on");
		// 	} else {
		// 		this.$refs['title_' + index][0].classList.add("on");
		// 	}
		// },
		// accountingEdit() {
		// 	this.accounting_edit.edit_date = this.getDate();
		// 	this.accounting_edit.edit_state = 'showAdd';
		// 	this.accounting_edit.isShow = true;
		// },
		// accountingSave() {
		// 	store.dispatch("SET_LOADING_ACTION", true);
		// 	this.accounting_edit.isShow = false;
		// 	var get_url = url +
		// 		"?func=setAccounting&date=" + this.accounting_edit.edit_date +
		// 		"&product=" + this.accounting_edit.edit_product +
		// 		"&amount=" + this.accounting_edit.edit_amount +
		// 		"&mode=" + this.accounting_edit.edit_mode;
		// 	axios.get(get_url).then(res => {
		// 		this.resetAccountingData(res.data);
		// 		setTimeout(() => {
		// 			this.clearEdit();
		// 			store.dispatch("SET_LOADING_ACTION", false);
		// 		}, 500);
		// 	});
		// },
		// clearEdit() {
		// 	this.accounting_edit.edit_state = "";
		// 	this.accounting_edit.edit_date = "";
		// 	this.accounting_edit.edit_product = "";
		// 	this.accounting_edit.edit_amount = "";
		// 	this.accounting_edit.edit_mode = "";
		// },
		// alertClose(s) {
		// 	switch (s) {
		// 		case 'accounting':
		// 			this.accounting_edit.isShow = false;
		// 			break;
		// 	}
		// },
		// getDate() {
		// 	let objectDate = new Date();
		// 	let day = objectDate.getDate();
		// 	let month = objectDate.getMonth() + 1;
		// 	let year = objectDate.getFullYear();
		// 	return year + "." + month + "." + day;
		// }
	},
};
</script>
