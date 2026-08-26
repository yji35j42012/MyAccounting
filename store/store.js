const store = new Vuex.Store({
	state: {
		showLoading: true,
		AccData: null,
		FundData: {
			taiwanTechnology: [
				{
					id: 2,
					date: "2026.08.25",
					principal: 5000,
					subscriptionNav: "",
					units: ""
				},
				{
					id: 3,
					date: "2026.08.19",
					principal: 10000,
					subscriptionNav: 749.9,
					units: 13.3
				},
				{
					id: 4,
					date: "2026.08.18",
					principal: 50000,
					subscriptionNav: 767.15,
					units: 65.2
				},
				{
					id: 5,
					date: "2026.08.17",
					principal: 10000,
					subscriptionNav: 786.71,
					units: 12.7
				},
				{
					id: 6,
					date: "2026.08.14",
					principal: 10000,
					subscriptionNav: 789.99,
					units: 12.7
				},
				{
					id: 7,
					date: "2026.08.07",
					principal: 10000,
					subscriptionNav: 734.24,
					units: 13.6
				},
				{
					id: 8,
					date: "2026.07.31",
					principal: 20000,
					subscriptionNav: 651.99,
					units: 30.7
				},
				{
					id: 9,
					date: "2026.07.29",
					principal: 10000,
					subscriptionNav: 602.3,
					units: 16.6
				},
				{
					id: 10,
					date: "2026.07.28",
					principal: 3000,
					subscriptionNav: 647.05,
					units: 4.6
				},
				{
					id: 11,
					date: "2026.07.17",
					principal: 5000,
					subscriptionNav: 687.61,
					units: 7.3
				},
				{
					id: 12,
					date: "2026.07.08",
					principal: 10000,
					subscriptionNav: 783.5,
					units: 12.8
				},
				{
					id: 13,
					date: "2026.07.07",
					principal: 5000,
					subscriptionNav: 783.77,
					units: 6.4
				},
				{
					id: 14,
					date: "2026.06.30",
					principal: 5000,
					subscriptionNav: 833.51,
					units: 6
				},
				{
					id: 15,
					date: "2026.06.26",
					principal: 10000,
					subscriptionNav: 807.82,
					units: 12.4
				},
				{
					id: 16,
					date: "2026.06.24",
					principal: 30000,
					subscriptionNav: 861.27,
					units: 34.8
				},
				{
					id: 17,
					date: "2026.06.17",
					principal: 10000,
					subscriptionNav: 834.36,
					units: 12
				},
				{
					id: 18,
					date: "2026.06.10",
					principal: 10000,
					subscriptionNav: 751.12,
					units: 13.3
				},
				{
					id: 19,
					date: "2026.06.09",
					principal: 10000,
					subscriptionNav: 788,
					units: 12.7
				},
				{
					id: 20,
					date: "2026.06.08",
					principal: 10000,
					subscriptionNav: 756.14,
					units: 13.2
				},
				{
					id: 21,
					date: "2026.06.03",
					principal: 1000000,
					subscriptionNav: 814.95,
					units: 1227.1
				},
				{
					id: 22,
					date: "2026.05.19",
					principal: 18000,
					subscriptionNav: 710.63,
					units: 25.3
				}
			],
			taiwanDaba: [
				{ id: '2', date: '2026.08.25', principal: 5000, subscriptionNav: "", units:"" },
				{ id: '3', date: '2026.08.11', principal: 10000, subscriptionNav: 313.43, units: 31.9 },
				{ id: '4', date: '2026.08.06', principal: 3000, subscriptionNav: 311.29, units: 9.7 },
				{ id: '5', date: '2026.07.31', principal: 3000, subscriptionNav: 268.54, units: 11.2 },
				{ id: '6', date: '2026.06.30', principal: 3000, subscriptionNav: 333.2, units: 9 },
				{ id: '7', date: '2026.06.03', principal: 40000, subscriptionNav: 334.56, units: 119.6 },
				{ id: '8', date: '2026.05.28', principal: 70000, subscriptionNav: 331.64, units: 211.1 },
				{ id: '9', date: '2026.05.28', principal: 33000, subscriptionNav: 336.82, units: 98 }
			],
			taiwanIntelligence: [
				{
					id: 2,
					date: "2026.08.14",
					principal: 200000,
					subscriptionNav: 424.42,
					units: 471.2
				},
				{
					id: 3,
					date: "2026.08.11",
					principal: 10000,
					subscriptionNav: 409.63,
					units: 24.4
				},
				{
					id: 4,
					date: "2026.06.22",
					principal: 100000,
					subscriptionNav: 462.9,
					units: 216
				}
			],
		    fuhwaOmni: [
				{
					id: 2,
					date: "2026.08.25",
					principal: 5000,
					subscriptionNav: "",
					units: ""
				},
				{
					id: 3,
					date: "2026.08.19",
					principal: 10000,
					subscriptionNav: 194.63,
					units: 51.4
				},
				{
					id: 4,
					date: "2026.08.18",
					principal: 50000,
					subscriptionNav: 199.42,
					units: 250.47
				},
				{
					id: 5,
					date: "2026.08.14",
					principal: 10000,
					subscriptionNav: 201.51,
					units: 49.6
				},
				{
					id: 6,
					date: "2026.08.07",
					principal: 10000,
					subscriptionNav: 184.73,
					units: 54.1
				},
				{
					id: 7,
					date: "2026.07.31",
					principal: 20000,
					subscriptionNav: 163.64,
					units: 122.2
				},
				{
					id: 8,
					date: "2026.07.29",
					principal: 10000,
					subscriptionNav: 150.64,
					units: 66.4
				},
				{
					id: 9,
					date: "2026.07.28",
					principal: 3000,
					subscriptionNav: 161.98,
					units: 18.5
				},
				{
					id: 10,
					date: "2026.07.17",
					principal: 5000,
					subscriptionNav: 174.61,
					units: 28.6
				},
				{
					id: 11,
					date: "2026.07.07",
					principal: 5000,
					subscriptionNav: 195.81,
					units: 25.5
				}
			],
		},
	},
	getters: {},
	mutations: {
		SET_LOADING(state, boo) {
			state.showLoading = boo;
		},
		SET_ACCDATA(state, data) {
			state.AccData = data;
		},
		SET_FUNDDATA(state,data){
			state.FundData = data;
		}
	},
	actions: {
		SET_LOADING_ACTION({ commit }, boo) {
			if (boo) {
				commit("SET_LOADING", boo);
			} else {
				setTimeout(() => {
					commit("SET_LOADING", boo);
				}, 500);
			}
		},
		SET_ACCDATA_ACTION({ commit }, data) {
			commit("SET_ACCDATA", data);
		},
		SET_FUND_ACTION({commit},data){
			commit("SET_FUNDDATA", data);
		}
	},
});
