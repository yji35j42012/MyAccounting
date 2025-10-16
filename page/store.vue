<style scoped></style>

<template>
	<div class="funcBox">
		<button class="normal_btn" @click="accountingEdit()">新增</button>
	</div>
	<div class="content">
		<div class="accounting">
			<template v-for="(outsideItem, index) in showAccounting.objList" :key="index">
				<div class="accounting_title on" @click="accountingTitle(outsideItem.id)"
					:ref="'title_' + outsideItem.id">
					{{ index }}
					<span class="accounting_title_total">{{ outsideItem.totalAmount }}</span>
				</div>
				<div class="accounting_group">
					<div class="accounting_group_title">
						<div class="accounting_span1">消費日期</div>
						<div class="accounting_span2">消費項目</div>
						<div class="accounting_span3">消費金額</div>
					</div>
					<template v-for="(insideItem, index) in outsideItem.lists" :key="index">
						<div class="accounting_group_list" @click="accountingList(insideItem)">
							<div class="accounting_span1">{{ insideItem.accounting_date }}</div>
							<div class="accounting_span2">{{ insideItem.accounting_product }}</div>
							<div class="accounting_span3">{{ insideItem.accounting_amount }}</div>
						</div>
					</template>
				</div>
			</template>
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
				edit_state: '',
				edit_id: "",
				edit_date: "",
				edit_product: "",
				edit_amount: "",
				edit_mode: "",
			}
		};
	},
	mixins: [],
	components: {},
	mounted() {
		var get_url = url + "?func=getAccounting";

		// axios.get(get_url).then(res => {
		// 	this.resetAccountingData(res.data);
		store.dispatch("SET_LOADING_ACTION", false);
		// });
	},
	computed: {
		showAccounting() {
			console.log('this.accounting_data', this.accounting_data);
			var rShow = this.accounting_data
			if (!rShow) return
			return rShow
		}
	},
	methods: {
		accountingChange() {
			// console.log('hihi', this.accounting_edit);
			// store.dispatch("SET_LOADING_ACTION", true);
			// this.accounting_edit.isShow=false;
			// var get_url=url+
			// 	"?func=updateAccounting&id="+this.accounting_edit.edit_id+
			// 	"&date="+this.accounting_edit.edit_date+
			// 	"&product="+this.accounting_edit.edit_product+
			// 	"&amount="+this.accounting_edit.edit_amount+
			// 	"&mode="+this.accounting_edit.edit_mode;
			// axios.get(get_url).then(res => {
			// 	this.resetAccountingData(res.data);
			// 	setTimeout(() => {
			// 		this.clearEdit();
			// 		store.dispatch("SET_LOADING_ACTION", false);
			// 	}, 500);
			// });
		},
		accountingList(obj) {
			// console.log('accountingList', obj);
			// this.accounting_edit.edit_state='showEdit';
			// this.accounting_edit.edit_id=obj.accounting_id;
			// this.accounting_edit.edit_date=obj.accounting_date;
			// this.accounting_edit.edit_product=obj.accounting_product;
			// this.accounting_edit.edit_amount=obj.accounting_amount;
			// this.accounting_edit.edit_mode=obj.accounting_mode;
			// this.accounting_edit.isShow=true;
			// accounting_id
		},
		resetAccountingData(data) {
			// let objData={
			// 	dateItem: [],
			// 	objList: {},
			// }
			// data.forEach((element, index) => {
			// 	if (element[0]!=='') {
			// 		let dateTitle=element[1].split('/')[0]+"/"+element[1].split('/')[1]
			// 		if (objData.dateItem.indexOf(dateTitle)==-1) {
			// 			objData.dateItem.push(dateTitle)
			// 			objData.objList[dateTitle]={
			// 				id: index,
			// 				totalAmount: element[3],
			// 				lists: [{
			// 					accounting_id: element[0],
			// 					accounting_date: element[1],
			// 					accounting_product: element[2],
			// 					accounting_amount: element[3],
			// 					accounting_mode: element[4],
			// 				}]
			// 			}
			// 		} else {
			// 			objData.objList[dateTitle].totalAmount=objData.objList[dateTitle].totalAmount+element[3]
			// 			objData.objList[dateTitle].lists.push({
			// 				accounting_id: element[0],
			// 				accounting_date: element[1],
			// 				accounting_product: element[2],
			// 				accounting_amount: element[3],
			// 				accounting_mode: element[4],
			// 			});
			// 		}
			// 	}
			// });
			// this.accounting_data=objData
		},
		accountingTitle(index) {
			if (this.$refs['title_' + index][0].classList.contains('on')) {
				this.$refs['title_' + index][0].classList.remove("on");
			} else {
				this.$refs['title_' + index][0].classList.add("on");
			}
		},
		accountingEdit() {
			this.accounting_edit.edit_date = this.getDate();
			this.accounting_edit.edit_state = 'showAdd';
			this.accounting_edit.isShow = true;
		},
		accountingSave() {
			store.dispatch("SET_LOADING_ACTION", true);
			this.accounting_edit.isShow = false;
			var get_url = url +
				"?func=setAccounting&date=" + this.accounting_edit.edit_date +
				"&product=" + this.accounting_edit.edit_product +
				"&amount=" + this.accounting_edit.edit_amount +
				"&mode=" + this.accounting_edit.edit_mode;
			axios.get(get_url).then(res => {
				this.resetAccountingData(res.data);
				setTimeout(() => {
					this.clearEdit();
					store.dispatch("SET_LOADING_ACTION", false);
				}, 500);
			});
		},
		clearEdit() {
			this.accounting_edit.edit_state = "";
			this.accounting_edit.edit_date = "";
			this.accounting_edit.edit_product = "";
			this.accounting_edit.edit_amount = "";
			this.accounting_edit.edit_mode = "";
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
			return year + "/" + month + "/" + day;
		}
	}
};
</script>