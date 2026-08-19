<style scoped></style>

<template>
	<div class="fund">
		<section class="fund_selector normal_shadow" aria-label="基金選擇">
			<div>
				<p class="fund_kicker">我的基金</p>
				<h2>基金分析</h2>
			</div>
			<div class="fund_selector_list" role="tablist" aria-label="選擇基金">
				<button v-for="fund in funds" :key="fund.key" type="button" role="tab"
					:aria-selected="activeFundKey === fund.key" :class="['fund_selector_button', activeFundKey === fund.key ? 'is-active' : '']"
					@click="selectFund(fund.key)">
					<span>{{ fund.shortName }}</span>
					<small>{{ fund.riskLevel }}</small>
				</button>
			</div>
		</section>

		<section class="fund_hero normal_shadow">
			<div class="fund_hero_main">
				<p class="fund_eyebrow">基金持有追蹤</p>
				<h2 class="fund_title">{{ activeFund.name }}</h2>
					<p class="fund_subtitle">{{ activeFund.englishName }}</p>
					<div class="fund_tags">
						<span v-for="tag in activeFund.tags" :key="tag">{{ tag }}</span>
					</div>
					<div class="fund_hero_nav">
						<span class="fund_meta_label">最新公開淨值</span>
							<strong class="fund_nav_value">{{ activeFund.nav.toFixed(2) }} <small>新臺幣</small></strong>
							<span class="fund_nav_date">淨值日期：{{ activeFund.navDate }}</span>
								<span class="fund_nav_change"><strong :class="getChangeClass(activeFund.navChangePct)">{{ formatPercent(activeFund.navChangePct) }}</strong><small>單日漲跌幅</small></span>
							<small :class="['fund_nav_refresh_status', activeNav.navError ? 'is-error' : '']">{{ navStatus }}</small>
							<small class="fund_cache_status">{{ navTimingStatus }}</small>
							<button type="button" class="fund_cache_clear_button" @click="clearFundNavCache" aria-label="清除本機淨值快取">清除本機淨值快取</button>
						<a class="fund_source_link" :href="activeFund.sourceUrl" target="_blank" rel="noopener noreferrer">查看淨值來源</a>
					</div>
					</div>
					<aside class="fund_hero_meta fund_hero_contribution_card">
						<span class="fund_meta_label">公開前十大對基金淨值估計貢獻</span>
						<strong :class="getChangeClass(holdingsFundContributionPct)">{{ formatPercent(holdingsFundContributionPct) }}</strong>
						<small class="fund_nav_contribution_detail">前十大標準化日報酬（隨 Yahoo 報價同步）：{{ formatPercent(holdingsWeightedChangePct) }}；{{ holdingsSignalStatus }}</small>
						<span class="fund_holdings_asof">持股資料基準日：{{ activeFund.holdingsDate }}</span>
					</aside>
			</section>

		<section class="fund_summary">
			<div v-for="card in activeFund.summaryCards" :key="card.label" class="fund_summary_card normal_shadow">
				<span>{{ card.label }}</span>
				<strong>{{ card.value }}</strong>
				<small>{{ card.detail }}</small>
			</div>
		</section>

		<section class="fund_history normal_shadow">
			<div class="fund_section_head fund_history_head">
				<div>
					<p class="fund_kicker">歷史淨值</p>
					<h3>近 30 日淨值走勢</h3>
				</div>
				<div class="fund_history_meta"><span class="fund_asof">區間：{{ activeFund.historyRange }}</span><small :class="['fund_history_refresh_status', activeHistory.historyError ? 'is-error' : '']">{{ historyStatus }}</small><small class="fund_cache_status">{{ historyTimingStatus }}</small><button type="button" class="fund_refresh_button fund_history_refresh_button" :disabled="activeHistory.isRefreshing" @click="refreshRecentHistoryNav(true)" aria-label="更新歷史淨值"><svg :class="['fund_refresh_icon', activeHistory.isRefreshing ? 'is-spinning' : '']" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0 2.34 5.66M20 4v7h-7" /></svg><span>{{ activeHistory.isRefreshing ? '更新中' : '更新歷史淨值' }}</span></button></div>
			</div>
			<div class="fund_history_metrics">
				<div><span>區間最高</span><strong>{{ activeFund.historyHigh.value.toFixed(2) }}</strong><small>{{ activeFund.historyHigh.date }}</small></div>
				<div><span>區間最低</span><strong>{{ activeFund.historyLow.value.toFixed(2) }}</strong><small>{{ activeFund.historyLow.date }}</small></div>
			</div>
			<div class="fund_history_content">
				<div class="fund_history_list" aria-label="近期歷史淨值明細">
					<div class="fund_history_list_head"><span>近期日期</span><span>淨值／漲跌幅</span></div>
					<article v-for="item in recentNavs" :key="item.date" class="fund_history_row">
						<div><strong>{{ formatDate(item.date) }}</strong></div>
						<div class="fund_history_value_group"><strong>{{ item.value.toFixed(2) }}</strong><small :class="getChangeClass(item.changePct)">{{ formatPercent(item.changePct) }}</small></div>
					</article>
				</div>
			</div>
				<p class="fund_history_source">資料來源：<a :href="activeFund.performanceSourceUrl || activeFund.sourceUrl + '?nav=navperformance'" target="_blank" rel="noopener noreferrer">官方淨值走勢</a>；最近五筆資料由<a :href="activeFund.historySourceUrl" target="_blank" rel="noopener noreferrer">公開基金淨值表</a>動態取得。</p>
		</section>

		<section class="fund_holdings normal_shadow">
				<div class="fund_section_head">
					<div class="fund_holdings_heading"><p class="fund_kicker">投資標的 <span class="fund_holdings_asof_inline">持股資料基準日：{{ activeFund.holdingsDate }}</span></p><h3>官方公開前十大持股</h3></div>
					<div class="fund_quote_controls">
						<div class="fund_section_meta fund_quote_meta">
							<span class="fund_asof">Yahoo 報價：{{ activeQuote.quoteUpdatedAt }}</span>
						<small :class="['fund_quote_hint', activeQuote.quoteError ? 'is-error' : '']">{{ quoteStatus }}</small>
					</div>
						<button type="button" class="fund_refresh_button" :disabled="activeQuote.isRefreshing" @click="refreshYahooQuotes()" aria-label="更新 Yahoo 股價">
						<svg :class="['fund_refresh_icon', activeQuote.isRefreshing ? 'is-spinning' : '']" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0 2.34 5.66M20 4v7h-7" /></svg>
						<span>{{ activeQuote.isRefreshing ? '更新中' : '更新股價' }}</span>
					</button>
					</div>
				</div>
				<div class="fund_table_box">
					<table class="fund_table"><thead><tr><th>排名</th><th>投資標的</th><th>Yahoo 股價¹</th><th>今日漲跌²</th><th>比重</th></tr></thead>
						<tbody><tr v-for="item in activeFund.holdings" :key="item.name"><td><span class="fund_rank">{{ item.rank }}</span></td><td class="fund_company">{{ item.name }}</td><td class="fund_price"><strong>TWD {{ formatPrice(item.price) }}</strong><small>{{ item.market }}</small></td><td class="fund_change"><strong :class="['fund_today_change', getChangeClass(item.changePct)]">{{ formatPercent(item.changePct) }}</strong><small :class="getChangeClass(getQuoteChangeAmount(item))">{{ formatQuoteChange(getQuoteChangeAmount(item)) }}</small></td><td class="fund_weight"><strong>{{ item.weight.toFixed(2) }}%</strong></td></tr></tbody>
				</table>
			</div>
			<div class="fund_mobile_holdings" aria-label="官方公開前十大持股">
					<article class="fund_mobile_holding" v-for="item in activeFund.holdings" :key="'mobile-' + item.name"><div class="fund_mobile_holding_top"><div class="fund_mobile_company_group"><span class="fund_rank">{{ item.rank }}</span><strong>{{ item.name }}</strong></div><div class="fund_mobile_change"><strong :class="getChangeClass(item.changePct)">{{ formatPercent(item.changePct) }}</strong><small :class="getChangeClass(getQuoteChangeAmount(item))">{{ formatQuoteChange(getQuoteChangeAmount(item)) }}</small></div></div><div class="fund_mobile_holding_detail"><div class="fund_mobile_price fund_mobile_price_inline"><strong>TWD {{ formatPrice(item.price) }}</strong><small>{{ item.market }} ・ 比重 {{ item.weight.toFixed(2) }}%</small></div></div></article>
			</div>
		</section>

		<section class="fund_insight_grid"><article v-for="insight in activeFund.insights" :key="insight.title" class="fund_insight normal_shadow"><p class="fund_kicker">{{ insight.kicker }}</p><h3>{{ insight.title }}</h3><p>{{ insight.text }}</p></article></section>
						<section class="fund_notice"><p><strong>資料揭露：</strong>{{ activeFund.name }}的最新淨值與持股資料分別依相關基金公司官方頁面及官方投資持股頁列示。最新淨值單日漲跌幅按「(最新官方淨值 − 前一公開營業日淨值) ÷ 前一公開營業日淨值」計算；若公開歷史表尚未列出最新官方日期，系統會以該官方淨值補入最近五筆資料。基金最新與歷史淨值會依資料日期儲存於此瀏覽器的 localStorage：平日 16:00 前預期使用前一營業日資料，16:00 後才檢查當日資料。¹ 個股價格僅於平日 09:00–14:00 自動每五分鐘更新，並可隨時按下「更新股價」手動取得報價；資料經設定的報價代理自 Yahoo 股市讀取 regularMarketPrice。本機開發使用本網站伺服端，GitHub Pages 發布時使用設定的 Cloudflare Worker。² 今日漲跌幅及金額分別按「(Yahoo 當前報價 − 前一交易日收盤價) ÷ 前一交易日收盤價」與「Yahoo 當前報價 − 前一交易日收盤價」計算；初始資料尚未取得前收時，會依既有漲跌幅反推金額供閱讀。公開前十大對基金淨值的估計貢獻按「Σ(持股比重 × 個股漲跌幅) ÷ 100」計算，與基金淨值單日漲跌同為基金資產層級；另列「前十大標準化日報酬」供觀察列示持股本身的平均表現。兩者均僅反映官方公開前十大持股；未列示股票、現金、期貨、衍生性部位、費用與公開持股基準日落後等因素，仍會使結果與基金實際淨值不同。盤中報價可能與交易所當日最終收盤價不同；若更新失敗，頁面會保留該基金前次成功取得的報價。持股會因基金經理人調整而變動，畫面僅呈現官方公開列示標的，非完整投資組合。</p><p><strong>用途說明：</strong>本頁為公開資料整理與持股結構觀察，不構成任何買賣、申購或贖回建議。</p></section>
	</div>
</template>

<script>
const FUND_ANALYSIS_VERSION = 'fund-analysis-v1.5.14-2026.08.19';

module.exports = {
	data() {
			return {
					activeFundKey: 'taiwanTechnology',
					quoteTimer: null,
					navTimer: null,
					historyTimer: null,
					countdownTimer: null,
					countdownNow: Date.now(),
						quoteAutoSlotByFund: {},
						cacheClearNotice: '',
					quotesByFund: {
					taiwanTechnology: { quoteUpdatedAt: '2026 / 08 / 12 14:42', savedAt: 0, quotedCount: 0, cacheMode: '', isRefreshing: false, quoteError: '' },
						taiwanDaba: { quoteUpdatedAt: '尚未取得', savedAt: 0, quotedCount: 0, cacheMode: '', isRefreshing: false, quoteError: '' },
						taiwanIntelligence: { quoteUpdatedAt: '尚未取得', savedAt: 0, quotedCount: 0, cacheMode: '', isRefreshing: false, quoteError: '' },
						fuhwaOmni: { quoteUpdatedAt: '尚未取得', savedAt: 0, quotedCount: 0, cacheMode: '', isRefreshing: false, quoteError: '' }
					},
					navsByFund: {
						taiwanTechnology: { navUpdatedAt: '', fetchedAt: 0, cacheExpiresAt: 0, dataDate: '', cacheMode: '', isRefreshing: false, navError: '' },
						taiwanDaba: { navUpdatedAt: '', fetchedAt: 0, cacheExpiresAt: 0, dataDate: '', cacheMode: '', isRefreshing: false, navError: '' },
						taiwanIntelligence: { navUpdatedAt: '', fetchedAt: 0, cacheExpiresAt: 0, dataDate: '', cacheMode: '', isRefreshing: false, navError: '' },
						fuhwaOmni: { navUpdatedAt: '', fetchedAt: 0, cacheExpiresAt: 0, dataDate: '', cacheMode: '', isRefreshing: false, navError: '' }
					},
					historiesByFund: {
						taiwanTechnology: { historyUpdatedAt: '', fetchedAt: 0, cacheExpiresAt: 0, dataDate: '', cacheMode: '', isRefreshing: false, historyError: '' },
						taiwanDaba: { historyUpdatedAt: '', fetchedAt: 0, cacheExpiresAt: 0, dataDate: '', cacheMode: '', isRefreshing: false, historyError: '' },
						taiwanIntelligence: { historyUpdatedAt: '', fetchedAt: 0, cacheExpiresAt: 0, dataDate: '', cacheMode: '', isRefreshing: false, historyError: '' },
						fuhwaOmni: { historyUpdatedAt: '', fetchedAt: 0, cacheExpiresAt: 0, dataDate: '', cacheMode: '', isRefreshing: false, historyError: '' }
					},
						holdingsSignalsByFund: {
							taiwanTechnology: { weightedChangePct: null, fundContributionPct: null, totalWeight: 0, quotedCount: 0, holdingsCount: 10, quoteUpdatedAt: '', savedAt: 0, cacheMode: '' },
							taiwanDaba: { weightedChangePct: null, fundContributionPct: null, totalWeight: 0, quotedCount: 0, holdingsCount: 10, quoteUpdatedAt: '', savedAt: 0, cacheMode: '' },
							taiwanIntelligence: { weightedChangePct: null, fundContributionPct: null, totalWeight: 0, quotedCount: 0, holdingsCount: 10, quoteUpdatedAt: '', savedAt: 0, cacheMode: '' },
							fuhwaOmni: { weightedChangePct: null, fundContributionPct: null, totalWeight: 0, quotedCount: 0, holdingsCount: 10, quoteUpdatedAt: '', savedAt: 0, cacheMode: '' }
						},
				funds: [
				{
					key: 'taiwanTechnology', shortName: '安聯台灣科技', name: '安聯台灣科技基金', englishName: 'Allianz Global Investors Taiwan Technology Fund', riskLevel: 'RR5', tags: ['單一國家股票型', '新臺幣計價', 'RR5'], nav: 760.91, navDate: '2026 / 08 / 11', holdingsDate: '2026 / 06 / 30', sourceUrl: 'https://tw.allianzgi.com/zh-tw/products-solutions/taiwan-onshore/allianz-global-investors-taiwan-technology-fund', historySourceUrl: 'https://fund.hncb.com.tw/w/wr/wr02_ACDD04-005003.djhtm', historyRange: '2026 / 06 / 30 — 2026 / 08 / 11', historyHigh: { value: 865.26, date: '2026 / 07 / 03' }, historyLow: { value: 597.91, date: '2026 / 07 / 30' }, summaryCards: [{ label: '前十大列示比重', value: '53.80%', detail: '依官方逐檔權重加總' }, { label: '半導體業比重', value: '29.86%', detail: '僅以前十大官方產業分類計算' }], historyNav: [{ date: '2026-07-03', value: 865.26, changePct: 0.94 }, { date: '2026-07-06', value: 828.00, changePct: -4.31 }, { date: '2026-07-09', value: 789.20, changePct: 0.73 }, { date: '2026-07-13', value: 768.38, changePct: -2.64 }, { date: '2026-07-16', value: 751.18, changePct: -2.13 }, { date: '2026-07-20', value: 667.70, changePct: -2.90 }, { date: '2026-07-23', value: 741.53, changePct: 0.19 }, { date: '2026-07-27', value: 703.03, changePct: -0.13 }, { date: '2026-07-30', value: 597.91, changePct: -0.73 }, { date: '2026-08-03', value: 690.54, changePct: 5.91 }, { date: '2026-08-06', value: 751.72, changePct: 1.70 }, { date: '2026-08-11', value: 760.91, changePct: 1.42 }], holdings: [{ rank: 1, name: '華邦電子', symbol: '2344.TW', weight: 7.44, price: 177.00, changePct: -0.56, market: 'Yahoo · TWSE' }, { rank: 2, name: '旺矽', symbol: '6223.TWO', weight: 7.32, price: 6600.00, changePct: 4.51, market: 'Yahoo · TPEX' }, { rank: 3, name: '台積電', symbol: '2330.TW', weight: 6.37, price: 2415.00, changePct: 0.84, market: 'Yahoo · TWSE' }, { rank: 4, name: '國巨', symbol: '2327.TW', weight: 5.65, price: 602.00, changePct: -2.43, market: 'Yahoo · TWSE' }, { rank: 5, name: '台燿', symbol: '6274.TWO', weight: 5.38, price: 1600.00, changePct: -0.31, market: 'Yahoo · TPEX' }, { rank: 6, name: '台光電子', symbol: '2383.TW', weight: 5.34, price: 5730.00, changePct: 3.52, market: 'Yahoo · TWSE' }, { rank: 7, name: '穎崴', symbol: '6515.TW', weight: 4.49, price: 7170.00, changePct: 3.61, market: 'Yahoo · TWSE' }, { rank: 8, name: '創意電子', symbol: '3443.TW', weight: 4.48, price: 5130.00, changePct: 3.53, market: 'Yahoo · TWSE' }, { rank: 9, name: '聯電', symbol: '2303.TW', weight: 4.24, price: 123.00, changePct: 0.00, market: 'Yahoo · TWSE' }, { rank: 10, name: '奇鋐', symbol: '3017.TW', weight: 3.09, price: 2910.00, changePct: 5.43, market: 'Yahoo · TWSE' }], insights: [{ kicker: '配置觀察', title: '以半導體與電子零組件為主軸', text: '以前十大公開標的的官方產業分類計算，半導體業合計 29.86%，電子零組件業合計 16.37%。其餘配置包含科技與電腦週邊，反映基金對台灣科技供應鏈的集中布局。' }, { kicker: '投資目標', title: '鎖定台灣科技產業', text: '官方資料說明，經理團隊以品質、成長與價值作為篩選基礎，並以台灣科技產業的成長前景為主要投資方向。' }]
				},
				{
					key: 'taiwanDaba', shortName: '安聯台灣大壩', name: '安聯台灣大壩基金-A類型', englishName: 'Allianz Global Investors Taiwan Fund', riskLevel: 'RR4', tags: ['單一國家股票型', '新臺幣計價', 'RR4'], nav: 313.43, navDate: '2026 / 08 / 11', holdingsDate: '2026 / 06 / 30', sourceUrl: 'https://tw.allianzgi.com/zh-tw/products-solutions/taiwan-onshore/allianz-global-investors-taiwan-fund-a-twd', historySourceUrl: 'https://fund.megabank.com.tw/w/wr/wr02_ACDD01-4101.djhtm', historyRange: '2026 / 06 / 30 — 2026 / 08 / 11', historyHigh: { value: 352.14, date: '2026 / 07 / 03' }, historyLow: { value: 246.18, date: '2026 / 07 / 30' }, summaryCards: [{ label: '前十大列示比重', value: '58.50%', detail: '依官方逐檔權重加總' }, { label: '半導體業比重', value: '33.01%', detail: '僅以前十大官方產業分類計算' }], historyNav: [{ date: '2026-07-03', value: 352.14, changePct: 1.84 }, { date: '2026-07-06', value: 333.97, changePct: -5.16 }, { date: '2026-07-09', value: 323.50, changePct: 1.61 }, { date: '2026-07-13', value: 317.43, changePct: -1.88 }, { date: '2026-07-16', value: 306.20, changePct: -3.17 }, { date: '2026-07-20', value: 271.88, changePct: -2.73 }, { date: '2026-07-23', value: 304.54, changePct: 0.20 }, { date: '2026-07-27', value: 287.61, changePct: 0.04 }, { date: '2026-07-30', value: 246.18, changePct: -0.21 }, { date: '2026-08-03', value: 285.18, changePct: 6.20 }, { date: '2026-08-05', value: 306.42, changePct: 4.18 }, { date: '2026-08-06', value: 311.29, changePct: 1.59 }, { date: '2026-08-07', value: 303.65, changePct: -2.45 }, { date: '2026-08-10', value: 309.15, changePct: 1.81 }, { date: '2026-08-11', value: 313.43, changePct: 1.38 }], holdings: [{ rank: 1, name: '旺矽', symbol: '6223.TWO', weight: 12.17, price: null, changePct: null, market: 'Yahoo · TPEX' }, { rank: 2, name: '台燿', symbol: '6274.TWO', weight: 7.19, price: null, changePct: null, market: 'Yahoo · TPEX' }, { rank: 3, name: '穎崴', symbol: '6515.TW', weight: 7.11, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 4, name: '台光電子', symbol: '2383.TW', weight: 6.65, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 5, name: '台積電', symbol: '2330.TW', weight: 5.20, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 6, name: '欣興', symbol: '3037.TW', weight: 5.06, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 7, name: '信驊科技', symbol: '5274.TWO', weight: 4.75, price: null, changePct: null, market: 'Yahoo · TPEX' }, { rank: 8, name: '景碩科技', symbol: '3189.TW', weight: 3.78, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 9, name: '南電', symbol: '8046.TW', weight: 3.40, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 10, name: '台達電子', symbol: '2308.TW', weight: 3.19, price: null, changePct: null, market: 'Yahoo · TWSE' }], insights: [{ kicker: '配置觀察', title: '半導體與電子零組件占前十大核心', text: '以前十大公開標的的官方產業分類計算，半導體業合計 33.01%，電子零組件業合計 22.30%。配置同時涵蓋晶片測試、PCB 與電子材料等台灣科技供應鏈環節。' }, { kicker: '投資目標', title: '聚焦台灣上市與上櫃股票', text: '官方資料顯示，基金以台灣股票市場為主要投資範圍，並依品質、成長與價值的基本面研究架構篩選投資標的。' }]
					},
					{
						key: 'taiwanIntelligence', shortName: '安聯台灣智慧', name: '安聯台灣智慧基金', englishName: 'Allianz Global Investors Taiwan Intelligence Trends Fund', riskLevel: 'RR4', tags: ['單一國家股票型', '新臺幣計價', 'RR4'], nav: 409.63, navDate: '2026 / 08 / 11', holdingsDate: '2026 / 06 / 30', sourceUrl: 'https://tw.allianzgi.com/zh-tw/products-solutions/taiwan-onshore/allianz-global-investors-taiwan-intelligence-trends-fund', performanceSourceUrl: 'https://tw.allianzgi.com/zh-tw/products-solutions/taiwan-onshore/allianz-global-investors-taiwan-intelligence-trends-fund?nav=navperformance', historySourceUrl: 'https://fund.hncb.com.tw/w/wr/wr02_ACDD19-005019.djhtm', historyRange: '2026 / 06 / 30 — 2026 / 08 / 11', historyHigh: { value: 452.02, date: '2026 / 07 / 03' }, historyLow: { value: 324.63, date: '2026 / 07 / 30' }, summaryCards: [{ label: '前十大列示比重', value: '56.98%', detail: '依官方逐檔權重加總' }, { label: '半導體業比重', value: '30.95%', detail: '僅以前十大官方產業分類計算' }], historyNav: [{ date: '2026-08-05', value: 398.76, changePct: 3.64 }, { date: '2026-08-06', value: 404.50, changePct: 1.44 }, { date: '2026-08-07', value: 394.91, changePct: -2.37 }, { date: '2026-08-10', value: 405.66, changePct: 2.72 }, { date: '2026-08-11', value: 409.63, changePct: 0.98 }], holdings: [{ rank: 1, name: '旺矽', symbol: '6223.TWO', weight: 8.28, price: null, changePct: null, market: 'Yahoo · TPEX' }, { rank: 2, name: '華邦電子', symbol: '2344.TW', weight: 7.46, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 3, name: '台光電子', symbol: '2383.TW', weight: 6.28, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 4, name: '信驊科技', symbol: '5274.TWO', weight: 5.86, price: null, changePct: null, market: 'Yahoo · TPEX' }, { rank: 5, name: '台燿', symbol: '6274.TWO', weight: 5.72, price: null, changePct: null, market: 'Yahoo · TPEX' }, { rank: 6, name: '南亞科', symbol: '2408.TW', weight: 5.41, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 7, name: '台積電', symbol: '2330.TW', weight: 4.71, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 8, name: '景碩科技', symbol: '3189.TW', weight: 4.64, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 9, name: '智邦', symbol: '2345.TW', weight: 4.37, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 10, name: '欣興', symbol: '3037.TW', weight: 4.25, price: null, changePct: null, market: 'Yahoo · TWSE' }], insights: [{ kicker: '配置觀察', title: '半導體與電子零組件為前十大核心', text: '以前十大公開標的的官方產業分類計算，半導體業合計 30.95%，電子零組件業合計 16.25%，並涵蓋科技與通訊網路標的。' }, { kicker: '投資目標', title: '聚焦五大未來經濟趨勢', text: '官方資料說明，基金以精緻生活、藍海創新、大國崛起、台灣品牌及天然資源與環保等趨勢，發掘台灣產業投資機會。' }]
					},
					{
						key: 'fuhwaOmni', shortName: '復華全方位 A', name: '復華全方位基金A類型', englishName: 'Fuh Hwa OMNI Fund', riskLevel: 'RR4', tags: ['國內股票型', '新臺幣計價', 'RR4'], nav: 196.74, navDate: '2026 / 08 / 12', holdingsDate: '2026 / 06 / 30', sourceUrl: 'https://www.fhtrust.com.tw/funds/funds_detail/15', performanceSourceUrl: 'https://www.fhtrust.com.tw/funds/funds_detail/15#nav', historySourceUrl: 'https://fund.hncb.com.tw/w/wr/wr02_ACFH15-031015.djhtm', historyRange: '2026 / 06 / 30 — 2026 / 08 / 11', historyHigh: { value: 215.43, date: '2026 / 07 / 03' }, historyLow: { value: 149.93, date: '2026 / 07 / 30' }, summaryCards: [{ label: '前十大列示比重', value: '56.97%', detail: '依官方頁面列示' }, { label: '電子零組件業比重', value: '27.62%', detail: '僅以前十大官方產業分類計算' }], historyNav: [{ date: '2026-08-05', value: 185.34, changePct: 3.44 }, { date: '2026-08-06', value: 188.95, changePct: 1.95 }, { date: '2026-08-07', value: 184.73, changePct: -2.23 }, { date: '2026-08-10', value: 189.06, changePct: 2.34 }, { date: '2026-08-11', value: 191.60, changePct: 1.34 }], holdings: [{ rank: 1, name: '國巨', symbol: '2327.TW', weight: 9.46, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 2, name: '欣興', symbol: '3037.TW', weight: 7.05, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 3, name: '聯發科', symbol: '2454.TW', weight: 6.67, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 4, name: '台光電', symbol: '2383.TW', weight: 6.23, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 5, name: '台積電', symbol: '2330.TW', weight: 5.90, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 6, name: '南電', symbol: '8046.TW', weight: 4.88, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 7, name: '華邦電', symbol: '2344.TW', weight: 4.86, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 8, name: '聯電', symbol: '2303.TW', weight: 4.29, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 9, name: '智邦', symbol: '2345.TW', weight: 3.88, price: null, changePct: null, market: 'Yahoo · TWSE' }, { rank: 10, name: '景碩', symbol: '3189.TW', weight: 3.75, price: null, changePct: null, market: 'Yahoo · TWSE' }], insights: [{ kicker: '配置觀察', title: '電子零組件與半導體配置均衡', text: '以前十大公開標的的官方產業分類計算，電子零組件業合計 27.62%，半導體業合計 25.47%，並配置通信網路標的。' }, { kicker: '投資目標', title: '兼顧分散風險與長期投資利得', text: '官方基本資料說明，基金以分散風險、確保基金安全，並積極追求長期投資利得及維持收益安定為目標。' }]
					}
				]
		};
	},
	computed: {
				activeFund() { return this.funds.find(fund => fund.key === this.activeFundKey) || this.funds[0]; },
				activeQuote() { return this.quotesByFund[this.activeFundKey]; },
				activeNav() { return this.navsByFund[this.activeFundKey]; },
			activeHistory() { return this.historiesByFund[this.activeFundKey]; },
				recentNavs() { return this.activeFund.historyNav.slice(-5).reverse(); },
							holdingsWeightedChangePct() { const liveCalculation = this.calculateHoldingsWeightedChange(this.activeFund.holdings); const hasLoadedYahooQuotes = ['local', 'remote'].includes(this.activeQuote?.cacheMode) && this.activeQuote?.quotedCount > 0; if (hasLoadedYahooQuotes && Number.isFinite(liveCalculation.weightedChangePct)) return liveCalculation.weightedChangePct; const cachedSignal = this.holdingsSignalsByFund?.[this.activeFundKey]; if (Number.isFinite(cachedSignal?.weightedChangePct)) return cachedSignal.weightedChangePct; return liveCalculation.weightedChangePct; },
							holdingsFundContributionPct() { const liveCalculation = this.calculateHoldingsWeightedChange(this.activeFund.holdings); const hasLoadedYahooQuotes = ['local', 'remote'].includes(this.activeQuote?.cacheMode) && this.activeQuote?.quotedCount > 0; if (hasLoadedYahooQuotes && Number.isFinite(liveCalculation.fundContributionPct)) return liveCalculation.fundContributionPct; const cachedSignal = this.holdingsSignalsByFund?.[this.activeFundKey]; if (Number.isFinite(cachedSignal?.fundContributionPct)) return cachedSignal.fundContributionPct; return liveCalculation.fundContributionPct; },
					holdingsChangeAssessment() { return this.getHoldingsChangeAssessment(this.holdingsFundContributionPct); },
						holdingsSignalStatus() { const signal = this.holdingsSignalsByFund?.[this.activeFundKey]; if (!Number.isFinite(signal?.weightedChangePct)) return '尚無本機紀錄；成功取得 Yahoo 報價後會自動儲存'; const source = signal.cacheMode === 'local' ? '已由本機快取載入' : '已隨 Yahoo 報價同步更新並儲存於本機'; const updatedAt = signal.quoteUpdatedAt || (signal.savedAt ? this.formatQuoteTime(signal.savedAt) : '尚未標示'); const coverage = Number.isFinite(signal.quotedCount) && Number.isFinite(signal.holdingsCount) ? `${signal.quotedCount}/${signal.holdingsCount} 檔、權重 ${signal.totalWeight.toFixed(2)}%` : '公開持股'; return `${source}：${updatedAt}（${coverage}）；${this.getHoldingsNavDateStatus(updatedAt, this.activeFund.navDate)}`; },
				quoteStatus() { if (this.activeQuote.isRefreshing) return '正在向 Yahoo 股市更新報價'; if (this.activeQuote.quoteError) return this.activeQuote.quoteError; if (this.activeQuote.cacheMode === 'local') return `已由本機報價快取載入：${this.activeQuote.quoteUpdatedAt}（${this.activeQuote.quotedCount} 檔）`; if (this.activeQuote.cacheMode === 'remote') return `Yahoo 報價已更新並儲存：${this.activeQuote.quoteUpdatedAt}（${this.activeQuote.quotedCount} 檔）`; return this.isQuoteAutoWindow() ? '平日 09:00–14:00 每 5 分鐘自動更新' : '非自動更新時段；可手動更新 Yahoo 股價'; },
			navStatus() { if (this.activeNav.isRefreshing) return '正在取得最新官方淨值'; if (this.activeNav.navError) return this.activeNav.navUpdatedAt ? `${this.activeNav.navError} 前次成功更新：${this.activeNav.navUpdatedAt}` : this.activeNav.navError; if (this.activeNav.cacheMode === 'cleared') return this.cacheClearNotice; if (this.activeNav.cacheMode === 'local') return `已由本機快取載入：${this.activeNav.navUpdatedAt}`; return this.activeNav.navUpdatedAt ? `官方淨值已更新：${this.activeNav.navUpdatedAt}` : '資料快取失效時才取得最新官方淨值'; },
			historyStatus() { if (this.activeHistory.isRefreshing) return '正在更新最近五筆公開淨值'; if (this.activeHistory.historyError) return this.activeHistory.historyUpdatedAt ? `${this.activeHistory.historyError} 前次成功更新：${this.activeHistory.historyUpdatedAt}` : this.activeHistory.historyError; if (this.activeHistory.cacheMode === 'cleared') return this.cacheClearNotice; if (this.activeHistory.cacheMode === 'local') return `已由本機快取載入：${this.activeHistory.historyUpdatedAt}`; return this.activeHistory.historyUpdatedAt ? `最近五筆已更新：${this.activeHistory.historyUpdatedAt}` : '資料快取失效時才更新最近五筆'; },
				navTimingStatus() { return this.getFundTimingText(this.activeNav); },
				historyTimingStatus() { return this.getFundTimingText(this.activeHistory); }
	},
		methods: {
			formatDate(date) { return date.slice(5).replace('-', ' / '); },
			formatPercent(value) { return Number.isFinite(value) ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` : '—'; },
			formatPrice(value) { return Number.isFinite(value) ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'; },
			formatQuoteChange(value) { return Number.isFinite(value) ? `TWD ${value > 0 ? '+' : ''}${this.formatPrice(value)}` : 'TWD —'; },
			getQuoteChangeAmount(holding) { if (Number.isFinite(holding?.priceChange)) return holding.priceChange; if (Number.isFinite(holding?.price) && Number.isFinite(holding?.previousClose)) return holding.price - holding.previousClose; if (Number.isFinite(holding?.price) && Number.isFinite(holding?.changePct) && 100 + holding.changePct !== 0) { const derivedPreviousClose = holding.price / (1 + holding.changePct / 100); return holding.price - derivedPreviousClose; } return null; },
			getChangeClass(value) { if (value > 0) return 'fund_positive'; if (value < 0) return 'fund_negative'; return 'fund_flat'; },
				formatQuoteTime(timestamp) { return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp)).replace(/\//g, ' / ').replace(',', ''); },
				formatCountdown(milliseconds) { const seconds = Math.max(0, Math.ceil(milliseconds / 1000)); const minutes = Math.floor(seconds / 60); const remainSeconds = seconds % 60; return minutes > 0 ? `${minutes} 分 ${String(remainSeconds).padStart(2, '0')} 秒` : `${remainSeconds} 秒`; },
				getRefreshTimingText(state) { if (!Number.isFinite(state.fetchedAt) || state.fetchedAt <= 0) return '取得後顯示快取與自動更新倒數'; const cacheRemaining = this.formatCountdown(Math.max(0, state.cacheExpiresAt - this.countdownNow)); const autoRemaining = this.formatCountdown(Math.max(0, state.fetchedAt + 30 * 60 * 1000 - this.countdownNow)); return `快取剩餘 ${cacheRemaining} · 下次自動更新 ${autoRemaining}`; },
				getFundTimingText(state) { const expectedDate = this.getExpectedFundDate(); if (!state.dataDate) return `目標資料日期 ${expectedDate}；快取失效時更新`; if (this.isFundPublishWindow()) return state.dataDate === expectedDate ? `資料日期 ${state.dataDate} · 已符合當日淨值` : `資料日期 ${state.dataDate} · 平日 16:00 後持續檢查`; return `資料日期 ${state.dataDate} · 平日 16:00 後再檢查`; },
				getTiming() {
					if (window.FundUpdateTiming) return window.FundUpdateTiming;
					const getTaipeiParts = (timestamp = Date.now()) => { const values = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(timestamp)).filter(part => part.type !== 'literal').map(part => [part.type, part.value])); return { year: Number(values.year), month: Number(values.month), day: Number(values.day), hour: Number(values.hour), minute: Number(values.minute) }; };
					const formatDate = parts => `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
					const normalizeFundDate = value => { const match = String(value || '').replace(/\s/g, '').match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/); return match ? `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}` : ''; };
					const isWeekday = parts => { const day = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay(); return day >= 1 && day <= 5; };
					const previousWeekday = parts => { const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)); do { date.setUTCDate(date.getUTCDate() - 1); } while (date.getUTCDay() === 0 || date.getUTCDay() === 6); return formatDate({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }); };
					const isPublishWindow = timestamp => { const parts = getTaipeiParts(timestamp); return isWeekday(parts) && parts.hour * 60 + parts.minute >= 16 * 60; };
					return {
						normalizeFundDate,
						isTaipeiStockAutoWindow(timestamp = Date.now()) { const parts = getTaipeiParts(timestamp); const minutes = parts.hour * 60 + parts.minute; return isWeekday(parts) && minutes >= 9 * 60 && minutes < 14 * 60; },
						getQuoteAutoSlot(timestamp = Date.now()) { const parts = getTaipeiParts(timestamp); return this.isTaipeiStockAutoWindow(timestamp) ? `${formatDate(parts)}-${String(parts.hour).padStart(2, '0')}-${Math.floor(parts.minute / 5)}` : ''; },
						isTaipeiFundPublishWindow(timestamp = Date.now()) { return isPublishWindow(timestamp); },
						getExpectedFundNavDate(timestamp = Date.now()) { const parts = getTaipeiParts(timestamp); return isPublishWindow(timestamp) ? formatDate(parts) : previousWeekday(parts); },
						isExpectedFundNavDate(value, timestamp = Date.now()) { return normalizeFundDate(value) === this.getExpectedFundNavDate(timestamp); }
					};
				},
				isQuoteAutoWindow() { return Boolean(this.getTiming()?.isTaipeiStockAutoWindow(Date.now())); },
				isFundPublishWindow() { return Boolean(this.getTiming()?.isTaipeiFundPublishWindow(Date.now())); },
				getExpectedFundDate() { return this.getTiming()?.getExpectedFundNavDate(Date.now()) || ''; },
				getQuoteAutoSlot() { return this.getTiming()?.getQuoteAutoSlot(Date.now()) || ''; },
				isExpectedFundDate(value) { return Boolean(this.getTiming()?.isExpectedFundNavDate(value, Date.now())); },
				getFundStorageKey(type, fundKey) { const version = type === 'holdings-signal' ? 'v2' : 'v1'; return `cashflow-manager:fund-${type}:${version}:${fundKey}`; },
				readFundStorage(type, fundKey) { try { const value = localStorage.getItem(this.getFundStorageKey(type, fundKey)); const snapshot = value ? JSON.parse(value) : null; return snapshot?.fundKey === fundKey ? snapshot : null; } catch { return null; } },
				writeFundStorage(type, fundKey, snapshot) { try { localStorage.setItem(this.getFundStorageKey(type, fundKey), JSON.stringify({ ...snapshot, fundKey, savedAt: Date.now() })); } catch {} },
				getHoldingsNavDateStatus(quoteUpdatedAt, navDate) { const quoteDate = this.normalizeFundDate(quoteUpdatedAt); const normalizedNavDate = this.normalizeFundDate(navDate); if (!quoteDate || !normalizedNavDate) return '尚無法確認是否與淨值同日'; return quoteDate === normalizedNavDate ? `報價與淨值同為 ${quoteDate}，可作同日方向對照` : `報價日期 ${quoteDate}、淨值日期 ${normalizedNavDate}，僅供方向觀察`; },
				createYahooQuoteSnapshot(fundKey, fetchedAt = Date.now()) { const targetFund = this.funds.find(fund => fund.key === fundKey); const quoteState = this.quotesByFund[fundKey]; if (!targetFund || !quoteState) return null; const quotes = targetFund.holdings.filter(holding => Number.isFinite(holding?.price) && Number.isFinite(holding?.previousClose) && Number(holding.previousClose) > 0).map(holding => ({ symbol: holding.symbol, price: Number(holding.price), previousClose: Number(holding.previousClose), priceChange: Number.isFinite(holding.priceChange) ? Number(holding.priceChange) : Number(holding.price) - Number(holding.previousClose), changePct: Number.isFinite(holding.changePct) ? Number(holding.changePct) : ((Number(holding.price) - Number(holding.previousClose)) / Number(holding.previousClose)) * 100 })); if (!quotes.length) return null; return { fundKey, holdingsDate: targetFund.holdingsDate, quoteUpdatedAt: quoteState.quoteUpdatedAt, quotes, fetchedAt: Number(fetchedAt) || Date.now() }; },
				applyYahooQuoteSnapshot(fundKey, snapshot, cacheMode = 'remote') { const targetFund = this.funds.find(fund => fund.key === fundKey); const quoteState = this.quotesByFund[fundKey]; const quoteRows = Array.isArray(snapshot?.quotes) ? snapshot.quotes : []; if (!targetFund || !quoteState || snapshot?.fundKey !== fundKey || snapshot.holdingsDate !== targetFund.holdingsDate || !quoteRows.length) return false; const allowedSymbols = new Set(targetFund.holdings.map(holding => holding.symbol)); const quotes = quoteRows.map(quote => { const price = Number(quote?.price); const previousClose = Number(quote?.previousClose); return { symbol: String(quote?.symbol || ''), price, previousClose, priceChange: price - previousClose, changePct: previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : null }; }).filter(quote => allowedSymbols.has(quote.symbol) && Number.isFinite(quote.price) && Number.isFinite(quote.previousClose) && quote.previousClose > 0 && Number.isFinite(quote.priceChange) && Number.isFinite(quote.changePct)); if (!quotes.length || new Set(quotes.map(quote => quote.symbol)).size !== quotes.length) return false; const quoteBySymbol = new Map(quotes.map(quote => [quote.symbol, quote])); targetFund.holdings = targetFund.holdings.map(holding => { const quote = quoteBySymbol.get(holding.symbol); return quote ? { ...holding, price: quote.price, previousClose: quote.previousClose, priceChange: quote.priceChange, changePct: quote.changePct } : holding; }); quoteState.quoteUpdatedAt = String(snapshot.quoteUpdatedAt || this.formatQuoteTime(snapshot.savedAt || snapshot.fetchedAt || Date.now())); quoteState.savedAt = Number(snapshot.savedAt || snapshot.fetchedAt || Date.now()); quoteState.quotedCount = quotes.length; quoteState.cacheMode = cacheMode; return true; },
					hydrateYahooQuoteCache(fundKey) { const snapshot = this.readFundStorage('quotes', fundKey); const hydrated = snapshot ? this.applyYahooQuoteSnapshot(fundKey, snapshot, 'local') : false; if (hydrated) this.refreshHoldingsSignalFromCurrentQuotes(fundKey, 'local', true); return hydrated; },
						persistYahooQuoteSnapshot(fundKey, fetchedAt = Date.now()) { const snapshot = this.createYahooQuoteSnapshot(fundKey, fetchedAt); if (!snapshot || !this.applyYahooQuoteSnapshot(fundKey, snapshot, 'remote')) return false; this.writeFundStorage('quotes', fundKey, snapshot); return true; },
						refreshHoldingsSignalFromCurrentQuotes(fundKey, cacheMode = 'remote', persist = false) { const snapshot = this.createHoldingsSignalSnapshot(fundKey); if (!snapshot || !this.applyHoldingsSignalSnapshot(fundKey, snapshot, cacheMode)) return false; if (persist) this.writeFundStorage('holdings-signal', fundKey, snapshot); return true; },
						syncYahooQuoteAndHoldingsSignal(fundKey, fetchedAt = Date.now(), quotedCount = 0) { const quoteState = this.quotesByFund[fundKey]; if (!quoteState) return false; quoteState.quotedCount = Number.isFinite(Number(quotedCount)) ? Number(quotedCount) : 0; const quoteStored = this.persistYahooQuoteSnapshot(fundKey, fetchedAt); const signalStored = this.refreshHoldingsSignalFromCurrentQuotes(fundKey, 'remote', true); return quoteStored && signalStored; },
				calculateHoldingsWeightedChange(holdings = []) { const quotedHoldings = holdings.filter(holding => Number.isFinite(holding?.weight) && Number.isFinite(holding?.changePct)); const totalWeight = quotedHoldings.reduce((total, holding) => total + holding.weight, 0); const weightedReturnSum = quotedHoldings.reduce((total, holding) => total + holding.weight * holding.changePct, 0); return { weightedChangePct: totalWeight > 0 ? weightedReturnSum / totalWeight : null, fundContributionPct: totalWeight > 0 ? weightedReturnSum / 100 : null, totalWeight, quotedCount: quotedHoldings.length, holdingsCount: Array.isArray(holdings) ? holdings.length : 0 }; },
				getHoldingsChangeAssessment(value) { if (!Number.isFinite(value)) return '等待 Yahoo 報價更新'; if (value > 0) return '列示持股整體偏多'; if (value < 0) return '列示持股整體偏空'; return '列示持股大致持平'; },
				createHoldingsSignalSnapshot(fundKey) { const targetFund = this.funds.find(fund => fund.key === fundKey); const quoteState = this.quotesByFund[fundKey]; const calculation = targetFund ? this.calculateHoldingsWeightedChange(targetFund.holdings) : null; if (!targetFund || !calculation || !Number.isFinite(calculation.weightedChangePct) || !Number.isFinite(calculation.fundContributionPct) || calculation.totalWeight <= 0) return null; return { fundKey, holdingsDate: targetFund.holdingsDate, weightedChangePct: calculation.weightedChangePct, fundContributionPct: calculation.fundContributionPct, totalWeight: calculation.totalWeight, quotedCount: calculation.quotedCount, holdingsCount: calculation.holdingsCount, quoteUpdatedAt: quoteState?.quoteUpdatedAt || '', fetchedAt: Date.now() }; },
				applyHoldingsSignalSnapshot(fundKey, snapshot, cacheMode = 'remote') { const targetFund = this.funds.find(fund => fund.key === fundKey); const signalState = this.holdingsSignalsByFund[fundKey]; if (!targetFund || !signalState || snapshot?.fundKey !== fundKey || snapshot.holdingsDate !== targetFund.holdingsDate || !Number.isFinite(Number(snapshot.weightedChangePct)) || !Number.isFinite(Number(snapshot.fundContributionPct)) || !Number.isFinite(Number(snapshot.totalWeight)) || Number(snapshot.totalWeight) <= 0 || !Number.isFinite(Number(snapshot.quotedCount)) || !Number.isFinite(Number(snapshot.holdingsCount))) return false; signalState.weightedChangePct = Number(snapshot.weightedChangePct); signalState.fundContributionPct = Number(snapshot.fundContributionPct); signalState.totalWeight = Number(snapshot.totalWeight); signalState.quotedCount = Number(snapshot.quotedCount); signalState.holdingsCount = Number(snapshot.holdingsCount); signalState.quoteUpdatedAt = String(snapshot.quoteUpdatedAt || ''); signalState.savedAt = Number(snapshot.savedAt || snapshot.fetchedAt || Date.now()); signalState.cacheMode = cacheMode; return true; },
				hydrateHoldingsSignalCache(fundKey) { const snapshot = this.readFundStorage('holdings-signal', fundKey); return snapshot ? this.applyHoldingsSignalSnapshot(fundKey, snapshot, 'local') : false; },
				persistHoldingsSignalSnapshot(fundKey) { const snapshot = this.createHoldingsSignalSnapshot(fundKey); if (!snapshot || !this.applyHoldingsSignalSnapshot(fundKey, snapshot, 'remote')) return false; this.writeFundStorage('holdings-signal', fundKey, snapshot); return true; },
				clearFundNavCache() { this.funds.forEach(fund => { ['nav', 'history'].forEach(type => { try { localStorage.removeItem(this.getFundStorageKey(type, fund.key)); } catch {} }); this.navsByFund[fund.key].cacheMode = 'cleared'; this.historiesByFund[fund.key].cacheMode = 'cleared'; }); this.cacheClearNotice = '已清除本機淨值快取；下次進入時會重新取得資料'; },
				applyNavSnapshot(fundKey, snapshot, cacheMode = 'remote') { const targetFund = this.funds.find(fund => fund.key === fundKey); const navState = this.navsByFund[fundKey]; if (!targetFund || !navState || !Number.isFinite(Number(snapshot?.nav)) || !snapshot?.navDate) return false; targetFund.nav = Number(snapshot.nav); targetFund.navDate = String(snapshot.navDate).replace(/\//g, ' / '); targetFund.navChangePct = typeof snapshot.changePct === 'number' && Number.isFinite(snapshot.changePct) ? Number(snapshot.changePct) : null; if (snapshot.sourceUrl) targetFund.sourceUrl = snapshot.sourceUrl; navState.navUpdatedAt = this.formatQuoteTime(snapshot.savedAt || snapshot.fetchedAt || Date.now()); navState.fetchedAt = Number(snapshot.fetchedAt) || Date.now(); navState.cacheExpiresAt = Number(snapshot.cacheExpiresAt) || navState.fetchedAt + 10 * 60 * 1000; navState.dataDate = this.normalizeFundDate(targetFund.navDate); navState.cacheMode = cacheMode; this.syncNavChangePct(targetFund); return true; },
				applyHistorySnapshot(fundKey, snapshot, cacheMode = 'remote') { const targetFund = this.funds.find(fund => fund.key === fundKey); const historyState = this.historiesByFund[fundKey]; const rows = Array.isArray(snapshot?.rows) ? snapshot.rows.map(item => ({ date: String(item.date).replace(/\//g, '-'), value: Number(item.value), changePct: Number(item.changePct) })) : []; if (!targetFund || !historyState || rows.length !== 5 || rows.some(item => !item.date || !Number.isFinite(item.value) || !Number.isFinite(item.changePct))) return false; targetFund.historyNav = rows; targetFund.historyRange = snapshot.historyRange || targetFund.historyRange.replace(/— .*/, `— ${String(rows[rows.length - 1].date).replace(/-/g, ' / ')}`); if (snapshot.sourceUrl) targetFund.historySourceUrl = snapshot.sourceUrl; historyState.historyUpdatedAt = this.formatQuoteTime(snapshot.savedAt || snapshot.fetchedAt || Date.now()); historyState.fetchedAt = Number(snapshot.fetchedAt) || Date.now(); historyState.cacheExpiresAt = Number(snapshot.cacheExpiresAt) || historyState.fetchedAt + 10 * 60 * 1000; historyState.dataDate = this.normalizeFundDate(rows[rows.length - 1].date); historyState.cacheMode = cacheMode; this.syncNavChangePct(targetFund); return true; },
				hydrateFundCache(fundKey) { const navSnapshot = this.readFundStorage('nav', fundKey); const historySnapshot = this.readFundStorage('history', fundKey); const navLoaded = navSnapshot && this.isExpectedFundDate(navSnapshot.navDate) ? this.applyNavSnapshot(fundKey, navSnapshot, 'local') : false; const historyDate = historySnapshot?.rows?.[historySnapshot.rows.length - 1]?.date; const historyLoaded = historySnapshot && this.isExpectedFundDate(historyDate) ? this.applyHistorySnapshot(fundKey, historySnapshot, 'local') : false; return { navLoaded, historyLoaded }; },
				async refreshFundSnapshots() { const fundKey = this.activeFundKey; const cache = this.hydrateFundCache(fundKey); const requests = []; if (!cache.navLoaded) requests.push(this.refreshOfficialNav(true, fundKey)); if (!cache.historyLoaded) requests.push(this.refreshRecentHistoryNav(true, fundKey)); if (requests.length) await Promise.all(requests); },
				maybeAutoRefreshYahooQuotes() { if (!this.isQuoteAutoWindow()) return; const fundKey = this.activeFundKey; const slot = this.getQuoteAutoSlot(); if (!slot || this.quoteAutoSlotByFund[fundKey] === slot) return; this.quoteAutoSlotByFund[fundKey] = slot; this.refreshYahooQuotes(fundKey); },
			getWorkerBaseUrl() { return typeof window.CASHFLOW_QUOTE_PROXY_URL === 'string' ? window.CASHFLOW_QUOTE_PROXY_URL.trim().replace(/\/+$/, '') : ''; },
			getQuoteRequest(fundKey) {
				const workerBaseUrl = this.getWorkerBaseUrl();
				if (workerBaseUrl) {
					const endpoint = new URL(`${workerBaseUrl}/quotes`);
					endpoint.searchParams.set('fund', fundKey);
					return { url: endpoint.toString(), isExternalProxy: true };
				}
				if (window.location.hostname.endsWith('.github.io')) throw new Error('GitHub Pages 尚未設定 Cloudflare Worker 報價端點');
				const input = encodeURIComponent(JSON.stringify({ json: { fund: fundKey, force: true } }));
				return { url: `/api/trpc/market.yahooQuotes?input=${input}`, isExternalProxy: false };
			},
				getNavRequest(fundKey, force = false) {
				const workerBaseUrl = this.getWorkerBaseUrl();
				if (workerBaseUrl) {
						const endpoint = new URL(`${workerBaseUrl}/nav`);
						endpoint.searchParams.set('fund', fundKey);
							endpoint.searchParams.set('cacheVersion', '4');
							if (force) endpoint.searchParams.set('force', '1');
					return { url: endpoint.toString(), isExternalProxy: true };
				}
				if (window.location.hostname.endsWith('.github.io')) throw new Error('GitHub Pages 尚未設定 Cloudflare Worker 淨值端點');
					const input = encodeURIComponent(JSON.stringify({ json: { fund: fundKey, force } }));
				return { url: `/api/trpc/market.officialNav?input=${input}`, isExternalProxy: false };
			},
				getHistoryRequest(fundKey, force = false) {
				const workerBaseUrl = this.getWorkerBaseUrl();
				if (workerBaseUrl) {
					const endpoint = new URL(`${workerBaseUrl}/history`);
					endpoint.searchParams.set('fund', fundKey);
						endpoint.searchParams.set('cacheVersion', '3');
						if (force) endpoint.searchParams.set('force', '1');
					return { url: endpoint.toString(), isExternalProxy: true };
				}
				if (window.location.hostname.endsWith('.github.io')) throw new Error('GitHub Pages 尚未設定 Cloudflare Worker 歷史淨值端點');
					const input = encodeURIComponent(JSON.stringify({ json: { fund: fundKey, force } }));
				return { url: `/api/trpc/market.recentHistoryNav?input=${input}`, isExternalProxy: false };
			},
						selectFund(fundKey) { if (fundKey === this.activeFundKey) return; this.activeFundKey = fundKey; this.$nextTick(() => { this.hydrateHoldingsSignalCache(fundKey); this.hydrateYahooQuoteCache(fundKey); this.maybeAutoRefreshYahooQuotes(); this.refreshFundSnapshots(); }); },
				async refreshYahooQuotes(fundKey = this.activeFundKey) {
					if (typeof fundKey !== 'string' || !this.quotesByFund[fundKey]) fundKey = this.activeFundKey;
			const quoteState = this.quotesByFund[fundKey];
			if (quoteState.isRefreshing) return;
						quoteState.isRefreshing = true;
						quoteState.quoteError = '';
						try {
							const quoteRequest = this.getQuoteRequest(fundKey);
							const abortController = new AbortController();
							const requestTimeoutMs = quoteRequest.isExternalProxy ? 25 * 1000 : 12 * 1000;
							const requestTimeout = window.setTimeout(() => abortController.abort(), requestTimeoutMs);
					let response;
					try { response = await fetch(quoteRequest.url, { cache: 'no-store', credentials: quoteRequest.isExternalProxy ? 'omit' : 'same-origin', signal: abortController.signal }); } finally { window.clearTimeout(requestTimeout); }
					if (!response.ok) throw new Error(`報價服務回應 ${response.status}`);
					const payload = await response.json();
					const snapshot = quoteRequest.isExternalProxy ? payload : payload?.result?.data?.json;
				const successfulQuotes = snapshot?.quotes;
				if (!Array.isArray(successfulQuotes) || !successfulQuotes.length || snapshot.fundKey !== fundKey) throw new Error('Yahoo 股市暫時無法提供報價');
				const quoteBySymbol = new Map(successfulQuotes.map(quote => [quote.symbol, quote]));
					const targetFund = this.funds.find(fund => fund.key === fundKey);
							targetFund.holdings = targetFund.holdings.map(holding => { const quote = quoteBySymbol.get(holding.symbol); return quote ? { ...holding, price: quote.price, previousClose: quote.previousClose, priceChange: quote.price - quote.previousClose, changePct: ((quote.price - quote.previousClose) / quote.previousClose) * 100 } : holding; });
							quoteState.quoteUpdatedAt = this.formatQuoteTime(snapshot.fetchedAt);
							if (!this.syncYahooQuoteAndHoldingsSignal(fundKey, snapshot.fetchedAt, successfulQuotes.length)) throw new Error('Yahoo 報價已更新，但估計貢獻同步失敗');
					if (snapshot.failedSymbols?.length) quoteState.quoteError = `部分報價更新失敗，已保留前次資料（${successfulQuotes.length}/${targetFund.holdings.length}）`;
				} catch (error) {
					quoteState.quoteError = error?.message === 'GitHub Pages 尚未設定 Cloudflare Worker 報價端點' ? error.message : 'Yahoo 更新失敗，已保留前次成功取得的報價';
				} finally {
					quoteState.isRefreshing = false;
				}
			},
				async refreshOfficialNav(force = false, fundKey = this.activeFundKey) {
				const navState = this.navsByFund[fundKey];
				if (navState.isRefreshing) return;
				navState.isRefreshing = true;
				navState.navError = '';
				try {
					const abortController = new AbortController();
					const requestTimeout = window.setTimeout(() => abortController.abort(), 12 * 1000);
						const navRequest = this.getNavRequest(fundKey, force);
					let response;
					try { response = await fetch(navRequest.url, { cache: 'no-store', credentials: navRequest.isExternalProxy ? 'omit' : 'same-origin', signal: abortController.signal }); } finally { window.clearTimeout(requestTimeout); }
					if (!response.ok) throw new Error(`官方淨值服務回應 ${response.status}`);
					const payload = await response.json();
					const snapshot = navRequest.isExternalProxy ? payload : payload?.result?.data?.json;
					if (snapshot?.fundKey !== fundKey || !Number.isFinite(snapshot?.nav) || !snapshot?.navDate) throw new Error('官方淨值資料不完整');
						if (!this.applyNavSnapshot(fundKey, snapshot)) throw new Error('官方淨值資料格式不正確');
						this.writeFundStorage('nav', fundKey, snapshot);
				} catch {
					navState.navError = '官方淨值更新失敗，已保留前次資料';
				} finally {
					navState.isRefreshing = false;
				}
			},
				async refreshRecentHistoryNav(force = false, fundKey = this.activeFundKey) {
				const historyState = this.historiesByFund[fundKey];
				if (historyState.isRefreshing) return;
				historyState.isRefreshing = true;
				historyState.historyError = '';
				try {
					const abortController = new AbortController();
					const requestTimeout = window.setTimeout(() => abortController.abort(), 12 * 1000);
					const historyRequest = this.getHistoryRequest(fundKey, force);
					let response;
					try { response = await fetch(historyRequest.url, { cache: 'no-store', credentials: historyRequest.isExternalProxy ? 'omit' : 'same-origin', signal: abortController.signal }); } finally { window.clearTimeout(requestTimeout); }
					if (!response.ok) throw new Error(`歷史淨值服務回應 ${response.status}`);
					const payload = await response.json();
					const snapshot = historyRequest.isExternalProxy ? payload : payload?.result?.data?.json;
					if (snapshot?.fundKey !== fundKey || !Array.isArray(snapshot?.rows) || snapshot.rows.length !== 5) throw new Error('最近五筆歷史淨值資料不完整');
						if (!this.applyHistorySnapshot(fundKey, snapshot)) throw new Error('最近五筆歷史淨值資料格式不正確');
						this.writeFundStorage('history', fundKey, snapshot);
				} catch {
					historyState.historyError = '最近五筆歷史淨值更新失敗，已保留前次資料';
				} finally {
					historyState.isRefreshing = false;
				}
				},
					normalizeFundDate(value) { return this.getTiming()?.normalizeFundDate(value) || ''; },
				syncNavChangePct(fund) { const navDate = this.normalizeFundDate(fund.navDate); const rows = [...fund.historyNav].map(item => ({ ...item, date: this.normalizeFundDate(item.date) })).sort((left, right) => left.date.localeCompare(right.date)); const currentIndex = rows.findIndex(item => item.date === navDate); const prior = currentIndex > 0 ? rows[currentIndex - 1] : rows.filter(item => item.date < navDate).at(-1); if (prior && Number.isFinite(fund.nav) && Number.isFinite(prior.value) && prior.value > 0) fund.navChangePct = ((fund.nav - prior.value) / prior.value) * 100; }
			},
					mounted() { console.info(`[現金流管理] fund_analysis.vue 版本：${FUND_ANALYSIS_VERSION}`); this.hydrateHoldingsSignalCache(this.activeFundKey); this.hydrateYahooQuoteCache(this.activeFundKey); this.maybeAutoRefreshYahooQuotes(); this.refreshFundSnapshots(); this.quoteTimer = window.setInterval(this.maybeAutoRefreshYahooQuotes, 60 * 1000); this.navTimer = window.setInterval(this.refreshFundSnapshots, 5 * 60 * 1000); this.countdownTimer = window.setInterval(() => { this.countdownNow = Date.now(); }, 1000); store.dispatch('SET_LOADING_ACTION', false); },
		beforeUnmount() { if (this.quoteTimer) window.clearInterval(this.quoteTimer); if (this.navTimer) window.clearInterval(this.navTimer); if (this.historyTimer) window.clearInterval(this.historyTimer); if (this.countdownTimer) window.clearInterval(this.countdownTimer); }
};
</script>
