const routes=[
	{
		path: '/',
		component: () => loadModule('./page/store.vue', options),
	},
	{
		path: '/acc',
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