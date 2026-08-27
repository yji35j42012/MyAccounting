<template>
	<div class="auth_panel" aria-live="polite">
		<span v-if="loading" class="auth_panel_status">驗證中</span>
		<template v-else-if="session && session.user">
			<span class="auth_user_email" :title="session.user.email || '已登入'">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
					stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M20 21a8 8 0 0 0-16 0"></path>
					<circle cx="12" cy="7" r="4"></circle>
				</svg>
				{{ session.user.email || '已登入' }}
			</span>
			<button class="auth_logout_button" type="button" @click="signOut" :disabled="signingOut">
				{{ signingOut ? '登出中' : '登出' }}
			</button>
		</template>
		<router-link v-else class="nav_link auth_login_link" to="/login">
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
				stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
				<path d="M10 17l5-5-5-5"></path>
				<path d="M15 12H3"></path>
			</svg>
			登入
		</router-link>
	</div>
</template>

<script>
module.exports = {
	data() {
		return {
			session: null,
			loading: true,
			signingOut: false,
		};
	},
	mounted() {
		this.authChangeHandler = (event) => {
			this.session = event.detail?.session || null;
			this.loading = false;
		};
		window.addEventListener('cashflow-auth-change', this.authChangeHandler);
		this.restoreSession();
	},
	beforeUnmount() {
		window.removeEventListener('cashflow-auth-change', this.authChangeHandler);
	},
	methods: {
		async restoreSession() {
			try {
				const auth = window.CASHFLOW_SUPABASE_AUTH;
				auth.subscribe();
				this.session = await auth.getSession();
			} catch (error) {
				console.warn('[現金流管理] 無法恢復登入工作階段。', error?.message || error);
				this.session = null;
			} finally {
				this.loading = false;
			}
		},
		async signOut() {
			this.signingOut = true;
			try {
				const { error } = await window.CASHFLOW_SUPABASE_AUTH.getClient().auth.signOut();
				if (error) throw error;
				this.session = null;
				if (this.$route.path === '/login') this.$router.replace('/');
			} catch (error) {
				window.alert(`登出失敗：${error?.message || '請稍後再試。'}`);
			} finally {
				this.signingOut = false;
			}
		},
	},
};
</script>
