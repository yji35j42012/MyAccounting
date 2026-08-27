(function registerCashflowSupabaseAuth() {
	'use strict';

	const SUPABASE_AUTH_VERSION = 'supabase-auth-v1.0.2-2026.08.27';
	const config = Object.freeze({
		url: 'https://zojzhbwwqrsuvpvjomwy.supabase.co',
		publishableKey: 'sb_publishable_JEwm1VmdMqi_N-2QyMGEFA_YkH7cVeX',
		storageKey: 'cashflow-manager:auth:v2',
	});

	let client;
	let unsubscribe;

	function requireClient() {
		if (client) return client;
		if (!window.supabase || typeof window.supabase.createClient !== 'function') {
			throw new Error('Supabase 用戶端尚未載入，請重新整理頁面後再試一次。');
		}

		client = window.supabase.createClient(config.url, config.publishableKey, {
			auth: {
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: false,
				flowType: 'pkce',
				storageKey: config.storageKey,
			},
		});
		return client;
	}

	function emitAuthChange(event, session) {
		window.dispatchEvent(new CustomEvent('cashflow-auth-change', {
			detail: {
				event,
				session: session || null,
			},
		}));
	}

	function getRedirectUrl() {
		const url = new URL(window.location.href);
		url.search = '';
		url.hash = '#/login';
		return url.toString();
	}

	async function getSession() {
		const { data, error } = await requireClient().auth.getSession();
		if (error) throw error;
		emitAuthChange('INITIAL_SESSION', data.session);
		return data.session;
	}

	async function completeEmailCallback() {
		const callbackUrl = new URL(window.location.href);
		const code = callbackUrl.searchParams.get('code');
		if (!code) return { session: null, completed: false };

		const { data, error } = await requireClient().auth.exchangeCodeForSession(code);
		if (error) throw error;

		callbackUrl.searchParams.delete('code');
		window.history.replaceState({}, document.title, `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash || '#/login'}`);
		emitAuthChange('SIGNED_IN', data.session);
		return { session: data.session, completed: true };
	}

	function subscribe() {
		if (unsubscribe) return;
		const { data } = requireClient().auth.onAuthStateChange((event, session) => {
			emitAuthChange(event, session);
		});
		unsubscribe = data.subscription.unsubscribe;
	}

	window.CASHFLOW_SUPABASE_AUTH = Object.freeze({
		version: SUPABASE_AUTH_VERSION,
		config,
		getClient: requireClient,
		getSession,
		getRedirectUrl,
		completeEmailCallback,
		subscribe,
	});
})();
