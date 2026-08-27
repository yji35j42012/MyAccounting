<template>
	<section class="fund_purchase_page fund_purchase_db_page">
		<section class="fund_selector fund_purchase_page_selector normal_shadow" aria-label="資料庫基金選擇">
			<div>
				<p class="fund_kicker">Supabase 資料庫</p>
				<h2>申購紀錄（資料庫）</h2>
				<p>此頁與原申購紀錄分開運作，只讀寫目前登入帳號自己的資料。</p>
			</div>
			<div class="fund_selector_list" role="tablist" aria-label="選擇資料庫基金申購紀錄">
				<button v-for="fund in funds" :key="fund.key" type="button" role="tab" :aria-selected="activeFundKey === fund.key" :class="['fund_selector_button', activeFundKey === fund.key ? 'is-active' : '']" @click="selectFund(fund.key)">
					<span>{{ fund.shortName }}</span><small>{{ fund.riskLevel }}</small>
				</button>
			</div>
		</section>

		<section v-if="!isLoading && !session" class="fund_purchase_page_content" aria-label="資料庫申購紀錄登入提示">
			<article class="fund_purchase_page_card normal_shadow">
				<p class="fund_kicker">需要登入</p><h3>請先登入以讀取資料庫申購紀錄</h3>
				<p class="fund_purchase_page_note">資料表已啟用資料列安全性規則；未登入時不會讀取、寫入或顯示任何資料庫資料。</p>
				<router-link class="fund_purchase_page_add_button" to="/login">前往登入</router-link>
			</article>
		</section>

		<template v-else>
			<header class="fund_purchase_page_hero normal_shadow">
				<div>
					<p class="fund_kicker">目前選擇基金</p><h2>{{ activeFund.name }}</h2>
					<p>資料庫帳號：{{ userEmail || '已登入' }}。申購淨值或單位數可先留白，之後再補齊。</p>
				</div>
				<div class="fund_purchase_page_refresh">
					<button class="fund_purchase_page_refresh_button" type="button" :disabled="isLoading || isRefreshingNavs" @click="refreshPageData">
						<svg class="fund_refresh_icon" :class="{ 'is-spinning': isLoading || isRefreshingNavs }" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0 2 5.5M20 4v7h-7"></path></svg>
						{{ isLoading || isRefreshingNavs ? '正在更新資料庫與淨值' : '更新資料庫與淨值' }}
					</button>
					<p v-if="lastLoadedAt" class="fund_purchase_page_refresh_status">資料庫最後載入：{{ formatTaipeiDateTime(lastLoadedAt) }}</p>
					<p class="fund_purchase_page_refresh_status" :class="{ 'is-error': activeFund.navError }">{{ activeNavStatus }}</p>
				</div>
			</header>

			<section class="fund_purchase_page_totals" aria-label="資料庫基金申購總覽">
				<article class="fund_purchase_page_total normal_shadow"><span>四檔基金合計總損益</span><strong :class="getChangeClass(allFundsProfitLoss)">{{ formatSignedTwd(allFundsProfitLoss) }}</strong><small>僅依資料庫中資料完整的申購紀錄試算</small></article>
				<article class="fund_purchase_page_total normal_shadow"><span>{{ activeFund.name }}總損益</span><strong :class="getChangeClass(activeFundProfitLoss)">{{ formatSignedTwd(activeFundProfitLoss) }}</strong><small>市值依最新公開淨值試算</small></article>
				<article class="fund_purchase_page_total fund_purchase_page_pending_total normal_shadow"><span>目前基金待補資料</span><strong>{{ activeIncompleteRecordCount }} 筆</strong><small>申購淨值或庫存單位數尚未填寫</small></article>
			</section>

			<section class="fund_purchase_page_content" aria-label="資料庫申購紀錄">
				<article class="fund_purchase_page_card normal_shadow">
					<header class="fund_purchase_page_card_head">
						<div><p class="fund_kicker">資料庫紀錄</p><h3>{{ activeFund.name }}</h3></div>
						<div class="fund_purchase_page_nav"><span>最新公開淨值</span><strong>{{ formatNav(activeFund.nav) }}</strong><small>淨值日期 {{ formatDate(activeFund.navDate) }} · {{ formatTime(activeFund.navUpdatedAt) }}</small></div>
					</header>
					<p v-if="pageError" class="fund_purchase_page_modal_error" role="alert">{{ pageError }}</p>
					<div class="fund_purchase_page_card_controls">
						<button class="fund_purchase_page_add_button" type="button" @click="openModal('add')">＋ 新增申購紀錄</button>
						<button :class="['fund_purchase_page_filter_button', showOnlyIncomplete ? 'is-active' : '']" type="button" :aria-pressed="showOnlyIncomplete" @click="showOnlyIncomplete = !showOnlyIncomplete">{{ showOnlyIncomplete ? '顯示全部紀錄' : '僅顯示待補資料' }}</button>
					</div>
					<div class="fund_purchase_page_table_box">
						<table class="fund_purchase_page_table">
							<thead><tr><th>日期</th><th>投入本金</th><th>申購淨值</th><th>庫存單位數</th><th>市值</th><th>報酬率</th><th>損益</th><th>操作</th></tr></thead>
							<tbody>
								<tr v-if="visibleRecords.length === 0"><td colspan="8" class="fund_purchase_page_empty">{{ isLoading ? '正在讀取資料庫資料…' : '資料庫目前沒有符合篩選條件的申購紀錄。' }}</td></tr>
								<tr v-for="record in visibleRecords" :key="record.id">
									<td>{{ formatDate(record.date) }}<span v-if="record.isIncomplete" class="fund_purchase_page_pending_badge">待補資料</span></td>
									<td>{{ formatTwd(record.principal) }}</td><td>{{ formatNav(record.subscriptionNav) }}</td><td>{{ formatUnits(record.units) }}</td><td>{{ formatTwd(record.marketValue) }}</td>
									<td><strong :class="getChangeClass(record.returnPct)">{{ formatPercent(record.returnPct) }}</strong></td><td><strong :class="getChangeClass(record.profitLoss)">{{ formatSignedTwd(record.profitLoss) }}</strong></td>
									<td><button class="fund_purchase_page_edit_button" type="button" :aria-label="`編輯 ${formatDate(record.date)} 的資料庫申購紀錄`" @click="openModal('edit', record)">編輯</button></td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="fund_purchase_page_mobile_records" aria-label="行動版資料庫申購紀錄">
						<p v-if="visibleRecords.length === 0" class="fund_purchase_page_mobile_empty">{{ isLoading ? '正在讀取資料庫資料…' : '資料庫目前沒有符合篩選條件的申購紀錄。' }}</p>
						<article v-for="record in visibleRecords" :key="`mobile-${record.id}`" class="fund_purchase_page_mobile_record">
							<div class="fund_purchase_page_mobile_record_top"><div class="fund_purchase_page_mobile_record_date"><strong>{{ formatDate(record.date) }}</strong><span v-if="record.isIncomplete" class="fund_purchase_page_pending_badge">待補資料</span></div><span :class="getChangeClass(record.returnPct)">{{ formatPercent(record.returnPct) }}</span></div>
							<dl><div><dt>投入本金</dt><dd>{{ formatTwd(record.principal) }}</dd></div><div><dt>申購淨值</dt><dd>{{ formatNav(record.subscriptionNav) }}</dd></div><div><dt>庫存單位數</dt><dd>{{ formatUnits(record.units) }}</dd></div><div><dt>市值</dt><dd>{{ formatTwd(record.marketValue) }}</dd></div><div><dt>損益</dt><dd :class="getChangeClass(record.profitLoss)">{{ formatSignedTwd(record.profitLoss) }}</dd></div></dl>
							<button class="fund_purchase_page_edit_button fund_purchase_page_mobile_edit_button" type="button" @click="openModal('edit', record)">編輯這筆紀錄</button>
						</article>
					</div>
				</article>
			</section>
		</template>

		<div :class="['alert', 'fund_purchase_page_modal', modal.mode ? 'showAdd' : '']" role="dialog" aria-modal="true" aria-labelledby="fund-purchase-db-modal-title" @click.self="closeModal">
			<div class="alert_box"><button class="alert_close" type="button" aria-label="關閉資料庫申購紀錄視窗" @click="closeModal"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg></button>
				<div class="alert_title"><span id="fund-purchase-db-modal-title">{{ modal.mode === 'edit' ? '編輯資料庫申購紀錄' : '新增資料庫申購紀錄' }}</span><p>{{ activeFund.name }}</p></div>
				<form class="alert_content" @submit.prevent="saveDatabaseRecord">
					<div class="alert_content_item" data-txt="日期"><input v-model="modal.form.date" class="alert_inp" type="date" required :disabled="isSaving"></div>
					<div class="alert_content_item" data-txt="投入本金"><input v-model="modal.form.principal" class="alert_inp" type="number" min="0.01" step="0.01" placeholder="請輸入投入本金" required :disabled="isSaving"></div>
					<div class="alert_content_item" data-txt="申購淨值（選填）"><input v-model="modal.form.subscriptionNav" class="alert_inp" type="number" min="0.01" step="0.01" placeholder="尚未取得可留白" :disabled="isSaving"></div>
					<div class="alert_content_item" data-txt="庫存單位數（選填）"><input v-model="modal.form.units" class="alert_inp" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="例如 250.47；最多小數點後兩位" :disabled="isSaving"></div>
					<p v-if="modal.error" class="fund_purchase_page_modal_error" role="alert">{{ modal.error }}</p>
					<p class="fund_purchase_page_modal_hint">此頁只寫入登入帳號自己的 Supabase 資料；留白欄位會儲存為資料庫 `NULL`，並顯示為待補資料。庫存單位數最多輸入至小數點後兩位。</p>
					<div class="alert_funcbox"><button class="normal_btn _secondary" type="button" :disabled="isSaving" @click="closeModal">取消</button><button class="normal_btn _primary" type="submit" :disabled="isSaving">{{ isSaving ? '儲存中…' : modal.mode === 'edit' ? '儲存更新' : '新增紀錄' }}</button></div>
				</form>
			</div>
		</div>
		<p v-if="saveMessage" class="fund_purchase_page_save_toast" role="status">{{ saveMessage }}</p>
	</section>
</template>

<script>
const FUND_PURCHASE_DATABASE_PAGE_VERSION = 'fund-purchase-db-v1.0.3-2026.08.27';
const FUND_PURCHASE_DB_KEYS = [
	{ key: 'taiwanTechnology', shortName: '安聯台灣科技', name: '安聯台灣科技基金', riskLevel: 'RR5', nav: 760.91, navDate: '2026-08-11' },
	{ key: 'taiwanDaba', shortName: '安聯台灣大壩', name: '安聯台灣大壩基金 A', riskLevel: 'RR4', nav: 313.43, navDate: '2026-08-11' },
	{ key: 'taiwanIntelligence', shortName: '安聯台灣智慧', name: '安聯台灣智慧基金', riskLevel: 'RR4', nav: 409.63, navDate: '2026-08-11' },
	{ key: 'fuhwaOmni', shortName: '復華全方位 A', name: '復華全方位基金 A', riskLevel: 'RR4', nav: 196.74, navDate: '2026-08-12' },
];

module.exports = {
	data() {
		return {
			funds: FUND_PURCHASE_DB_KEYS.map(fund => ({ ...fund, navUpdatedAt: '', navError: '', cacheMode: '', isRefreshing: false })),
			activeFundKey: 'taiwanTechnology', records: [], session: null, isLoading: true, isSaving: false, isRefreshingNavs: false, isBootstrapping: false, isDisposed: false,
			pageError: '', saveMessage: '', lastLoadedAt: 0, showOnlyIncomplete: false,
			modal: { mode: '', editingId: '', form: { date: '', principal: '', subscriptionNav: '', units: '' }, error: '' },
		};
	},
	computed: {
		activeFund() { return this.funds.find(fund => fund.key === this.activeFundKey) || this.funds[0]; },
		userEmail() { return this.session?.user?.email || ''; },
		activeRecords() { return this.records.filter(record => record.fundKey === this.activeFundKey).map(record => this.calculateRecord(record, this.activeFund.nav)); },
		visibleRecords() { return this.showOnlyIncomplete ? this.activeRecords.filter(record => record.isIncomplete) : this.activeRecords; },
		activeIncompleteRecordCount() { return this.activeRecords.filter(record => record.isIncomplete).length; },
		allFundsProfitLoss() { return this.funds.reduce((total, fund) => total + this.records.filter(record => record.fundKey === fund.key).reduce((sum, record) => sum + (this.calculateRecord(record, fund.nav).profitLoss || 0), 0), 0); },
		activeFundProfitLoss() { return this.activeRecords.reduce((sum, record) => sum + (record.profitLoss || 0), 0); },
		activeNavStatus() { if (this.isRefreshingNavs) return '正在同步四檔基金最新公開淨值…'; if (this.activeFund.navError) return this.activeFund.navError; return this.activeFund.navUpdatedAt ? `最新公開淨值已更新：${this.activeFund.navUpdatedAt}` : '尚未更新，將使用已保存的淨值資料'; },
	},
	async mounted() {
		console.info(`[現金流管理] fund_purchase_database.vue 版本：${FUND_PURCHASE_DATABASE_PAGE_VERSION}`);
		this.authChangeHandler = (event) => {
			const nextSession = event.detail?.session || null;
			const eventName = event.detail?.event || '';
			this.session = nextSession;
			if (!nextSession) { this.records = []; this.pageError = ''; return; }
			if (eventName === 'SIGNED_IN') this.bootstrap();
		};
		window.addEventListener('cashflow-auth-change', this.authChangeHandler);
		await this.bootstrap();
		store.dispatch('SET_LOADING_ACTION', false);
	},
	beforeUnmount() { this.isDisposed = true; window.removeEventListener('cashflow-auth-change', this.authChangeHandler); },
	methods: {
		async bootstrap() {
			if (this.isBootstrapping || this.isDisposed) return;
			this.isBootstrapping = true; this.isLoading = true; this.pageError = '';
			try {
				const auth = window.CASHFLOW_SUPABASE_AUTH;
				if (!auth || typeof auth.getSession !== 'function' || typeof auth.getClient !== 'function') throw new Error('登入服務尚未載入，請重新整理後再試一次。');
				await auth.subscribe();
				this.session = await auth.getSession();
				if (!this.session || this.isDisposed) return;
				this.hydrateFundCaches();
				await this.loadDatabaseRecords();
				this.refreshAllFundNav(false);
			} catch (error) {
				this.records = []; this.pageError = this.getFriendlyError(error, '無法初始化資料庫申購紀錄。');
			} finally {
				this.isBootstrapping = false; this.isLoading = false;
			}
		},
		async getDbClient() {
			const auth = window.CASHFLOW_SUPABASE_AUTH;
			if (!auth || typeof auth.getClient !== 'function') throw new Error('登入服務尚未載入，請重新整理後再試一次。');
			const client = await auth.getClient();
			if (!client || typeof client.from !== 'function') throw new Error('資料庫用戶端尚未準備完成。');
			return client;
		},
		async loadDatabaseRecords() {
			if (!this.session || this.isDisposed) return false;
			const sessionUserId = this.session.user?.id || ''; this.isLoading = true; this.pageError = '';
			try {
				const client = await this.getDbClient();
				const { data, error } = await client.from('fund_purchase_records').select('id, fund_key, purchase_date, principal, subscription_nav, units, created_at, updated_at').order('purchase_date', { ascending: false }).order('created_at', { ascending: false });
				if (error) throw error;
				if (this.isDisposed || !this.session || this.session.user?.id !== sessionUserId) return false;
				this.records = Array.isArray(data) ? data.map(row => this.mapDatabaseRecord(row)).filter(Boolean) : [];
				this.lastLoadedAt = Date.now();
				return true;
			} catch (error) {
				this.pageError = this.getFriendlyError(error, '讀取資料庫申購紀錄失敗。');
				return false;
			} finally { this.isLoading = false; }
		},
		getNavStorageKey(fundKey) { return `cashflow-manager:fund-nav:v1:${fundKey}`; },
		hydrateFundCache(fundKey) {
			try { const raw = localStorage.getItem(this.getNavStorageKey(fundKey)); const snapshot = raw ? JSON.parse(raw) : null; return this.applyNavSnapshot(fundKey, snapshot, 'local'); } catch { return false; }
		},
		hydrateFundCaches() { this.funds.forEach(fund => this.hydrateFundCache(fund.key)); },
		applyNavSnapshot(fundKey, snapshot, source = 'remote') {
			const fund = this.funds.find(item => item.key === fundKey);
			if (!fund || !snapshot || snapshot.fundKey !== fundKey || !Number.isFinite(Number(snapshot.nav)) || !this.normalizeDate(snapshot.navDate)) return false;
			fund.nav = Number(snapshot.nav); fund.navDate = this.normalizeDate(snapshot.navDate); fund.navUpdatedAt = this.formatTaipeiDateTime(Number(snapshot.fetchedAt || snapshot.savedAt || Date.now())); fund.navError = ''; fund.cacheMode = source;
			return true;
		},
		getWorkerBaseUrl() { return typeof window.CASHFLOW_QUOTE_PROXY_URL === 'string' ? window.CASHFLOW_QUOTE_PROXY_URL.trim().replace(/\/+$/, '') : ''; },
		getNavRequest(fundKey, force = false) {
			const workerBaseUrl = this.getWorkerBaseUrl();
			if (workerBaseUrl) { const endpoint = new URL(`${workerBaseUrl}/nav`); endpoint.searchParams.set('fund', fundKey); endpoint.searchParams.set('cacheVersion', '4'); if (force) endpoint.searchParams.set('force', '1'); return { url: endpoint.toString(), isExternalProxy: true }; }
			if (window.location.hostname.endsWith('.github.io')) throw new Error('GitHub Pages 尚未設定 Cloudflare Worker 淨值端點');
			const input = encodeURIComponent(JSON.stringify({ json: { fund: fundKey, force } }));
			return { url: `/api/trpc/market.officialNav?input=${input}`, isExternalProxy: false };
		},
		async refreshFundNav(fundKey, force = false) {
			const fund = this.funds.find(item => item.key === fundKey);
			if (!fund || fund.isRefreshing) return false;
			fund.isRefreshing = true; fund.navError = '';
			try {
				const request = this.getNavRequest(fundKey, force);
				const abortController = new AbortController(); const timeout = window.setTimeout(() => abortController.abort(), request.isExternalProxy ? 25 * 1000 : 12 * 1000);
				let response; try { response = await fetch(request.url, { cache: 'no-store', credentials: request.isExternalProxy ? 'omit' : 'same-origin', signal: abortController.signal }); } finally { window.clearTimeout(timeout); }
				if (!response.ok) throw new Error(`官方淨值服務回應 ${response.status}`);
				const payload = await response.json(); const snapshot = request.isExternalProxy ? payload : payload?.result?.data?.json;
				if (!this.applyNavSnapshot(fundKey, snapshot, 'remote')) throw new Error('官方淨值資料不完整');
				try { localStorage.setItem(this.getNavStorageKey(fundKey), JSON.stringify({ ...snapshot, fundKey, savedAt: Date.now() })); } catch {}
				return true;
			} catch {
				fund.navError = '官方淨值更新失敗，已保留前次資料'; return false;
			} finally { fund.isRefreshing = false; }
		},
		async refreshAllFundNav(force = false) {
			if (this.isRefreshingNavs) return false;
			this.isRefreshingNavs = true;
			try { const results = await Promise.all(this.funds.map(fund => this.refreshFundNav(fund.key, force))); return results.every(Boolean); } finally { this.isRefreshingNavs = false; }
		},
		async refreshPageData() { if (!this.session) return; await Promise.all([this.loadDatabaseRecords(), this.refreshAllFundNav(true)]); },
		selectFund(fundKey) { if (this.funds.some(fund => fund.key === fundKey)) { this.activeFundKey = fundKey; this.showOnlyIncomplete = false; this.saveMessage = ''; } },
		getTodayInputDate() { return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); },
		openModal(mode, record = null) { const current = record || {}; this.saveMessage = ''; this.modal = { mode, editingId: current.id || '', form: { date: current.date ? this.normalizeDate(current.date) : this.getTodayInputDate(), principal: current.principal ?? '', subscriptionNav: current.subscriptionNav ?? '', units: current.units ?? '' }, error: '' }; },
		resetModal() { this.modal = { mode: '', editingId: '', form: { date: '', principal: '', subscriptionNav: '', units: '' }, error: '' }; },
		closeModal() { if (!this.isSaving) this.resetModal(); },
		normalizeDate(value) { const match = String(value || '').match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/); return match ? `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}` : ''; },
		normalizeOptionalPositive(value, fieldName, maximumDecimalPlaces = null) { if (value === '' || value === null || value === undefined) return null; const text = String(value).trim(); const number = Number(text); if (!Number.isFinite(number) || number <= 0) throw new Error(`${fieldName}必須是大於 0 的數字，或留白`); if (maximumDecimalPlaces !== null && !new RegExp(`^\\d+(?:\\.\\d{1,${maximumDecimalPlaces}})?$`).test(text)) throw new Error(`${fieldName}最多可輸入小數點後 ${maximumDecimalPlaces} 位`); return number; },
		buildDatabasePayload() { const form = this.modal.form; const purchaseDate = this.normalizeDate(form.date); const principal = Number(form.principal); if (!purchaseDate) throw new Error('請填寫日期'); if (!Number.isFinite(principal) || principal <= 0) throw new Error('投入本金必須大於 0'); return { fund_key: this.activeFundKey, purchase_date: purchaseDate, principal, subscription_nav: this.normalizeOptionalPositive(form.subscriptionNav, '申購淨值'), units: this.normalizeOptionalPositive(form.units, '庫存單位數', 2) }; },
		async saveDatabaseRecord() {
			this.modal.error = ''; this.isSaving = true;
			try {
				if (!this.session) throw new Error('登入工作階段已失效，請重新登入。');
				const payload = this.buildDatabasePayload(); const client = await this.getDbClient(); let response;
				if (this.modal.mode === 'edit') response = await client.from('fund_purchase_records').update(payload).eq('id', this.modal.editingId).select('id, fund_key, purchase_date, principal, subscription_nav, units, created_at, updated_at').single();
				else response = await client.from('fund_purchase_records').insert(payload).select('id, fund_key, purchase_date, principal, subscription_nav, units, created_at, updated_at').single();
				if (response.error) throw response.error;
				const saved = this.mapDatabaseRecord(response.data); if (!saved) throw new Error('資料庫回傳的申購紀錄格式不完整。');
				const index = this.records.findIndex(record => record.id === saved.id); if (index >= 0) this.records.splice(index, 1, saved); else this.records.unshift(saved);
				this.lastLoadedAt = Date.now(); this.saveMessage = this.modal.mode === 'edit' ? '資料庫申購紀錄已更新。' : '資料庫申購紀錄已新增。'; this.resetModal();
			} catch (error) { this.modal.error = this.getFriendlyError(error, '儲存資料庫申購紀錄失敗。'); } finally { this.isSaving = false; }
		},
		mapDatabaseRecord(row) { const date = this.normalizeDate(row?.purchase_date); const principal = Number(row?.principal); if (!row?.id || !FUND_PURCHASE_DB_KEYS.some(fund => fund.key === row?.fund_key) || !date || !Number.isFinite(principal) || principal <= 0) return null; return { id: String(row.id), fundKey: row.fund_key, date, principal, subscriptionNav: row.subscription_nav === null || row.subscription_nav === undefined ? '' : Number(row.subscription_nav), units: row.units === null || row.units === undefined ? '' : Number(row.units), createdAt: row.created_at || '', updatedAt: row.updated_at || '' }; },
		isIncompletePurchaseRecord(record) { const missing = value => value === '' || value === null || value === undefined || !Number.isFinite(Number(value)) || Number(value) <= 0; return !record || missing(record.subscriptionNav) || missing(record.units); },
		calculateRecord(record, nav) { const isIncomplete = this.isIncompletePurchaseRecord(record); const units = Number(record.units); const navValue = Number(nav); const marketValue = !isIncomplete && Number.isFinite(units) && Number.isFinite(navValue) && navValue > 0 ? units * navValue : null; const profitLoss = Number.isFinite(marketValue) ? marketValue - Number(record.principal) : null; const returnPct = Number.isFinite(profitLoss) && Number(record.principal) > 0 ? (profitLoss / Number(record.principal)) * 100 : null; return { ...record, isIncomplete, marketValue, profitLoss, returnPct }; },
		isUsableNumber(value) { return value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)); },
		formatDate(value) { const date = this.normalizeDate(value); return date ? date.replace(/-/g, ' / ') : '尚未取得'; },
		formatTime(value) { const match = String(value || '').match(/(\d{1,2}:\d{2})/); return match ? match[1] : '尚未更新'; },
		formatNav(value) { return this.isUsableNumber(value) && Number(value) > 0 ? `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 新臺幣` : '—'; },
		formatTwd(value) { return this.isUsableNumber(value) ? `TWD ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'TWD —'; },
		formatSignedTwd(value) { return this.isUsableNumber(value) ? `${Number(value) > 0 ? '+' : Number(value) < 0 ? '-' : ''}TWD ${Math.abs(Number(value)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'TWD —'; },
		formatUnits(value) { return this.isUsableNumber(value) ? `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} 單位` : '—'; },
		formatPercent(value) { return this.isUsableNumber(value) ? `${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(2)}%` : '—'; },
		formatTaipeiDateTime(timestamp) { return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp)).replace(/\//g, ' / ').replace(',', ''); },
		getChangeClass(value) { return Number(value) > 0 ? 'fund_positive' : Number(value) < 0 ? 'fund_negative' : 'fund_flat'; },
		getFriendlyError(error, fallback) { const message = String(error?.message || ''); if (/JWT|session|not authenticated|401|403/i.test(message)) return '登入工作階段已失效或沒有資料庫權限，請重新登入後再試一次。'; return message || fallback; },
	},
};
</script>
