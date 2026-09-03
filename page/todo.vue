<style scoped></style>

<template>
	<div>
		<h1>待辦事項</h1>

		<form @submit.prevent="addTodo">
			<input v-model="newTitle" type="text" placeholder="輸入待辦事項" required />
			<button type="submit">新增</button>
		</form>

		<p v-if="loading">資料載入中……</p>
		<p v-if="errorMessage" style="color: red;">
			{{ errorMessage }}
		</p>

		<ul>
			<li v-for="todo in todos" :key="todo.id">
				{{ todo.title }}
				<button @click="deleteTodo(todo.id)">刪除</button>
			</li>
		</ul>
	</div>
</template>


<script>
module.exports = {
	data() {
		return {
			todos: [],
			newTitle: '',
			loading: false,
			errorMessage: ''
		};
	},
	mixins: [],
	components: {},
	mounted() {
		store.dispatch("SET_LOADING_ACTION", false);
		this.loadTodos()
	},
	computed: {
	},
	methods: {
		async loadTodos() {
			(function () {
				'use strict'
				const SUPABASE_URL = 'https://zojzhbwwqrsuvpvjomwy.supabase.co'
				const SUPABASE_ANON_KEY = 'sb_publishable_JEwm1VmdMqi_N-2QyMGEFA_YkH7cVeX'
				console.log('[Supabase] SDK =', window.supabase)
				if (!window.supabase) {
					console.error('[Supabase] SDK 尚未載入')
					return
				}
				window.supabaseClient = window.supabase.createClient(
					SUPABASE_URL,
					SUPABASE_ANON_KEY
				)
				console.log('[Supabase] Client 已建立 =', window.supabaseClient)
			})()

			this.loading = true
			this.errorMessage = ''

			const client = window.supabaseClient
			if (!client) {
				this.errorMessage = 'Supabase client 尚未初始化'
				this.loading = false
				return
			}
			const { data, error } = await client
				.from('todos')
				.select('*')
				.order('created_at', { ascending: false });

			console.log('data', data);



			if (error) {
				console.error('讀取資料失敗：', error)
				this.errorMessage = error.message
			} else {
				this.todos = data || []
			}
			this.loading = false
		}
	}
};
</script>