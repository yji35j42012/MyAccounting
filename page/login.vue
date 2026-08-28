<template>
	<section class="auth_page" aria-labelledby="auth_page_title">
		<div class="auth_card">
			<p class="auth_eyebrow">Supabase Auth</p>
			<h2 id="auth_page_title">{{ session ? '帳號已登入' : mode === 'login' ? '登入現金流管理' : '建立安全帳號' }}</h2>
			<p class="auth_intro">
				{{ session ? '目前登入狀態會保留在此瀏覽器；日後連接的個人資料將以帳號工作階段與資料庫規則保護。' : '使用 Email 與密碼登入。驗證信會寄到你的信箱，不會在 GitHub Pages
			或程式碼中儲存密碼。' }}
			</p>

			<div v-if="statusMessage" class="auth_notice" role="status">{{ statusMessage }}</div>
			<div v-if="errorMessage" class="auth_error" role="alert">{{ errorMessage }}</div>
			<button v-if="errorMessage && !session" type="button" class="auth_text_button auth_retry_button"
				:disabled="busy" @click="retryConnection">
				重新連線登入服務
			</button>

			<div v-if="session" class="auth_signed_in">
				<strong>{{ session.user.email || '已登入' }}</strong>
				<span>驗證工作階段已由 Supabase 管理。</span>
				<router-link class="auth_primary_button" to="/">回到交易列表</router-link>
			</div>

			<form v-else class="auth_form" @submit.prevent="submit">
				<label class="auth_field">
					<span>Email</span>
					<input v-model.trim="email" type="email" autocomplete="email" inputmode="email" required
						placeholder="name@example.com" :disabled="busy">
				</label>
				<label class="auth_field">
					<span>密碼</span>
					<input v-model="password" type="password"
						:autocomplete="mode === 'login' ? 'current-password' : 'new-password'" minlength="8" required
						placeholder="至少 8 個字元" :disabled="busy">
				</label>
				<button class="auth_primary_button" type="submit" :disabled="busy || !canSubmit">
					{{ busy ? '處理中…' : mode === 'login' ? '登入' : '寄送驗證信並建立帳號' }}
				</button>
			</form>

			<div v-if="!session" class="auth_switch">
				<span>{{ mode === 'login' ? '還沒有帳號？' : '已經有帳號？' }}</span>
				<button type="button" class="auth_text_button" :disabled="busy" @click="switchMode">
					{{ mode === 'login' ? '建立帳號' : '返回登入' }}
				</button>
			</div>

			<p class="auth_security_note">此頁僅使用 Supabase Publishable key；請勿將 service-role 或其他私密金鑰放入 GitHub Pages。</p>
		</div>
	</section>
</template>

<script>
const AUTH_PAGE_VERSION = 'auth-page-v1.0.6-2026.08.27';
const AUTH_CONFIG_VERSION = 'supabase-auth-v1.0.5-2026.08.27';
const AUTH_CONFIG_URL = `./js/supabase-auth-config.js?v=${ AUTH_CONFIG_VERSION }`;

module.exports = {
	data() {
		return {
			mode: 'login',
			email: '',
			password: '',
			session: null,
			busy: false,
			statusMessage: '',
			errorMessage: '',
		};
	},
	computed: {
		canSubmit() {
			return this.email.length > 3 && this.password.length >= 8;
		},
	},
	async mounted() {
		console.info(`[現金流管理] login.vue 版本：${ AUTH_PAGE_VERSION }`);
		this.$store?.dispatch('SET_LOADING_ACTION', false);
		this.authChangeHandler = (event) => {
			this.session = event.detail?.session || null;
		};
		window.addEventListener('cashflow-auth-change', this.authChangeHandler);
		try {
			const auth = await this.getAuth();
			await auth.subscribe();
			const callback = await auth.completeEmailCallback();
			this.session = callback.session || await auth.getSession();
			if (callback.completed) this.statusMessage = 'Email 驗證完成，已安全登入。';
		} catch (error) {
			this.errorMessage = this.readableError(error);
		} finally { }
	},
	beforeUnmount() {
		window.removeEventListener('cashflow-auth-change', this.authChangeHandler);
	},
	methods: {
		async getAuth(forceReload = false) {
			const existingAuth = window.CASHFLOW_SUPABASE_AUTH;
			if (!forceReload && existingAuth?.version === AUTH_CONFIG_VERSION && typeof existingAuth.subscribe === 'function') return existingAuth;

			await new Promise((resolve, reject) => {
				document.querySelectorAll('script[data-cashflow-auth-config]').forEach((script) => script.remove());
				delete window.CASHFLOW_SUPABASE_AUTH;

				const script = document.createElement('script');
				script.src = AUTH_CONFIG_URL;
				script.async = true;
				script.dataset.cashflowAuthConfig = 'true';
				script.onload = resolve;
				script.onerror = () => reject(new Error('Supabase 登入設定檔載入失敗，請重新部署完整 index.html 後再試一次。'));
				document.head.appendChild(script);
			});

			const auth = window.CASHFLOW_SUPABASE_AUTH;
			if (!auth || auth.version !== AUTH_CONFIG_VERSION || typeof auth.subscribe !== 'function') {
				throw new Error(`Supabase 登入設定版本不一致。請確認 js/supabase-auth-config.js 已完整部署為 ${ AUTH_CONFIG_VERSION }。`);
			}
			return auth;
		},
		async retryConnection() {
			if (this.busy) return;
			this.busy = true;
			this.errorMessage = '';
			this.statusMessage = '';
			try {
				const auth = await this.getAuth(true);
				await auth.subscribe();
				this.session = await auth.getSession();
				this.statusMessage = this.session ? '登入工作階段已恢復。' : '登入服務已連線，請輸入 Email 與密碼。';
			} catch (error) {
				this.errorMessage = this.readableError(error);
			} finally {
				this.busy = false;
			}
		},
		switchMode() {
			this.mode = this.mode === 'login' ? 'register' : 'login';
			this.errorMessage = '';
			this.statusMessage = '';
		},
		async submit() {
			if (!this.canSubmit || this.busy) return;
			this.busy = true;
			this.errorMessage = '';
			this.statusMessage = '';

			try {
				const auth = await this.getAuth();
				const client = await auth.getClient();
				if (this.mode === 'register') {
					const { data, error } = await client.auth.signUp({
						email: this.email,
						password: this.password,
						options: { emailRedirectTo: auth.getRedirectUrl() },
					});
					if (error) throw error;
					this.session = data.session || null;
					this.statusMessage = data.session
						? '帳號已建立並登入。'
						: '驗證信已寄出。請至信箱點選連結完成驗證後，再回到本頁登入。';
				} else {
					const { data, error } = await client.auth.signInWithPassword({
						email: this.email,
						password: this.password,
					});
					if (error) throw error;
					this.session = data.session;
					this.statusMessage = '登入成功。';
				}
				this.password = '';
			} catch (error) {
				this.errorMessage = this.readableError(error);
			} finally {
				this.busy = false;
			}
		},
		readableError(error) {
			const message = error?.message || '驗證服務暫時無法使用，請稍後再試。';
			if (/invalid login credentials/i.test(message)) return 'Email 或密碼不正確。';
			if (/email not confirmed/i.test(message)) return 'Email 尚未完成驗證，請先開啟信箱中的確認連結。';
			if (/redirect|url/i.test(message)) return 'Supabase 尚未允許此網站的驗證回呼網址，請檢查 URL Configuration。';
			if (/Supabase 用戶端|CDN|載入|初始化/i.test(message)) return `登入服務暫時無法載入。請按「重新連線登入服務」再試一次。${ message }`;
			return message;
		},
	},
};
</script>
