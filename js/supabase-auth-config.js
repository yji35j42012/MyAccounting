(function registerCashflowSupabaseAuth() {
	'use strict';

	const SUPABASE_AUTH_VERSION = 'supabase-auth-v1.0.4-2026.08.27';
	const SUPABASE_CDN_URLS = Object.freeze([
		'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
		'https://unpkg.com/@supabase/supabase-js@2',
	]);
	const config = Object.freeze({
		url: 'https://zojzhbwwqrsuvpvjomwy.supabase.co',
		publishableKey: 'sb_publishable_JEwm1VmdMqi_N-2QyMGEFA_YkH7cVeX',
		storageKey: 'cashflow-manager:auth:v2',
	});

	let client;
	let unsubscribe;
	let clientLoadPromise;
	let clientCreationPromise;

	function appendClientScript(url) {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = url;
			script.async = true;
			script.dataset.cashflowSupabaseClient = 'true';
			script.onload = () => {
				if (window.supabase && typeof window.supabase.createClient === 'function') {
					resolve();
				} else {
					script.remove();
					reject(new Error('Supabase 用戶端檔案已載入，但未正確初始化。'));
				}
			};
			script.onerror = () => {
				script.remove();
				reject(new Error(`無法載入 Supabase 用戶端：${url}`));
			};
			document.head.appendChild(script);
		});
	}

	async function loadSupabaseClient() {
		if (window.supabase && typeof window.supabase.createClient === 'function') {
			return;
		}
		if (clientLoadPromise) return clientLoadPromise;

		clientLoadPromise = (async () => {
			document.querySelectorAll('script[data-cashflow-supabase-client]').forEach((script) => script.remove());
			let lastError;
			for (const url of SUPABASE_CDN_URLS) {
				try {
					await appendClientScript(url);
					return;
				} catch (error) {
					lastError = error;
				}
			}
			throw new Error(`Supabase 用戶端載入失敗，請檢查網路或 CDN 存取後再試一次。${lastError?.message ? `（${lastError.message}）` : ''}`);
		})();

		try {
			return await clientLoadPromise;
		} finally {
			clientLoadPromise = null;
		}
	}

	async function requireClient() {
		if (client) return client;
		if (clientCreationPromise) return clientCreationPromise;

		clientCreationPromise = (async () => {
			await loadSupabaseClient();
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
		})();

		try {
			return await clientCreationPromise;
		} finally {
			clientCreationPromise = null;
		}
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
		const supabaseClient = await requireClient();
		const { data, error } = await supabaseClient.auth.getSession();
		if (error) throw error;
		emitAuthChange('INITIAL_SESSION', data.session);
		return data.session;
	}

	async function completeEmailCallback() {
		const callbackUrl = new URL(window.location.href);
		const code = callbackUrl.searchParams.get('code');
		if (!code) return { session: null, completed: false };

		const supabaseClient = await requireClient();
		const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);
		if (error) throw error;

		callbackUrl.searchParams.delete('code');
		window.history.replaceState({}, document.title, `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash || '#/login'}`);
		emitAuthChange('SIGNED_IN', data.session);
		return { session: data.session, completed: true };
	}

	async function subscribe() {
		if (unsubscribe) return;
		const supabaseClient = await requireClient();
		const { data } = supabaseClient.auth.onAuthStateChange((event, session) => {
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
	console.info(`[現金流管理] Supabase Auth 版本：${SUPABASE_AUTH_VERSION}`);
})();
