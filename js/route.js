const routes = [
	{
		path: '/',
		component: () => loadModule('./page/accounting.vue', options),
	},
	{
		path: '/acc',
		component: () => loadModule('./page/accounting.vue', options),
	},
	{
		path: '/store',
		component: () => loadModule('./page/store.vue', options),
	},
	{
		path: '/report',
		component: () => loadModule('./page/report_m.vue', options),
	},
	{
		path: '/fund',
		component: () => loadModule('./page/fund_analysis.vue', options),
	},
];
const router = VueRouter.createRouter({
	history: VueRouter.createWebHistory('#'),
	routes
})