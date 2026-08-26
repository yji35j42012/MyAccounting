<template>
	<section class="fund_purchase_page">
		<section class="fund_selector fund_purchase_page_selector normal_shadow" aria-label="基金選擇">
			<div>
				<p class="fund_kicker">我的基金</p>
				<h2>基金申購紀錄</h2>
			</div>
			<div class="fund_selector_list" role="tablist" aria-label="選擇基金申購紀錄">
				<button v-for="fund in funds" :key="fund.key" type="button" role="tab"
					:aria-selected="activeFundKey === fund.key" :class="['fund_selector_button', activeFundKey === fund.key ? 'is-active' : '']"
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
				<p>此基金套用三筆示範申購資料；市值、報酬率與損益會依其最新官方淨值動態試算。</p>
			</div>
			<div class="fund_purchase_page_refresh">
				<button class="fund_purchase_page_refresh_button" type="button" :disabled="isRefreshingAll" @click="refreshAllFunds(true)">
					<svg class="fund_refresh_icon" :class="{ 'is-spinning': isRefreshingAll }" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0 2 5.5M20 4v7h-7"></path></svg>
					{{ isRefreshingAll ? '正在重整四檔基金' : '一鍵重整四檔基金資料' }}
				</button>
				<p v-if="refreshSummary" :class="['fund_purchase_page_refresh_status', refreshHasError ? 'is-error' : '']">{{ refreshSummary }}</p>
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
				<strong :class="getChangeClass(activeFundProfitLoss)">{{ formatSignedTwd(activeFundProfitLoss) }}</strong>
				<small>目前選取基金的三筆申購紀錄合計</small>
			</article>
		</section>

		<section class="fund_purchase_page_content" aria-label="目前基金申購紀錄">
			<article class="fund_purchase_page_card normal_shadow">
				<header class="fund_purchase_page_card_head">
					<div><p class="fund_kicker">{{ activeFund.riskLevel }}</p><h3>{{ activeFund.name }}</h3></div>
					<div class="fund_purchase_page_nav"><span>最新公開淨值</span><strong>{{ formatNav(activeFund.nav) }}</strong><small>淨值日期 {{ formatDate(activeFund.navDate) }} · {{ formatTime(activeFund.updatedAt) }}</small></div>
				</header>
				<div class="fund_purchase_page_table_box">
					<table class="fund_purchase_page_table">
						<thead><tr><th>日期</th><th>投入本金</th><th>申購淨值</th><th>庫存單位數</th><th>市值</th><th>報酬率</th><th>損益</th></tr></thead>
						<tbody><tr v-for="record in activePurchaseRecords" :key="record.id"><td>{{ formatDate(record.date) }}</td><td>{{ formatTwd(record.principal) }}</td><td>{{ formatNav(record.subscriptionNav) }}</td><td>{{ formatUnits(record.units) }}</td><td>{{ formatTwd(record.marketValue) }}</td><td><strong :class="getChangeClass(record.returnPct)">{{ formatPercent(record.returnPct) }}</strong></td><td><strong :class="getChangeClass(record.profitLoss)">{{ formatSignedTwd(record.profitLoss) }}</strong></td></tr></tbody>
					</table>
				</div>
				<div class="fund_purchase_page_mobile_records" aria-label="行動版申購紀錄"><article v-for="record in activePurchaseRecords" :key="`mobile-${record.id}`" class="fund_purchase_page_mobile_record"><div class="fund_purchase_page_mobile_record_top"><strong>{{ formatDate(record.date) }}</strong><span :class="getChangeClass(record.returnPct)">{{ formatPercent(record.returnPct) }}</span></div><dl><div><dt>投入本金</dt><dd>{{ formatTwd(record.principal) }}</dd></div><div><dt>申購淨值</dt><dd>{{ formatNav(record.subscriptionNav) }}</dd></div><div><dt>庫存單位數</dt><dd>{{ formatUnits(record.units) }}</dd></div><div><dt>市值</dt><dd>{{ formatTwd(record.marketValue) }}</dd></div><div><dt>損益</dt><dd :class="getChangeClass(record.profitLoss)">{{ formatSignedTwd(record.profitLoss) }}</dd></div></dl></article></div>
			</article>
		</section>

		<p class="fund_purchase_page_note">試算公式：市值＝庫存單位數 × 最新公開淨值；損益＝市值－投入本金；報酬率＝損益 ÷ 投入本金。示範資料由使用者提供，未包含申購手續費、管理費、贖回費、配息與稅負。</p>
	</section>
</template>

<script>
const FUND_PURCHASE_KEYS = [
	{ key: 'taiwanTechnology', shortName: '安聯台灣科技', name: '安聯台灣科技基金', riskLevel: 'RR5', nav: 760.91, navDate: '2026-08-11' },
	{ key: 'taiwanDaba', shortName: '安聯台灣大壩', name: '安聯台灣大壩基金 A', riskLevel: 'RR4', nav: 313.43, navDate: '2026-08-11' },
	{ key: 'taiwanIntelligence', shortName: '安聯台灣智慧', name: '安聯台灣智慧基金', riskLevel: 'RR4', nav: 409.63, navDate: '2026-08-11' },
	{ key: 'fuhwaOmni', shortName: '復華全方位 A', name: '復華全方位基金 A', riskLevel: 'RR4', nav: 196.74, navDate: '2026-08-12' }
];

const PURCHASE_RECORDS = [
	{ id: 'purchase-2026-08-14', date: '2026.08.14', principal: 200000, subscriptionNav: 424.42, units: 471.2 },
	{ id: 'purchase-2026-08-11', date: '2026.08.11', principal: 10000, subscriptionNav: 409.63, units: 24.4 },
	{ id: 'purchase-2026-06-22', date: '2026.06.22', principal: 100000, subscriptionNav: 462.9, units: 216 }
];

module.exports = {
	data() {
		return {
			activeFundKey: 'taiwanTechnology',
			isRefreshingAll: false,
			refreshSummary: '',
			refreshHasError: false,
			funds: FUND_PURCHASE_KEYS.map(fund => ({ ...fund, updatedAt: '', isRefreshing: false, navError: '' })),
			purchaseRecords: PURCHASE_RECORDS
		};
	},
	computed: {
		activeFund() { return this.funds.find(fund => fund.key === this.activeFundKey) || this.funds[0]; },
		recordsByFund() { return this.funds.map(fund => ({ key: fund.key, records: this.purchaseRecords.map(record => this.calculateRecord(record, fund.nav)) })); },
		activePurchaseRecords() { return this.purchaseRecords.map(record => this.calculateRecord(record, this.activeFund.nav)); },
		activeFundProfitLoss() { return this.sumProfitLoss(this.activePurchaseRecords); },
		allFundsProfitLoss() { return this.recordsByFund.reduce((total, fund) => total + this.sumProfitLoss(fund.records), 0); }
	},
	mounted() {
		this.hydrateFundCaches();
		this.refreshAllFunds(false);
		store.dispatch('SET_LOADING_ACTION', false);
	},
	methods: {
		selectFund(fundKey) { if (this.funds.some(fund => fund.key === fundKey)) this.activeFundKey = fundKey; },
		getNavStorageKey(fundKey) { return `cashflow-manager:fund-nav:v1:${fundKey}`; },
		getWorkerBaseUrl() { return typeof window.CASHFLOW_QUOTE_PROXY_URL === 'string' ? window.CASHFLOW_QUOTE_PROXY_URL.trim().replace(/\/+$/, '') : ''; },
		getNavRequest(fundKey, force = false) {
			const workerBaseUrl = this.getWorkerBaseUrl();
			if (workerBaseUrl) { const endpoint = new URL(`${workerBaseUrl}/nav`); endpoint.searchParams.set('fund', fundKey); endpoint.searchParams.set('cacheVersion', '4'); if (force) endpoint.searchParams.set('force', '1'); return { url: endpoint.toString(), isExternalProxy: true }; }
			if (window.location.hostname.endsWith('.github.io')) throw new Error('GitHub Pages 尚未設定 Cloudflare Worker 淨值端點');
			const input = encodeURIComponent(JSON.stringify({ json: { fund: fundKey, force } }));
			return { url: `/api/trpc/market.officialNav?input=${input}`, isExternalProxy: false };
		},
		normalizeDate(value) { const match = String(value || '').match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/); return match ? `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}` : ''; },
		formatDate(value) { const normalized = this.normalizeDate(value); return normalized ? normalized.replace(/-/g, ' / ') : '尚未取得'; },
		formatTime(value) { const match = String(value || '').match(/(\d{1,2}:\d{2})/); return match ? match[1] : '尚未更新'; },
		formatNav(value) { return Number.isFinite(value) ? `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 新臺幣` : '—'; },
		formatTwd(value) { return Number.isFinite(value) ? `TWD ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'TWD —'; },
		formatSignedTwd(value) { return Number.isFinite(value) ? `${value > 0 ? '+' : value < 0 ? '-' : ''}TWD ${Math.abs(Number(value)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'TWD —'; },
		formatUnits(value) { return Number.isFinite(value) ? `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} 單位` : '—'; },
		formatPercent(value) { return Number.isFinite(value) ? `${value > 0 ? '+' : ''}${Number(value).toFixed(2)}%` : '—'; },
		getChangeClass(value) { return value > 0 ? 'fund_positive' : value < 0 ? 'fund_negative' : 'fund_flat'; },
		formatTaipeiDateTime(timestamp) { return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp)).replace(/\//g, ' / ').replace(',', ''); },
		calculateRecord(record, nav) { const principal = Number(record.principal); const units = Number(record.units); const navValue = Number(nav); const marketValue = Number.isFinite(units) && Number.isFinite(navValue) && navValue > 0 ? units * navValue : null; const profitLoss = Number.isFinite(marketValue) ? marketValue - principal : null; const returnPct = Number.isFinite(profitLoss) && principal > 0 ? (profitLoss / principal) * 100 : null; return { ...record, marketValue, profitLoss, returnPct }; },
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
				if (!response.ok) throw new Error(`官方淨值服務回應 ${response.status}`);
				const payload = await response.json(); const snapshot = request.isExternalProxy ? payload : payload?.result?.data?.json;
				if (!this.applyNavSnapshot(fundKey, snapshot)) throw new Error('官方淨值資料不完整');
				try { localStorage.setItem(this.getNavStorageKey(fundKey), JSON.stringify({ ...snapshot, fundKey, savedAt: Date.now() })); } catch {}
				return true;
			} catch { fund.navError = '官方淨值更新失敗，已保留前次資料'; return false; } finally { fund.isRefreshing = false; }
		},
		async refreshAllFunds(force = true) {
			if (this.isRefreshingAll) return; this.isRefreshingAll = true; this.refreshSummary = force ? '正在重整四檔基金的官方淨值…' : '正在同步四檔基金淨值…'; this.refreshHasError = false;
			try { const results = await Promise.all(this.funds.map(fund => this.refreshFundNav(fund.key, force))); const failed = results.filter(result => !result).length; this.refreshHasError = failed > 0; this.refreshSummary = failed ? `${failed} 檔基金更新失敗，已保留前次成功資料` : '四檔基金官方淨值已更新'; } finally { this.isRefreshingAll = false; }
		}
	}
};
</script>
