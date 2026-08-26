const FUND_ANALYSIS_COMPONENT_VERSION = 'fund-analysis-v1.5.40-2026.08.20';
const FUND_PURCHASE_COMPONENT_VERSION = 'fund-purchase-v1.0.6-2026.08.25';
const REPORT_COMPONENT_VERSION = 'report-v1.0.4-2026.08.26';

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
		component: () => loadModule(`./page/report_m.vue?v=${ REPORT_COMPONENT_VERSION }`, options),
	},
	{
		path: '/fund',
		component: () => loadModule(`./page/fund_analysis.vue?v=${ FUND_ANALYSIS_COMPONENT_VERSION }`, options),
	},
	{
		path: '/fund-purchase',
		component: () => loadModule(`./page/fund_purchase.vue?v=${ FUND_PURCHASE_COMPONENT_VERSION }`, options),
	},
];
const router = VueRouter.createRouter({
	history: VueRouter.createWebHistory('#'),
	routes
})
