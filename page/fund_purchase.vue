<template>
	<section class="fund_purchase_page">
		<section class="fund_selector fund_purchase_page_selector normal_shadow" aria-label="基金選擇">
			<div>
				<p class="fund_kicker">我的基金</p>
				<h2>基金申購紀錄</h2>
			</div>
			<div class="fund_selector_list" role="tablist" aria-label="選擇基金申購紀錄">
				<button v-for="fund in funds" :key="fund.key" type="button" role="tab"
					:aria-selected="activeFundKey === fund.key"
					:class="['fund_selector_button', activeFundKey === fund.key ? 'is-active' : '']"
					@click="selectFund(fund.key)">
					<span>{{ fund.shortName }}</span>
					<small>{{ fund.riskLevel }}</small>
				</button>
			</div>
		</section>

		<header class="fund_purchase_page_hero normal_shadow">
			<div>
				<p class="fund_kicker">目前選擇基金</p>
				<h2>{{ activeFund.name }}</h2>
				<p>此基金的申購紀錄由 Vuex store 帶入；市值、報酬率與損益會依其最新官方淨值動態試算。</p>
			</div>
			<div class="fund_purchase_page_refresh">
				<button class="fund_purchase_page_refresh_button" type="button" :disabled="isRefreshingAll"
					@click="refreshAllFunds(true)">
					<svg class="fund_refresh_icon" :class="{ 'is-spinning': isRefreshingAll }" viewBox="0 0 24 24"
						aria-hidden="true">
						<path d="M20 11a8 8 0 1 0 2 5.5M20 4v7h-7"></path>
					</svg>
					{{ isRefreshingAll ? '正在重整四檔基金' : '一鍵重整四檔基金資料' }}
				</button>
				<p v-if="refreshSummary"
					:class="['fund_purchase_page_refresh_status', refreshHasError ? 'is-error' : '']">{{ refreshSummary
					}}</p>
			</div>
		</header>

		<section class="fund_purchase_page_totals" aria-label="申購紀錄總損益">
			<article class="fund_purchase_page_total normal_shadow">
				<span>四檔基金合計總損益</span>
				<strong :class="getChangeClass(allFundsProfitLoss)">{{ formatSignedTwd(allFundsProfitLoss) }}</strong>
				<small>依四檔基金各自最新官方淨值試算</small>
			</article>
			<article class="fund_purchase_page_total normal_shadow">
				<span>{{ activeFund.name }}總損益</span>
				<strong :class="getChangeClass(activeFundProfitLoss)">{{ formatSignedTwd(activeFundProfitLoss)
					}}</strong>
				<small>目前選取基金的申購紀錄合計</small>
			</article>
			<article class="fund_purchase_page_total fund_purchase_page_pending_total normal_shadow">
				<span>目前基金待補資料</span>
				<strong>{{ activeIncompleteRecordCount }} 筆</strong>
				<small>申購淨值或庫存單位數尚未填寫</small>
			</article>
		</section>

		<section class="fund_purchase_page_content" aria-label="目前基金申購紀錄">
			<article class="fund_purchase_page_card normal_shadow">
				<header class="fund_purchase_page_card_head">
					<div>
						<p class="fund_kicker">{{ activeFund.riskLevel }}</p>
						<h3>{{ activeFund.name }}</h3>
						<div class="fund_purchase_page_card_controls"><button class="fund_purchase_page_add_button"
								type="button" @click="openPurchaseModal('add')">＋ 新增申購紀錄</button><button
								:class="['fund_purchase_page_filter_button', showOnlyIncomplete ? 'is-active' : '']"
								type="button" :aria-pressed="showOnlyIncomplete"
								@click="showOnlyIncomplete = !showOnlyIncomplete">{{ showOnlyIncomplete ? '顯示全部紀錄' :
					'僅顯示待補資料' }}</button></div>
					</div>
					<div class="fund_purchase_page_nav"><span>最新公開淨值</span><strong>{{ formatNav(activeFund.nav)
							}}</strong><small>淨值日期 {{ formatDate(activeFund.navDate) }} · {{
					formatTime(activeFund.updatedAt) }}</small></div>
				</header>
				<div class="fund_purchase_page_table_box">
					<table class="fund_purchase_page_table">
						<thead>
							<tr>
								<th>日期</th>
								<th>投入本金</th>
								<th>申購淨值</th>
								<th>庫存單位數</th>
								<th>市值</th>
								<th>報酬率</th>
								<th>損益</th>
								<th>操作</th>
							</tr>
						</thead>
						<tbody>
							<tr v-if="visiblePurchaseRecords.length === 0">
								<td colspan="8" class="fund_purchase_page_empty">目前沒有符合篩選條件的申購紀錄。</td>
							</tr>
							<tr v-for="record in visiblePurchaseRecords" :key="record.id">
								<td>{{ formatDate(record.date) }}<span v-if="record.isIncomplete"
										class="fund_purchase_page_pending_badge">待補資料</span></td>
								<td>{{ formatTwd(record.principal) }}</td>
								<td>{{ formatNav(record.subscriptionNav) }}</td>
								<td>{{ formatUnits(record.units) }}</td>
								<td>{{ formatTwd(record.marketValue) }}</td>
								<td><strong :class="getChangeClass(record.returnPct)">{{ formatPercent(record.returnPct)
										}}</strong></td>
								<td><strong :class="getChangeClass(record.profitLoss)">{{
					formatSignedTwd(record.profitLoss) }}</strong></td>
								<td><button class="fund_purchase_page_edit_button" type="button"
										:aria-label="`編輯 ${formatDate(record.date)} 的申購紀錄`"
										@click="openPurchaseModal('edit', record)">編輯</button></td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="fund_purchase_page_mobile_records" aria-label="行動版申購紀錄">
					<p v-if="visiblePurchaseRecords.length === 0" class="fund_purchase_page_mobile_empty">
						目前沒有符合篩選條件的申購紀錄。</p>
					<article v-for="record in visiblePurchaseRecords" :key="`mobile-${record.id}`"
						class="fund_purchase_page_mobile_record">
						<div class="fund_purchase_page_mobile_record_top">
							<div class="fund_purchase_page_mobile_record_date"><strong>{{ formatDate(record.date)
									}}</strong><span v-if="record.isIncomplete"
									class="fund_purchase_page_pending_badge">待補資料</span></div><span
								:class="getChangeClass(record.returnPct)">{{ formatPercent(record.returnPct) }}</span>
						</div>
						<dl>
							<div>
								<dt>投入本金</dt>
								<dd>{{ formatTwd(record.principal) }}</dd>
							</div>
							<div>
								<dt>申購淨值</dt>
								<dd>{{ formatNav(record.subscriptionNav) }}</dd>
							</div>
							<div>
								<dt>庫存單位數</dt>
								<dd>{{ formatUnits(record.units) }}</dd>
							</div>
							<div>
								<dt>市值</dt>
								<dd>{{ formatTwd(record.marketValue) }}</dd>
							</div>
							<div>
								<dt>損益</dt>
								<dd :class="getChangeClass(record.profitLoss)">{{ formatSignedTwd(record.profitLoss) }}
								</dd>
							</div>
						</dl><button class="fund_purchase_page_edit_button fund_purchase_page_mobile_edit_button"
							type="button" @click="openPurchaseModal('edit', record)">編輯這筆紀錄</button>
					</article>
				</div>
			</article>
		</section>

		<div :class="['alert', 'fund_purchase_page_modal', purchaseModal.mode === 'add' ? 'showAdd' : purchaseModal.mode === 'edit' ? 'showEdit' : '']"
			role="dialog" aria-modal="true" aria-labelledby="fund-purchase-modal-title"
			@click.self="closePurchaseModal">
			<div class="alert_box">
				<button class="alert_close" type="button" aria-label="關閉申購紀錄視窗" @click="closePurchaseModal"><svg
						viewBox="0 0 24 24" aria-hidden="true">
						<path d="M18 6 6 18M6 6l12 12"></path>
					</svg></button>
				<div class="alert_title"><span id="fund-purchase-modal-title">{{ purchaseModal.mode === 'edit' ?
					'編輯申購紀錄' : '新增申購紀錄' }}</span>
					<p>{{ activeFund.name }}</p>
				</div>
				<form class="alert_content" @submit.prevent="savePurchaseRecord">
					<div class="alert_content_item" data-txt="日期"><input v-model="purchaseModal.form.date"
							class="alert_inp" type="date" required></div>
					<div class="alert_content_item" data-txt="投入本金"><input v-model="purchaseModal.form.principal"
							class="alert_inp" type="number" min="0.01" step="0.01" placeholder="請輸入投入本金" required></div>
					<div class="alert_content_item" data-txt="申購淨值（選填）"><input
							v-model="purchaseModal.form.subscriptionNav" class="alert_inp" type="number" min="0"
							step="0.01" placeholder="尚未取得可留白"></div>
					<div class="alert_content_item" data-txt="庫存單位數（選填）"><input v-model="purchaseModal.form.units"
							class="alert_inp" type="number" min="0" step="0.1" placeholder="尚未取得可留白"></div>
					<p v-if="purchaseModal.error" class="fund_purchase_page_modal_error" role="alert">{{
					purchaseModal.error }}</p>
					<p class="fund_purchase_page_modal_hint">申購淨值或庫存單位數留白時，紀錄會標示為待補資料，且不納入損益試算。</p>
					<div class="alert_funcbox"><button class="normal_btn _secondary" type="button"
							@click="closePurchaseModal">取消</button><button class="normal_btn _primary" type="submit">{{
					purchaseModal.mode === 'edit' ? '儲存更新' : '新增紀錄' }}</button></div>
				</form>
			</div>
		</div>
		<p v-if="purchaseSaveMessage" class="fund_purchase_page_save_toast" role="status">{{ purchaseSaveMessage }}</p>
		<p class="fund_purchase_page_note">試算公式：市值＝庫存單位數 × 最新公開淨值；損益＝市值－投入本金；報酬率＝損益 ÷ 投入本金。申購資料由使用者提供並儲存在 Vuex
			store；未包含申購手續費、管理費、贖回費、配息與稅負。</p>
	</section>
</template>

<script>
const FUND_PURCHASE_KEYS = [
	{ key: 'taiwanTechnology', shortName: '安聯台灣科技', name: '安聯台灣科技基金', riskLevel: 'RR5', nav: 760.91, navDate: '2026-08-11' },
	{ key: 'taiwanDaba', shortName: '安聯台灣大壩', name: '安聯台灣大壩基金 A', riskLevel: 'RR4', nav: 313.43, navDate: '2026-08-11' },
	{ key: 'taiwanIntelligence', shortName: '安聯台灣智慧', name: '安聯台灣智慧基金', riskLevel: 'RR4', nav: 409.63, navDate: '2026-08-11' },
	{ key: 'fuhwaOmni', shortName: '復華全方位 A', name: '復華全方位基金 A', riskLevel: 'RR4', nav: 196.74, navDate: '2026-08-12' }
];

module.exports = {
	data() {
		return {
			activeFundKey: 'taiwanTechnology',
			isRefreshingAll: false,
			refreshSummary: '',
			refreshHasError: false,
			showOnlyIncomplete: false,
			purchaseSaveMessage: '',
			purchaseModal: { mode: '', editingId: '', form: { date: '', principal: '', subscriptionNav: '', units: '' }, error: '' },
			funds: FUND_PURCHASE_KEYS.map(fund => ({ ...fund, updatedAt: '', isRefreshing: false, navError: '' }))
		};
	},
	computed: {
		activeFund() { return this.funds.find(fund => fund.key === this.activeFundKey) || this.funds[0]; },
		recordsByFund() { return this.funds.map(fund => ({ key: fund.key, records: this.getFundPurchaseRecords(fund.key).map(record => this.calculateRecord(record, fund.nav)) })); },
		activePurchaseRecords() { return this.getFundPurchaseRecords(this.activeFundKey).map(record => this.calculateRecord(record, this.activeFund.nav)); },
		visiblePurchaseRecords() { return this.showOnlyIncomplete ? this.activePurchaseRecords.filter(record => record.isIncomplete) : this.activePurchaseRecords; },
		activeIncompleteRecordCount() { return this.activePurchaseRecords.filter(record => record.isIncomplete).length; },
		activeFundProfitLoss() { return this.sumProfitLoss(this.activePurchaseRecords); },
		allFundsProfitLoss() { return this.recordsByFund.reduce((total, fund) => total + this.sumProfitLoss(fund.records), 0); }
	},
	mounted() {
		this.hydrateFundCaches();
		this.refreshAllFunds(false);
		var get_url = url + "?func=getFund";
		axios.get(get_url).then(res => {
			// this.resetFundData(res.data);
			let objData = {
				objTitle: [],
				objList: {},
			}
			var t = objData.objTitle;
			var l = objData.objList;
			res.data.forEach(element => {
				var item = {
					id: element[0],
					date: element[1],
					principal: element[2],
					subscriptionNav: element[3],
					units: element[4],
				}
				if (element[0] !== '') {
					if (t.indexOf(element[8]) == -1) {
						t.push(element[8]);
						l[element[8]] = [item]
					} else {
						l[element[8]].push(item)
					}
				}
			});
			l['taiwanDaba'] = [
				{ id: '2', date: '2026.08.25', principal: 5000, subscriptionNav: "", units: "" },
				{ id: '3', date: '2026.08.11', principal: 10000, subscriptionNav: 313.43, units: 31.9 },
				{ id: '4', date: '2026.08.06', principal: 3000, subscriptionNav: 311.29, units: 9.7 },
				{ id: '5', date: '2026.07.31', principal: 3000, subscriptionNav: 268.54, units: 11.2 },
				{ id: '6', date: '2026.06.30', principal: 3000, subscriptionNav: 333.2, units: 9 },
				{ id: '7', date: '2026.06.03', principal: 40000, subscriptionNav: 334.56, units: 119.6 },
				{ id: '8', date: '2026.05.28', principal: 70000, subscriptionNav: 331.64, units: 211.1 },
				{ id: '9', date: '2026.05.28', principal: 33000, subscriptionNav: 336.82, units: 98 }
			]

			store.dispatch("SET_FUND_ACTION", objData.objList);
			store.dispatch("SET_LOADING_ACTION", false);
		});
	},
	methods: {
		selectFund(fundKey) { if (this.funds.some(fund => fund.key === fundKey)) { this.activeFundKey = fundKey; this.showOnlyIncomplete = false; this.purchaseSaveMessage = ''; } },
		getTodayInputDate() { return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); },
		formatInputDate(value) { return this.normalizeDate(value); },
		openPurchaseModal(mode, record = null) { const current = record || {}; this.purchaseSaveMessage = ''; this.purchaseModal = { mode, editingId: current.id ?? '', form: { date: current.date ? this.formatInputDate(current.date) : this.getTodayInputDate(), principal: current.principal ?? '', subscriptionNav: current.subscriptionNav ?? '', units: current.units ?? '' }, error: '' }; },
		closePurchaseModal() { this.purchaseModal = { mode: '', editingId: '', form: { date: '', principal: '', subscriptionNav: '', units: '' }, error: '' }; },
		getNextPurchaseRecordId(fundKey) { const ids = this.getFundPurchaseRecords(fundKey).map(record => Number(record.id)).filter(Number.isFinite); return String((ids.length ? Math.max(...ids) : 0) + 1); },
		normalizeOptionalNumber(value, fieldName) { if (value === '' || value === null || value === undefined) return ''; const number = Number(value); if (!Number.isFinite(number) || number < 0) throw new Error(`${ fieldName }必須是 0 或以上的數字`); return number; },
		savePurchaseRecord() { try { const form = this.purchaseModal.form; const date = this.normalizeDate(form.date); const principal = Number(form.principal); if (!date) throw new Error('請填寫日期'); if (!Number.isFinite(principal) || principal <= 0) throw new Error('投入本金必須大於 0'); const record = { id: this.purchaseModal.mode === 'edit' ? this.purchaseModal.editingId : this.getNextPurchaseRecordId(this.activeFundKey), date: date.replace(/-/g, '.'), principal, subscriptionNav: this.normalizeOptionalNumber(form.subscriptionNav, '申購淨值'), units: this.normalizeOptionalNumber(form.units, '庫存單位數') }; if (this.purchaseModal.mode === 'edit') { this.$store.commit('UPDATE_FUND_PURCHASE_RECORD', { fundKey: this.activeFundKey, record }); this.purchaseSaveMessage = '申購紀錄已更新，相關試算已同步重算。'; } else { this.$store.commit('ADD_FUND_PURCHASE_RECORD', { fundKey: this.activeFundKey, record }); this.purchaseSaveMessage = '申購紀錄已新增，相關試算已同步重算。'; } this.closePurchaseModal(); } catch (error) { this.purchaseModal.error = error instanceof Error ? error.message : '儲存申購紀錄時發生錯誤'; } },
		getNavStorageKey(fundKey) { return `cashflow-manager:fund-nav:v1:${ fundKey }`; },
		getWorkerBaseUrl() { return typeof window.CASHFLOW_QUOTE_PROXY_URL === 'string' ? window.CASHFLOW_QUOTE_PROXY_URL.trim().replace(/\/+$/, '') : ''; },
		getNavRequest(fundKey, force = false) {
			const workerBaseUrl = this.getWorkerBaseUrl();
			if (workerBaseUrl) { const endpoint = new URL(`${ workerBaseUrl }/nav`); endpoint.searchParams.set('fund', fundKey); endpoint.searchParams.set('cacheVersion', '4'); if (force) endpoint.searchParams.set('force', '1'); return { url: endpoint.toString(), isExternalProxy: true }; }
			if (window.location.hostname.endsWith('.github.io')) throw new Error('GitHub Pages 尚未設定 Cloudflare Worker 淨值端點');
			const input = encodeURIComponent(JSON.stringify({ json: { fund: fundKey, force } }));
			return { url: `/api/trpc/market.officialNav?input=${ input }`, isExternalProxy: false };
		},
		normalizeDate(value) { const match = String(value || '').match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/); return match ? `${ match[1] }-${ match[2].padStart(2, '0') }-${ match[3].padStart(2, '0') }` : ''; },
		formatDate(value) { const normalized = this.normalizeDate(value); return normalized ? normalized.replace(/-/g, ' / ') : '尚未取得'; },
		formatTime(value) { const match = String(value || '').match(/(\d{1,2}:\d{2})/); return match ? match[1] : '尚未更新'; },
		formatNav(value) { return Number.isFinite(value) ? `${ Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } 新臺幣` : '—'; },
		formatTwd(value) { return Number.isFinite(value) ? `TWD ${ Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }` : 'TWD —'; },
		formatSignedTwd(value) { return Number.isFinite(value) ? `${ value > 0 ? '+' : value < 0 ? '-' : '' }TWD ${ Math.abs(Number(value)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }` : 'TWD —'; },
		formatUnits(value) { return Number.isFinite(value) ? `${ Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) } 單位` : '—'; },
		formatPercent(value) { return Number.isFinite(value) ? `${ value > 0 ? '+' : '' }${ Number(value).toFixed(2) }%` : '—'; },
		getChangeClass(value) { return value > 0 ? 'fund_positive' : value < 0 ? 'fund_negative' : 'fund_flat'; },
		formatTaipeiDateTime(timestamp) { return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp)).replace(/\//g, ' / ').replace(',', ''); },
		getFundPurchaseRecords(fundKey) {
			const records = this.$store?.state?.FundData?.[fundKey];
			return Array.isArray(records) ? records : [];
		},
		isIncompletePurchaseRecord(record) { const isMissingValue = value => value === '' || value === null || value === undefined || !Number.isFinite(Number(value)); return !record || isMissingValue(record.subscriptionNav) || isMissingValue(record.units); },
		calculateRecord(record, nav) { const principal = Number(record.principal); const isIncomplete = this.isIncompletePurchaseRecord(record); const units = Number(record.units); const navValue = Number(nav); const marketValue = !isIncomplete && Number.isFinite(units) && Number.isFinite(navValue) && navValue > 0 ? units * navValue : null; const profitLoss = Number.isFinite(marketValue) ? marketValue - principal : null; const returnPct = Number.isFinite(profitLoss) && principal > 0 ? (profitLoss / principal) * 100 : null; return { ...record, isIncomplete, marketValue, profitLoss, returnPct }; },
		sumProfitLoss(records) { return records.reduce((total, record) => total + (Number.isFinite(record.profitLoss) ? record.profitLoss : 0), 0); },
		applyNavSnapshot(fundKey, snapshot, source = 'remote') { const fund = this.funds.find(item => item.key === fundKey); if (!fund || !snapshot || snapshot.fundKey !== fundKey || !Number.isFinite(Number(snapshot.nav)) || !this.normalizeDate(snapshot.navDate)) return false; fund.nav = Number(snapshot.nav); fund.navDate = this.normalizeDate(snapshot.navDate); fund.updatedAt = this.formatTaipeiDateTime(Number(snapshot.fetchedAt || snapshot.savedAt || Date.now())); fund.navError = ''; fund.cacheMode = source; return true; },
		hydrateFundCache(fundKey) { try { const raw = localStorage.getItem(this.getNavStorageKey(fundKey)); const snapshot = raw ? JSON.parse(raw) : null; return this.applyNavSnapshot(fundKey, snapshot, 'local'); } catch { return false; } },
		hydrateFundCaches() { this.funds.forEach(fund => this.hydrateFundCache(fund.key)); },
		async refreshFundNav(fundKey, force = false) {
			const fund = this.funds.find(item => item.key === fundKey); if (!fund || fund.isRefreshing) return false;
			fund.isRefreshing = true; fund.navError = '';
			try {
				const request = this.getNavRequest(fundKey, force); const abortController = new AbortController(); const timeout = window.setTimeout(() => abortController.abort(), 12000);
				let response; try { response = await fetch(request.url, { cache: 'no-store', credentials: request.isExternalProxy ? 'omit' : 'same-origin', signal: abortController.signal }); } finally { window.clearTimeout(timeout); }
				if (!response.ok) throw new Error(`官方淨值服務回應 ${ response.status }`);
				const payload = await response.json(); const snapshot = request.isExternalProxy ? payload : payload?.result?.data?.json;
				if (!this.applyNavSnapshot(fundKey, snapshot)) throw new Error('官方淨值資料不完整');
				try { localStorage.setItem(this.getNavStorageKey(fundKey), JSON.stringify({ ...snapshot, fundKey, savedAt: Date.now() })); } catch { }
				return true;
			} catch { fund.navError = '官方淨值更新失敗，已保留前次資料'; return false; } finally { fund.isRefreshing = false; }
		},
		async refreshAllFunds(force = true) {
			if (this.isRefreshingAll) return; this.isRefreshingAll = true; this.refreshSummary = force ? '正在重整四檔基金的官方淨值…' : '正在同步四檔基金淨值…'; this.refreshHasError = false;
			try { const results = await Promise.all(this.funds.map(fund => this.refreshFundNav(fund.key, force))); const failed = results.filter(result => !result).length; this.refreshHasError = failed > 0; this.refreshSummary = failed ? `${ failed } 檔基金更新失敗，已保留前次成功資料` : '四檔基金官方淨值已更新'; } finally { this.isRefreshingAll = false; }
		}
	}
};
</script>
