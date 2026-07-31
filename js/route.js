const routes=[
	{
		path: '/store',
		component: () => loadModule('./page/store.vue', options),
	},
	{
		path: '/',
		component: () => loadModule('./page/report_m.vue', options),
	},
	{
		path: '/acc',
		component: () => loadModule('./page/accounting.vue', options),
	},
];
const router=VueRouter.createRouter({
	history: VueRouter.createWebHistory('#'),
	routes
})