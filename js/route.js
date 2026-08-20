const FUND_ANALYSIS_COMPONENT_VERSION = 'fund-analysis-v1.5.32-2026.08.20';

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
		component: () => loadModule(`./page/fund_analysis.vue?v=${FUND_ANALYSIS_COMPONENT_VERSION}`, options),
	},
];
const router = VueRouter.createRouter({
	history: VueRouter.createWebHistory('#'),
	routes
})
