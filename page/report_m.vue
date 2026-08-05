<style scoped></style>

<template>
	<div class="acc">
		<div class="content_h1" data-txt="掌握您的財務狀況">現金流儀表板</div>
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
				edit_mode: ""
			}
		};
	},
	mixins: [],
	components: {},
	mounted() {
		store.dispatch("SET_LOADING_ACTION", false);
		// var get_url = url + "?func=getAccounting";
		// axios.get(get_url).then(res => {
		// 	this.resetAccountingData(res.data);
		// 	store.dispatch("SET_LOADING_ACTION", false);
		// });
	},
	computed: {
		// showAccounting() {
		// 	console.log('this.accounting_data', this.accounting_data);
		// 	var rShow = this.accounting_data
		// 	if (!rShow) return
		// 	return rShow
		// }
	},
	methods: {
		// accountingChange() {
		// 	console.log('hihi', this.accounting_edit);
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
		// resetAccountingData(data) {
		// 	let objData = {
		// 		dateItem: [],
		// 		objList: {},
		// 	}
		// 	// console.log('data', data);
		// 	data.forEach((element, index) => {
		// 		if (element[0] !== '') {
		// 			console.log('element[1]', element[1]);
		// 			let dateTitle = element[1].split('.')[0] + "/" + element[1].split('.')[1]
		// 			if (objData.dateItem.indexOf(dateTitle) == -1) {
		// 				objData.dateItem.push(dateTitle)
		// 				objData.objList[dateTitle] = {
		// 					id: index,
		// 					totalAmount: element[3],
		// 					lists: [{
		// 						accounting_id: element[0],
		// 						accounting_date: element[1],
		// 						accounting_product: element[2],
		// 						accounting_amount: element[3],
		// 						accounting_mode: element[4],
		// 					}]
		// 				}
		// 			} else {
		// 				objData.objList[dateTitle].totalAmount = objData.objList[dateTitle].totalAmount + element[3]
		// 				objData.objList[dateTitle].lists.push({
		// 					accounting_id: element[0],
		// 					accounting_date: element[1],
		// 					accounting_product: element[2],
		// 					accounting_amount: element[3],
		// 					accounting_mode: element[4],
		// 				});
		// 			}
		// 		}
		// 	});
		// 	this.accounting_data = objData
		// 	console.log('objData', objData);
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
	}
};
</script>