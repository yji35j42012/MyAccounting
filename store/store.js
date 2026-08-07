const store = new Vuex.Store({
	state: {
		showLoading: true,
		AccData: null,
	},
	getters: {},
	mutations: {
		SET_LOADING(state, boo) {
			state.showLoading = boo;
		},
		SET_ACCDATA(state, data) {
			state.AccData = data;
		},
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
		}
	}
});
