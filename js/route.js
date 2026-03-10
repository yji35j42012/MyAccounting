const routes=[
	{
		path: '/store',
		component: () => loadModule('./page/store.vue', options),
	},
	{
		path: '/',
		component: () => loadModule('./page/accounting.vue', options),
	},
	{
		path: '/news',
		component: () => loadModule('./page/news.vue', options),
	},
];
const router=VueRouter.createRouter({
	history: VueRouter.createWebHistory('#'),
	routes
})