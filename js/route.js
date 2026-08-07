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
];
const router = VueRouter.createRouter({
	history: VueRouter.createWebHistory('#'),
	routes
})