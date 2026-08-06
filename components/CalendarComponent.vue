<style scoped></style>

<template>
	<div class="calendar">
		<div class="calendar_head">
			<span id="prev" class="material-icons calendar_head_prev" @click="prevMonth">
				arrow_back_ios
			</span>
			<div class="calendar_head_info">
				<div id="month" class="month">
					{{ calendar.monthName[calendar.month.search] }}
				</div>
				<div id="year" class="year">
					{{ calendar.year.search }}
				</div>
			</div>
			<span id="next" class="material-icons calendar_head_next" @click="nextMonth">
				arrow_forward_ios
			</span>
		</div>
		<div class="calendar_body">
			<table>
				<tr>
					<th>一</th>
					<th>二</th>
					<th>三</th>
					<th>四</th>
					<th>五</th>
					<th>六</th>
					<th>日</th>
				</tr>
				<tr v-for="(item, index) in calendar_list">
					<td v-for="(itemTd, i) in item" @click="dayChange(itemTd.year, itemTd.month, itemTd.day)"
						:name="itemTd.month == calendar.month.search + 1 ? 'calendar_td' : 'other' + itemTd.day"
						:data-y="itemTd.year" :data-m="itemTd.month" :data-d="itemTd.day">
						{{ itemTd.day }}
					</td>
				</tr>
			</table>

			<!-- {{calendar_list}} -->
		</div>
	</div>
</template>


<script>
module.exports = {
	data() {
		return {
			calendar: {
				show: false,
				olympic: [
					31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
				],
				normal: [
					31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
				],
				monthName: [
					"一月", "二月", "三月", "四月", "五月", "六月",
					"七月", "八月", "九月", "十月", "十一月", "十二月",
				],
				year: {
					now: null,
					chose: null,
					search: null,
				},
				month: {
					chose: null,
					search: null,
				},
				day: {
					chose: null,
					search: null,
				},
				showDate: {
					start: null,
					end: null,
				},
				showTd: [],
				mList: [],
			},
		};
	},
	props: {
		calendarDate: {
			type: String
		},
	},
	components: {},
	mounted() {
		// var my_date = new Date();
		// var my_year = this.calendarDate.split('.')[0];
		// var my_month =  this.calendarDate.split('.')[1];
		// var my_day =  this.calendarDate.split('.')[2];
		// let calendar = this.calendar;
		// calendar.showDate.start =
		// 	my_year + "." + (my_month + 1) + "." + my_day;
		// calendar.showDate.end =
		// 	my_year + "." + (my_month + 1) + "." + my_day;
		this.showCalendar();
	},
	computed: {
		calendar_list() {
			return this.calendar.showTd;
		},
	},
	methods: {
		// 顯示日曆
		showCalendar(str) {
			this.calendar.showTd = [];
			var searchYear = this.calendarDate.split(".")[0];
			var searchMonth = this.calendarDate.split(".")[1];
			var searchDay = this.calendarDate.split(".")[2];
			this.calendar.year.chose = searchYear;
			this.calendar.month.chose = searchMonth;
			this.calendar.day.chose = searchDay;

			this.refreshDate(
				parseInt(searchYear),
				parseInt(searchMonth)
			);
		},
		//日曆模組
		refreshDate(searchYear, searchMonth) {
			this.calendar.year.search = searchYear;
			this.calendar.month.search = searchMonth - 1;

			var lastTotalDay = this.daysTotal(
				searchYear,
				searchMonth - 1 < 0 ? 0 : searchMonth - 1
			); //上月總天數

			var totalDay = this.daysTotal(
				searchYear,
				searchMonth - 1
			); //當月總天數
			var firstDay = this.dayStart(
				searchYear,
				searchMonth - 1
			); //當月第一天星期幾
			var count = 0;
			// 第一天前
			for (var i = 1; i < firstDay; i++) {
				count++;
				this.calendar.mList.push({
					year:
						searchMonth == 0
							? parseInt(searchYear) - 1
							: searchYear,
					month:
						searchMonth - 1 < 0 ? 11 : searchMonth - 1,
					day: lastTotalDay - firstDay + i + 1,
				});
			}
			// 本月份
			for (var i = 1; i <= totalDay; i++) {
				if (count == 7) {
					count = 0;
					this.calendar.showTd.push(this.calendar.mList);
					this.calendar.mList = [];
				}
				count++;
				this.calendar.mList.push({
					year: searchYear,
					month: searchMonth,
					day: i,
				});
			}
			var lastDay = count;
			// 補齊後面天數
			if (count <= 7) {
				for (let i = 1; i < 8 - lastDay; i++) {
					this.calendar.mList.push({
						year:
							searchMonth == 11
								? parseInt(searchYear) + 1
								: searchYear,
						month:
							searchMonth + 1 == 12
								? "0"
								: searchMonth + 1,
						day: i,
					});
					count++;
				}
			}
			this.calendar.showTd.push(this.calendar.mList);
			this.calendar.mList = [];
			if (
				this.calendar.year.chose == searchYear &&
				this.calendar.month.chose == searchMonth
			) {
				setTimeout(() => {
					var chose = document.querySelectorAll(
						'[name="calendar_td"]'
					);
					chose[
						this.calendar.day.chose - 1
					].classList.add("chose");
					this.calendar.mList = [];
				}, 10);
			} else {
				var chose = document.querySelectorAll(
					'[name="calendar_td"]'
				);
				for (let i = 0; i < chose.length; i++) {
					chose[i].classList.remove("chose");
				}
			}
		},
		// 查訊月份總天數計算
		daysTotal(year, month) {
			var tmp = year % 4;
			if (tmp == 0) {
				return this.calendar.olympic[month];
			} else {
				return this.calendar.normal[month];
			}
		},
		// 當月第一天星期幾
		dayStart(year, month) {
			var tmpDate = new Date(year, month, 1);
			return tmpDate.getDay();
		},
		dayChange(year, month, day) {
			this.calendar.year.chose = year;
			this.calendar.month.chose = month;
			this.calendar.day.chose = day;
			this.calendar.year.search = year;
			this.calendar.month.search = parseInt(month);
			this.calendar.month.str = this.calendar.monthName[month];
			// month = parseInt(month) + 1;
			if (month == 0) {
				month = 12;
			} else if (month == 13) {
				month = 1;
			}

			this.$emit('calendar-return', { y: year, m: month, d: day });
		},
		// 上一個月
		prevMonth() {
			this.calendar.showTd = [];
			var searchYear = this.calendar.year;
			var searchMonth = this.calendar.month;
			if (searchMonth.search == 0) {
				searchYear.search--;
				searchMonth.search = 11;
			} else {
				searchMonth.search--;
			}
			// searchMonth.str = this.calendar.monthName[searchM.search];
			this.refreshDate(
				searchYear.search,
				searchMonth.search + 1
			);
		},
		// 下一個月
		nextMonth() {
			this.calendar.showTd = [];
			var searchYear = this.calendar.year;
			var searchMonth = this.calendar.month;
			if (searchMonth.search == 11) {
				searchYear.search++;
				searchMonth.search = 0;
			} else {
				searchMonth.search++;
			}
			// searchM.str = this.calendar.monthName[searchM.search];
			this.refreshDate(
				searchYear.search,
				searchMonth.search + 1
			);
		},
	}
};
</script>
