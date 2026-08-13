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
			</div>
				<div class="fund_hero_meta">
					<span class="fund_meta_label">最新官方淨值</span>
					<strong class="fund_nav_value">{{ activeFund.nav.toFixed(2) }} <small>新臺幣</small></strong>
					<span class="fund_nav_date">淨值日期：{{ activeFund.navDate }}</span>
					<small :class="['fund_nav_refresh_status', activeNav.navError ? 'is-error' : '']">{{ navStatus }}</small>
					<span class="fund_holdings_asof">持股資料基準日：{{ activeFund.holdingsDate }}</span>
				<a class="fund_source_link" :href="activeFund.sourceUrl" target="_blank" rel="noopener noreferrer">查看官方資料</a>
			</div>
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
				<span class="fund_asof">區間：{{ activeFund.historyRange }}</span>
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
				<p class="fund_history_source">資料來源：<a :href="activeFund.performanceSourceUrl || activeFund.sourceUrl + '?nav=navperformance'" target="_blank" rel="noopener noreferrer">官方淨值走勢</a>；近期逐日資料以<a :href="activeFund.historySourceUrl" target="_blank" rel="noopener noreferrer">公開基金淨值表</a>交叉核對。</p>
		</section>

		<section class="fund_holdings normal_shadow">
			<div class="fund_section_head">
				<div><p class="fund_kicker">投資標的</p><h3>官方公開前十大持股</h3></div>
				<div class="fund_quote_controls">
					<div class="fund_section_meta fund_quote_meta">
						<span class="fund_asof">持股資料：{{ activeFund.holdingsDate }}</span>
						<span class="fund_asof fund_price_asof">Yahoo 報價：{{ activeQuote.quoteUpdatedAt }}</span>
						<small :class="['fund_quote_hint', activeQuote.quoteError ? 'is-error' : '']">{{ quoteStatus }}</small>
					</div>
					<button type="button" class="fund_refresh_button" :disabled="activeQuote.isRefreshing" @click="refreshYahooQuotes" aria-label="更新 Yahoo 股價">
						<svg :class="['fund_refresh_icon', activeQuote.isRefreshing ? 'is-spinning' : '']" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0 2.34 5.66M20 4v7h-7" /></svg>
						<span>{{ activeQuote.isRefreshing ? '更新中' : '更新股價' }}</span>
					</button>
				</div>
			</div>
			<div class="fund_table_box">
				<table class="fund_table"><thead><tr><th>排名</th><th>投資標的</th><th>Yahoo 股價¹</th><th>今日漲跌幅²</th><th>比重</th></tr></thead>
					<tbody><tr v-for="item in activeFund.holdings" :key="item.name"><td><span class="fund_rank">{{ item.rank }}</span></td><td class="fund_company">{{ item.name }}</td><td class="fund_price"><strong>TWD {{ formatPrice(item.price) }}</strong><small>{{ item.market }}</small></td><td><span :class="['fund_today_change', getChangeClass(item.changePct)]">{{ formatPercent(item.changePct) }}</span></td><td class="fund_weight"><div class="fund_weight_value"><strong>{{ item.weight.toFixed(2) }}%</strong></div><div class="fund_progress"><span :style="{ width: (item.weight / maxWeight * 100) + '%' }"></span></div></td></tr></tbody>
				</table>
			</div>
			<div class="fund_mobile_holdings" aria-label="官方公開前十大持股">
				<article class="fund_mobile_holding" v-for="item in activeFund.holdings" :key="'mobile-' + item.name"><div class="fund_mobile_holding_top"><div class="fund_mobile_company_group"><span class="fund_rank">{{ item.rank }}</span><strong>{{ item.name }}</strong></div><div class="fund_mobile_change"><strong :class="getChangeClass(item.changePct)">{{ formatPercent(item.changePct) }}</strong><small>今日漲跌幅</small></div></div><div class="fund_mobile_holding_detail"><div class="fund_mobile_price fund_mobile_price_inline"><strong>TWD {{ formatPrice(item.price) }}</strong><small>{{ item.market }} ・ 見上方報價時間</small></div><div class="fund_progress"><span :style="{ width: (item.weight / maxWeight * 100) + '%' }"></span></div></div></article>
			</div>
		</section>

		<section class="fund_insight_grid"><article v-for="insight in activeFund.insights" :key="insight.title" class="fund_insight normal_shadow"><p class="fund_kicker">{{ insight.kicker }}</p><h3>{{ insight.title }}</h3><p>{{ insight.text }}</p></article></section>
			<section class="fund_notice"><p><strong>資料揭露：</strong>{{ activeFund.name }}的最新淨值與持股資料分別依相關基金公司官方頁面及官方投資持股頁列示；¹ 個股價格會在進入本頁、盤中每五分鐘，以及按下「更新股價」時，經設定的報價代理自 Yahoo 股市讀取 regularMarketPrice；本機開發使用本網站伺服端，GitHub Pages 發布時使用設定的 Cloudflare Worker。² 今日漲跌幅按「(Yahoo 當前報價 − 前一交易日收盤價) ÷ 前一交易日收盤價」計算。盤中報價可能與交易所當日最終收盤價不同；若更新失敗，頁面會保留該基金前次成功取得的報價。持股會因基金經理人調整而變動，畫面僅呈現官方公開列示標的，非完整投資組合。</p><p><strong>用途說明：</strong>本頁為公開資料整理與持股結構觀察，不構成任何買賣、申購或贖回建議。</p></section>
	</div>
</template>

<script>
module.exports = {
	data() {
			return {
				activeFundKey: 'taiwanTechnology',
				quoteTimer: null,
				navTimer: null,
			quotesByFund: {
				taiwanTechnology: { quoteUpdatedAt: '2026 / 08 / 12 14:42', isRefreshing: false, quoteError: '' },
					taiwanDaba: { quoteUpdatedAt: '尚未取得', isRefreshing: false, quoteError: '' },
					taiwanIntelligence: { quoteUpdatedAt: '尚未取得', isRefreshing: false, quoteError: '' },
					fuhwaOmni: { quoteUpdatedAt: '尚未取得', isRefreshing: false, quoteError: '' }
				},
				navsByFund: {
					taiwanTechnology: { navUpdatedAt: '', isRefreshing: false, navError: '' },
					taiwanDaba: { navUpdatedAt: '', isRefreshing: false, navError: '' },
					taiwanIntelligence: { navUpdatedAt: '', isRefreshing: false, navError: '' },
					fuhwaOmni: { navUpdatedAt: '', isRefreshing: false, navError: '' }
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
		maxWeight() { return this.activeFund.holdings.reduce((highest, holding) => Math.max(highest, holding.weight), 0); },
		recentNavs() { return this.activeFund.historyNav.slice(-5).reverse(); },
			quoteStatus() { if (this.activeQuote.isRefreshing) return '正在向 Yahoo 股市更新報價'; if (this.activeQuote.quoteError) return this.activeQuote.quoteError; return '開啟頁面即更新，盤中每 5 分鐘自動更新'; },
			navStatus() { if (this.activeNav.isRefreshing) return '正在取得最新官方淨值'; if (this.activeNav.navError) return this.activeNav.navError; return this.activeNav.navUpdatedAt ? `官方淨值已更新：${this.activeNav.navUpdatedAt}` : '進入頁面時自動取得最新官方淨值'; }
	},
	methods: {
		formatDate(date) { return date.slice(5).replace('-', ' / '); },
		formatPercent(value) { return Number.isFinite(value) ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` : '—'; },
			formatPrice(value) { return Number.isFinite(value) ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'; },
			getChangeClass(value) { if (value > 0) return 'fund_positive'; if (value < 0) return 'fund_negative'; return 'fund_flat'; },
			formatQuoteTime(timestamp) { return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp)).replace(/\//g, ' / ').replace(',', ''); },
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
			getNavRequest(fundKey) {
				const workerBaseUrl = this.getWorkerBaseUrl();
				if (workerBaseUrl) {
					const endpoint = new URL(`${workerBaseUrl}/nav`);
					endpoint.searchParams.set('fund', fundKey);
					endpoint.searchParams.set('cacheVersion', '2');
					return { url: endpoint.toString(), isExternalProxy: true };
				}
				if (window.location.hostname.endsWith('.github.io')) throw new Error('GitHub Pages 尚未設定 Cloudflare Worker 淨值端點');
				const input = encodeURIComponent(JSON.stringify({ json: { fund: fundKey, force: true } }));
				return { url: `/api/trpc/market.officialNav?input=${input}`, isExternalProxy: false };
			},
			selectFund(fundKey) { if (fundKey === this.activeFundKey) return; this.activeFundKey = fundKey; this.$nextTick(() => { this.refreshYahooQuotes(); this.refreshOfficialNav(); }); },
		async refreshYahooQuotes() {
			const fundKey = this.activeFundKey;
			const quoteState = this.quotesByFund[fundKey];
			if (quoteState.isRefreshing) return;
			quoteState.isRefreshing = true;
			quoteState.quoteError = '';
			try {
				const abortController = new AbortController();
				const requestTimeout = window.setTimeout(() => abortController.abort(), 12 * 1000);
					const quoteRequest = this.getQuoteRequest(fundKey);
					let response;
					try { response = await fetch(quoteRequest.url, { cache: 'no-store', credentials: quoteRequest.isExternalProxy ? 'omit' : 'same-origin', signal: abortController.signal }); } finally { window.clearTimeout(requestTimeout); }
					if (!response.ok) throw new Error(`報價服務回應 ${response.status}`);
					const payload = await response.json();
					const snapshot = quoteRequest.isExternalProxy ? payload : payload?.result?.data?.json;
				const successfulQuotes = snapshot?.quotes;
				if (!Array.isArray(successfulQuotes) || !successfulQuotes.length || snapshot.fundKey !== fundKey) throw new Error('Yahoo 股市暫時無法提供報價');
				const quoteBySymbol = new Map(successfulQuotes.map(quote => [quote.symbol, quote]));
				const targetFund = this.funds.find(fund => fund.key === fundKey);
				targetFund.holdings = targetFund.holdings.map(holding => { const quote = quoteBySymbol.get(holding.symbol); return quote ? { ...holding, price: quote.price, changePct: ((quote.price - quote.previousClose) / quote.previousClose) * 100 } : holding; });
				quoteState.quoteUpdatedAt = this.formatQuoteTime(snapshot.fetchedAt);
				if (snapshot.failedSymbols?.length) quoteState.quoteError = `部分報價更新失敗，已保留前次資料（${successfulQuotes.length}/${targetFund.holdings.length}）`;
				} catch (error) {
					quoteState.quoteError = error?.message === 'GitHub Pages 尚未設定 Cloudflare Worker 報價端點' ? error.message : 'Yahoo 更新失敗，已保留前次成功取得的報價';
				} finally {
					quoteState.isRefreshing = false;
				}
			},
			async refreshOfficialNav() {
				const fundKey = this.activeFundKey;
				const navState = this.navsByFund[fundKey];
				if (navState.isRefreshing) return;
				navState.isRefreshing = true;
				navState.navError = '';
				try {
					const abortController = new AbortController();
					const requestTimeout = window.setTimeout(() => abortController.abort(), 12 * 1000);
					const navRequest = this.getNavRequest(fundKey);
					let response;
					try { response = await fetch(navRequest.url, { cache: 'no-store', credentials: navRequest.isExternalProxy ? 'omit' : 'same-origin', signal: abortController.signal }); } finally { window.clearTimeout(requestTimeout); }
					if (!response.ok) throw new Error(`官方淨值服務回應 ${response.status}`);
					const payload = await response.json();
					const snapshot = navRequest.isExternalProxy ? payload : payload?.result?.data?.json;
					if (snapshot?.fundKey !== fundKey || !Number.isFinite(snapshot?.nav) || !snapshot?.navDate) throw new Error('官方淨值資料不完整');
					const targetFund = this.funds.find(fund => fund.key === fundKey);
					targetFund.nav = Number(snapshot.nav);
					targetFund.navDate = String(snapshot.navDate).replace(/\//g, ' / ');
					navState.navUpdatedAt = this.formatQuoteTime(snapshot.fetchedAt);
				} catch {
					navState.navError = '官方淨值更新失敗，已保留前次資料';
				} finally {
					navState.isRefreshing = false;
				}
			}
		},
		mounted() { this.refreshYahooQuotes(); this.refreshOfficialNav(); this.quoteTimer = window.setInterval(this.refreshYahooQuotes, 5 * 60 * 1000); this.navTimer = window.setInterval(this.refreshOfficialNav, 30 * 60 * 1000); store.dispatch('SET_LOADING_ACTION', false); },
		beforeUnmount() { if (this.quoteTimer) window.clearInterval(this.quoteTimer); if (this.navTimer) window.clearInterval(this.navTimer); }
};
</script>
