<template>
	<section class="fund_purchase_page">
		<section class="fund_selector fund_purchase_page_selector normal_shadow" aria-label="基金選擇">
			<div>
				<p class="fund_kicker">我的基金</p>
				<h2>基金申購與贖回紀錄</h2>
			</div>
			<div class="fund_selector_list" role="tablist" aria-label="選擇基金申購紀錄">
				<button v-for="fund in funds" :key="fund.key" type="button" role="tab"
					:aria-selected="activeFundKey === fund.key"
					:class="['fund_selector_button', activeFundKey === fund.key ? 'is-active' : '']"
					@click="selectFund(fund.key)"><span>{{ fund.shortName }}</span><small>{{ fund.riskLevel
						}}</small></button>
			</div>
		</section>

		<header class="fund_purchase_page_hero normal_shadow">
			<div>
				<p class="fund_kicker">目前選擇基金</p>
				<h2>{{ activeFund.name }}</h2>
				<p>申購與贖回分開保存；已結算贖回採加權平均成本，尚餘部位則依最新官方淨值試算。</p>
			</div>
			<div class="fund_purchase_page_refresh"><button class="fund_purchase_page_refresh_button" type="button"
					:disabled="isRefreshingAll" @click="refreshAllFunds(true)"><svg class="fund_refresh_icon"
						:class="{ 'is-spinning': isRefreshingAll }" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M20 11a8 8 0 1 0 2 5.5M20 4v7h-7"></path>
					</svg>{{ isRefreshingAll ? '正在重整四檔基金' : '一鍵重整四檔基金資料' }}</button>
				<p v-if="refreshSummary"
					:class="['fund_purchase_page_refresh_status', refreshHasError ? 'is-error' : '']">{{ refreshSummary
					}}</p>
			</div>
		</header>

		<section class="fund_purchase_page_totals" aria-label="基金部位與損益總覽">
			<article class="fund_purchase_page_total normal_shadow"><span>四檔基金合計總損益</span><strong
					:class="getChangeClass(allFundsProfitLoss)">{{ formatSignedTwd(allFundsProfitLoss)
					}}</strong><small>已實現損益與尚餘部位未實現損益</small></article>
			<article class="fund_purchase_page_total normal_shadow"><span>{{ activeFund.name }}總損益</span><strong
					:class="getChangeClass(activeFundProfitLoss)">{{ formatSignedTwd(activeFundProfitLoss)
					}}</strong><small>加權平均成本試算</small></article>
			<article class="fund_purchase_page_total fund_purchase_page_realized_total normal_shadow">
				<span>累積已實現損益</span><strong :class="getChangeClass(activeLedger.realizedProfitLoss)">{{
					formatSignedTwd(activeLedger.realizedProfitLoss) }}</strong><small>僅計入已結算贖回</small></article>
			<article class="fund_purchase_page_total fund_purchase_page_pending_total normal_shadow">
				<span>目前基金待補資料</span><strong>{{ activeIncompleteRecordCount }} 筆</strong><small>申購淨值或庫存單位數尚未填寫</small>
			</article>
		</section>

		<section class="fund_purchase_page_content" aria-label="目前基金申購與贖回紀錄">
			<article class="fund_purchase_page_card normal_shadow">
				<header class="fund_purchase_page_card_head">
					<div>
						<p class="fund_kicker">{{ activeFund.riskLevel }}</p>
						<h3>{{ activeFund.name }}</h3>
						<div class="fund_purchase_page_tabs" role="tablist" aria-label="申購、贖回與庫存總覽"><button
								v-for="tab in recordTabs" :key="tab.key" type="button" role="tab"
								:aria-selected="activeTab === tab.key"
								:class="['fund_purchase_page_tab_button', activeTab === tab.key ? 'is-active' : '']"
								@click="activeTab = tab.key">{{ tab.label }}</button></div>
					</div>
					<div class="fund_purchase_page_nav"><span>最新公開淨值</span><strong>{{ formatNav(activeFund.nav)
							}}</strong><small>淨值日期 {{ formatDate(activeFund.navDate) }} · {{
					formatTime(activeFund.updatedAt) }}</small></div>
				</header>

				<section v-if="activeTab === 'purchase'" aria-label="申購紀錄">
					<div class="fund_purchase_page_card_controls"><button class="fund_purchase_page_add_button"
							type="button" @click="openPurchaseModal('add')">＋ 新增申購紀錄</button><button
							:class="['fund_purchase_page_filter_button', showOnlyIncomplete ? 'is-active' : '']"
							type="button" :aria-pressed="showOnlyIncomplete"
							@click="showOnlyIncomplete = !showOnlyIncomplete">{{ showOnlyIncomplete ? '顯示全部紀錄' :
					'僅顯示待補資料' }}</button></div>
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
									<td><strong :class="getChangeClass(record.returnPct)">{{
					formatPercent(record.returnPct) }}</strong></td>
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
									:class="getChangeClass(record.returnPct)">{{ formatPercent(record.returnPct)
									}}</span>
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
									<dd :class="getChangeClass(record.profitLoss)">{{ formatSignedTwd(record.profitLoss)
										}}</dd>
								</div>
							</dl><button class="fund_purchase_page_edit_button fund_purchase_page_mobile_edit_button"
								type="button" @click="openPurchaseModal('edit', record)">編輯這筆紀錄</button>
						</article>
					</div>
				</section>

				<section v-else-if="activeTab === 'redemption'" aria-label="贖回紀錄">
					<div class="fund_purchase_page_redemption_intro">
						<div><strong>可再贖回 {{ formatUnits(activeLedger.availableRedemptionUnits) }}</strong><span>已扣除 {{
					formatUnits(activeLedger.pendingUnits) }} 處理中保留單位</span></div><button
							class="fund_purchase_page_add_button fund_purchase_page_redemption_add_button" type="button"
							@click="openRedemptionModal('add')">＋ 新增贖回紀錄</button>
					</div>
					<div class="fund_purchase_page_table_box">
						<table class="fund_purchase_page_table fund_purchase_page_redemption_table">
							<thead>
								<tr>
									<th>日期</th>
									<th>狀態</th>
									<th>贖回單位</th>
									<th>贖回淨值</th>
									<th>入帳淨額</th>
									<th>成本基礎</th>
									<th>已實現損益</th>
									<th>操作</th>
								</tr>
							</thead>
							<tbody>
								<tr v-if="activeRedemptionRecords.length === 0">
									<td colspan="8" class="fund_purchase_page_empty">尚無贖回紀錄。</td>
								</tr>
								<tr v-for="record in activeRedemptionRecords" :key="record.id">
									<td>{{ formatDate(record.date) }}</td>
									<td><span :class="['fund_purchase_page_status_badge', `is-${record.status}`]">{{
					formatRedemptionStatus(record.status) }}</span></td>
									<td>{{ formatUnits(record.units) }}</td>
									<td>{{ record.status === 'settled' ? formatNav(record.redemptionNav) : '—' }}</td>
									<td>{{ record.status === 'settled' ?
					formatTwd(getRedemptionMetric(record).netProceeds) : '—' }}</td>
									<td>{{ record.status === 'settled' ?
					formatTwd(getRedemptionMetric(record).costBasis) : '—' }}</td>
									<td><strong
											:class="getChangeClass(getRedemptionMetric(record).realizedProfitLoss)">{{
					record.status === 'settled' ?
						formatSignedTwd(getRedemptionMetric(record).realizedProfitLoss) : '—'
				}}</strong></td>
									<td><button class="fund_purchase_page_edit_button" type="button"
											:aria-label="`編輯 ${formatDate(record.date)} 的贖回紀錄`"
											@click="openRedemptionModal('edit', record)">編輯</button></td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="fund_purchase_page_mobile_records" aria-label="行動版贖回紀錄">
						<p v-if="activeRedemptionRecords.length === 0" class="fund_purchase_page_mobile_empty">尚無贖回紀錄。
						</p>
						<article v-for="record in activeRedemptionRecords" :key="`redemption-mobile-${record.id}`"
							class="fund_purchase_page_mobile_record">
							<div class="fund_purchase_page_mobile_record_top"><strong>{{ formatDate(record.date)
									}}</strong><span
									:class="['fund_purchase_page_status_badge', `is-${record.status}`]">{{
					formatRedemptionStatus(record.status) }}</span></div>
							<dl>
								<div>
									<dt>贖回單位</dt>
									<dd>{{ formatUnits(record.units) }}</dd>
								</div>
								<div>
									<dt>贖回淨值</dt>
									<dd>{{ record.status === 'settled' ? formatNav(record.redemptionNav) : '—' }}</dd>
								</div>
								<div>
									<dt>入帳淨額</dt>
									<dd>{{ record.status === 'settled' ?
					formatTwd(getRedemptionMetric(record).netProceeds) : '—' }}</dd>
								</div>
								<div>
									<dt>成本基礎</dt>
									<dd>{{ record.status === 'settled' ?
					formatTwd(getRedemptionMetric(record).costBasis) : '—' }}</dd>
								</div>
								<div>
									<dt>已實現損益</dt>
									<dd :class="getChangeClass(getRedemptionMetric(record).realizedProfitLoss)">{{
					record.status === 'settled' ?
						formatSignedTwd(getRedemptionMetric(record).realizedProfitLoss) : '—' }}</dd>
								</div>
							</dl><button class="fund_purchase_page_edit_button fund_purchase_page_mobile_edit_button"
								type="button" @click="openRedemptionModal('edit', record)">編輯這筆紀錄</button>
						</article>
					</div>
				</section>

				<section v-else class="fund_purchase_page_inventory" aria-label="庫存總覽">
					<div class="fund_purchase_page_inventory_grid">
						<article><span>已申購單位</span><strong>{{ formatUnits(activeLedger.purchasedUnits)
								}}</strong><small>僅計入資料完整的申購紀錄</small></article>
						<article><span>已結算贖回</span><strong>{{ formatUnits(activeLedger.settledUnits)
								}}</strong><small>已自尚餘部位扣除</small></article>
						<article><span>處理中保留</span><strong>{{ formatUnits(activeLedger.pendingUnits)
								}}</strong><small>尚未計入已實現損益</small></article>
						<article><span>尚餘持有單位</span><strong>{{ formatUnits(activeLedger.remainingUnits)
								}}</strong><small>可用單位 {{ formatUnits(activeLedger.availableRedemptionUnits) }}</small>
						</article>
						<article><span>尚餘部位市值</span><strong>{{ formatTwd(activeLedger.marketValue)
								}}</strong><small>依最新公開淨值試算</small></article>
						<article><span>尚餘部位未實現損益</span><strong
								:class="getChangeClass(activeLedger.unrealizedProfitLoss)">{{
					formatSignedTwd(activeLedger.unrealizedProfitLoss) }}</strong><small>尚餘市值減尚餘成本</small>
						</article>
					</div>
					<p class="fund_purchase_page_inventory_note">
						加權平均成本：每筆已結算贖回會以該筆交易日期前、已建立完整資料的尚餘申購部位計算平均成本。處理中交易只保留單位，不計入損益；取消交易不影響庫存與損益。</p>
				</section>
			</article>
		</section>

		<div :class="['alert', 'fund_purchase_page_modal', purchaseModal.mode ? 'showAdd' : '']" role="dialog"
			aria-modal="true" aria-labelledby="fund-purchase-modal-title" @click.self="closePurchaseModal">
			<div class="alert_box"><button class="alert_close" type="button" aria-label="關閉申購紀錄視窗"
					@click="closePurchaseModal"><svg viewBox="0 0 24 24" aria-hidden="true">
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

		<div :class="['alert', 'fund_purchase_page_modal', redemptionModal.mode ? 'showAdd' : '']" role="dialog"
			aria-modal="true" aria-labelledby="fund-redemption-modal-title" @click.self="closeRedemptionModal">
			<div class="alert_box"><button class="alert_close" type="button" aria-label="關閉贖回紀錄視窗"
					@click="closeRedemptionModal"><svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M18 6 6 18M6 6l12 12"></path>
					</svg></button>
				<div class="alert_title"><span id="fund-redemption-modal-title">{{ redemptionModal.mode === 'edit' ?
					'編輯贖回紀錄' : '新增贖回紀錄' }}</span>
					<p>{{ activeFund.name }} · 加權平均成本</p>
				</div>
				<form class="alert_content" @submit.prevent="saveRedemptionRecord">
					<div class="alert_content_item" data-txt="贖回日期"><input v-model="redemptionModal.form.date"
							class="alert_inp" type="date" required></div>
					<div class="alert_content_item" data-txt="狀態"><select v-model="redemptionModal.form.status"
							class="alert_inp">
							<option value="pending">處理中</option>
							<option value="settled">已結算</option>
							<option value="cancelled">取消</option>
						</select></div>
					<div class="alert_content_item" data-txt="贖回單位數"><input v-model="redemptionModal.form.units"
							class="alert_inp" type="number" min="0.1" step="0.1" placeholder="可再贖回單位數" required></div>
					<div class="alert_content_item" data-txt="贖回淨值（已結算必填）"><input
							v-model="redemptionModal.form.redemptionNav" class="alert_inp" type="number" min="0"
							step="0.01" :disabled="redemptionModal.form.status !== 'settled'" placeholder="基金公司正式贖回淨值">
					</div>
					<div class="alert_content_item" data-txt="手續費"><input v-model="redemptionModal.form.fee"
							class="alert_inp" type="number" min="0" step="0.01" placeholder="未收費請填 0"></div>
					<div class="alert_content_item" data-txt="稅費／其他扣款"><input v-model="redemptionModal.form.tax"
							class="alert_inp" type="number" min="0" step="0.01" placeholder="未扣款請填 0"></div>
					<div class="alert_content_item" data-txt="備註"><input v-model="redemptionModal.form.note"
							class="alert_inp" type="text" maxlength="100" placeholder="選填，例如入帳銀行或交易單號"></div>
					<p class="fund_purchase_page_modal_available">目前可再贖回：{{ formatUnits(redemptionAvailableUnits) }}</p>
					<p v-if="redemptionModal.error" class="fund_purchase_page_modal_error" role="alert">{{
						redemptionModal.error }}</p>
					<p class="fund_purchase_page_modal_hint">處理中交易會保留單位；已結算交易才會扣除庫存並計入已實現損益；取消交易不影響庫存與損益。</p>
					<div class="alert_funcbox"><button class="normal_btn _secondary" type="button"
							@click="closeRedemptionModal">取消</button><button class="normal_btn _primary"
							type="submit">{{ redemptionModal.mode === 'edit' ? '儲存更新' : '儲存贖回紀錄' }}</button></div>
				</form>
			</div>
		</div>
		<p v-if="purchaseSaveMessage" class="fund_purchase_page_save_toast" role="status">{{ purchaseSaveMessage }}</p>
		<p class="fund_purchase_page_note">申購未實現損益：市值＝尚餘庫存單位數 × 最新公開淨值；已結算贖回：入帳淨額＝贖回單位數 ×
			贖回淨值－手續費－稅費／其他扣款，並以加權平均成本計算已實現損益。申購與贖回資料由使用者輸入，未取代基金公司、銀行或券商對帳單。</p>
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
	data() { return { activeFundKey: 'taiwanTechnology', activeTab: 'purchase', recordTabs: [{ key: 'purchase', label: '申購紀錄' }, { key: 'redemption', label: '贖回紀錄' }, { key: 'inventory', label: '庫存總覽' }], isRefreshingAll: false, refreshSummary: '', refreshHasError: false, showOnlyIncomplete: false, purchaseSaveMessage: '', purchaseModal: { mode: '', editingId: '', form: { date: '', principal: '', subscriptionNav: '', units: '' }, error: '' }, redemptionModal: { mode: '', editingId: '', form: { date: '', status: 'pending', units: '', redemptionNav: '', fee: '0', tax: '0', note: '' }, error: '' }, funds: FUND_PURCHASE_KEYS.map(fund => ({ ...fund, updatedAt: '', isRefreshing: false, navError: '' })) }; },
	computed: {
		activeFund() { return this.funds.find(fund => fund.key === this.activeFundKey) || this.funds[0]; },
		recordsByFund() { return this.funds.map(fund => ({ key: fund.key, records: this.getFundPurchaseRecords(fund.key).map(record => this.calculateRecord(record, fund.nav)) })); },
		activePurchaseRecords() { return this.getFundPurchaseRecords(this.activeFundKey).map(record => this.calculateRecord(record, this.activeFund.nav)); },
		visiblePurchaseRecords() { return this.showOnlyIncomplete ? this.activePurchaseRecords.filter(record => record.isIncomplete) : this.activePurchaseRecords; },
		activeIncompleteRecordCount() { return this.activePurchaseRecords.filter(record => record.isIncomplete).length; },
		activeRedemptionRecords() { return [...this.getFundRedemptionRecords(this.activeFundKey)].sort((a, b) => this.normalizeDate(b.date).localeCompare(this.normalizeDate(a.date))); },
		activeLedger() { return this.calculateFundLedger(this.activeFundKey, this.activeFund.nav); },
		redemptionAvailableUnits() { return this.getRedeemableUnitsForModal(); },
		activeFundProfitLoss() { return this.calculateFundLedger(this.activeFundKey, this.activeFund.nav).totalProfitLoss; },
		allFundsProfitLoss() { return this.funds.reduce((total, fund) => total + this.calculateFundLedger(fund.key, fund.nav).totalProfitLoss, 0); }
	},
	mounted() { this.hydrateFundRedemptionData(); this.hydrateFundCaches(); this.refreshAllFunds(false); store.dispatch('SET_LOADING_ACTION', false); },
	methods: {
		selectFund(fundKey) { if (this.funds.some(fund => fund.key === fundKey)) { this.activeFundKey = fundKey; this.showOnlyIncomplete = false; this.activeTab = 'purchase'; this.purchaseSaveMessage = ''; } },
		getTodayInputDate() { return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); },
		formatInputDate(value) { return this.normalizeDate(value); },
		openPurchaseModal(mode, record = null) { const current = record || {}; this.purchaseSaveMessage = ''; this.purchaseModal = { mode, editingId: current.id ?? '', form: { date: current.date ? this.formatInputDate(current.date) : this.getTodayInputDate(), principal: current.principal ?? '', subscriptionNav: current.subscriptionNav ?? '', units: current.units ?? '' }, error: '' }; },
		closePurchaseModal() { this.purchaseModal = { mode: '', editingId: '', form: { date: '', principal: '', subscriptionNav: '', units: '' }, error: '' }; },
		openRedemptionModal(mode, record = null) { const current = record || {}; this.purchaseSaveMessage = ''; this.redemptionModal = { mode, editingId: current.id ?? '', form: { date: current.date ? this.formatInputDate(current.date) : this.getTodayInputDate(), status: current.status || 'pending', units: current.units ?? '', redemptionNav: current.redemptionNav ?? '', fee: current.fee ?? 0, tax: current.tax ?? 0, note: current.note ?? '' }, error: '' }; },
		closeRedemptionModal() { this.redemptionModal = { mode: '', editingId: '', form: { date: '', status: 'pending', units: '', redemptionNav: '', fee: '0', tax: '0', note: '' }, error: '' }; },
		getNextPurchaseRecordId(fundKey) { const ids = this.getFundPurchaseRecords(fundKey).map(record => Number(record.id)).filter(Number.isFinite); return String((ids.length ? Math.max(...ids) : 0) + 1); },
		getNextRedemptionRecordId(fundKey) { const ids = this.getFundRedemptionRecords(fundKey).map(record => Number(String(record.id).replace(/^R/, ''))).filter(Number.isFinite); return `R${ (ids.length ? Math.max(...ids) : 0) + 1 }`; },
		normalizeOptionalNumber(value, fieldName) { if (value === '' || value === null || value === undefined) return ''; const number = Number(value); if (!Number.isFinite(number) || number < 0) throw new Error(`${ fieldName }必須是 0 或以上的數字`); return number; },
		savePurchaseRecord() { try { const form = this.purchaseModal.form; const date = this.normalizeDate(form.date); const principal = Number(form.principal); if (!date) throw new Error('請填寫日期'); if (!Number.isFinite(principal) || principal <= 0) throw new Error('投入本金必須大於 0'); const record = { id: this.purchaseModal.mode === 'edit' ? this.purchaseModal.editingId : this.getNextPurchaseRecordId(this.activeFundKey), date: date.replace(/-/g, '.'), principal, subscriptionNav: this.normalizeOptionalNumber(form.subscriptionNav, '申購淨值'), units: this.normalizeOptionalNumber(form.units, '庫存單位數') }; if (this.purchaseModal.mode === 'edit') { this.$store.commit('UPDATE_FUND_PURCHASE_RECORD', { fundKey: this.activeFundKey, record }); this.purchaseSaveMessage = '申購紀錄已更新，相關試算已同步重算。'; } else { this.$store.commit('ADD_FUND_PURCHASE_RECORD', { fundKey: this.activeFundKey, record }); this.purchaseSaveMessage = '申購紀錄已新增，相關試算已同步重算。'; } this.closePurchaseModal(); } catch (error) { this.purchaseModal.error = error instanceof Error ? error.message : '儲存申購紀錄時發生錯誤'; } },
		getRedeemableUnitsForModal() { const editingId = this.redemptionModal.mode === 'edit' ? this.redemptionModal.editingId : ''; const records = this.getFundRedemptionRecords(this.activeFundKey).filter(record => String(record.id) !== String(editingId)); return this.calculateFundLedger(this.activeFundKey, this.activeFund.nav, records).availableRedemptionUnits; },
		saveRedemptionRecord() { try { const form = this.redemptionModal.form; const date = this.normalizeDate(form.date); const status = form.status; const units = Number(form.units); const redemptionNav = this.normalizeOptionalNumber(form.redemptionNav, '贖回淨值'); const fee = this.normalizeOptionalNumber(form.fee, '手續費'); const tax = this.normalizeOptionalNumber(form.tax, '稅費／其他扣款'); if (!date) throw new Error('請填寫贖回日期'); if (!['pending', 'settled', 'cancelled'].includes(status)) throw new Error('請選擇正確的贖回狀態'); if (!Number.isFinite(units) || units <= 0) throw new Error('贖回單位數必須大於 0'); if (status === 'settled' && (!Number.isFinite(redemptionNav) || redemptionNav <= 0)) throw new Error('已結算贖回必須填寫大於 0 的正式贖回淨值'); if (status !== 'cancelled' && units - this.redemptionAvailableUnits > 0.000001) throw new Error(`贖回單位數超過可再贖回單位 ${ this.formatUnits(this.redemptionAvailableUnits) }`); const record = { id: this.redemptionModal.mode === 'edit' ? this.redemptionModal.editingId : this.getNextRedemptionRecordId(this.activeFundKey), date: date.replace(/-/g, '.'), status, units, redemptionNav: status === 'settled' ? redemptionNav : '', fee: Number(fee || 0), tax: Number(tax || 0), note: String(form.note || '').trim(), costMethod: 'average' }; if (this.redemptionModal.mode === 'edit') { this.$store.commit('UPDATE_FUND_REDEMPTION_RECORD', { fundKey: this.activeFundKey, record }); this.purchaseSaveMessage = '贖回紀錄已更新，庫存與損益已依加權平均成本重新計算。'; } else { this.$store.commit('ADD_FUND_REDEMPTION_RECORD', { fundKey: this.activeFundKey, record }); this.purchaseSaveMessage = status === 'settled' ? '已儲存已結算贖回，庫存與已實現損益已更新。' : status === 'pending' ? '已儲存處理中贖回，單位已保留。' : '已儲存取消贖回，庫存不受影響。'; } this.persistFundRedemptionData(); this.closeRedemptionModal(); } catch (error) { this.redemptionModal.error = error instanceof Error ? error.message : '儲存贖回紀錄時發生錯誤'; } },
		normalizeDate(value) { const match = String(value || '').match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/); return match ? `${ match[1] }-${ match[2].padStart(2, '0') }-${ match[3].padStart(2, '0') }` : ''; },
		formatDate(value) { const normalized = this.normalizeDate(value); return normalized ? normalized.replace(/-/g, ' / ') : '尚未取得'; },
		formatTime(value) { const match = String(value || '').match(/(\d{1,2}:\d{2})/); return match ? match[1] : '尚未更新'; },
		formatNav(value) { return Number.isFinite(Number(value)) && Number(value) > 0 ? `${ Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } 新臺幣` : '—'; },
		isUsableNumber(value) { return value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)); },
		formatTwd(value) { return this.isUsableNumber(value) ? `TWD ${ Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }` : 'TWD —'; },
		formatSignedTwd(value) { return this.isUsableNumber(value) ? `${ Number(value) > 0 ? '+' : Number(value) < 0 ? '-' : '' }TWD ${ Math.abs(Number(value)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }` : 'TWD —'; },
		formatUnits(value) { return this.isUsableNumber(value) ? `${ Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 }) } 單位` : '—'; },
		formatPercent(value) { return this.isUsableNumber(value) ? `${ Number(value) > 0 ? '+' : '' }${ Number(value).toFixed(2) }%` : '—'; },
		formatRedemptionStatus(status) { return ({ pending: '處理中', settled: '已結算', cancelled: '取消' })[status] || '處理中'; },
		getChangeClass(value) { return Number(value) > 0 ? 'fund_positive' : Number(value) < 0 ? 'fund_negative' : 'fund_flat'; },
		formatTaipeiDateTime(timestamp) { return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp)).replace(/\//g, ' / ').replace(',', ''); },
		getFundPurchaseRecords(fundKey) { const records = this.$store?.state?.FundData?.[fundKey]; return Array.isArray(records) ? records : []; },
		getFundRedemptionRecords(fundKey) { const records = this.$store?.state?.FundRedemptionData?.[fundKey]; return Array.isArray(records) ? records : []; },
		getRedemptionStorageKey() { return 'cashflow-manager:fund-redemptions:v1'; },
		normalizeStoredRedemptionRecord(record) { const date = this.normalizeDate(record?.date); const status = ['pending', 'settled', 'cancelled'].includes(record?.status) ? record.status : 'pending'; const units = Number(record?.units); const redemptionNav = Number(record?.redemptionNav); const fee = Number(record?.fee || 0); const tax = Number(record?.tax || 0); if (!date || !String(record?.id || '') || !Number.isFinite(units) || units <= 0 || !Number.isFinite(fee) || fee < 0 || !Number.isFinite(tax) || tax < 0) return null; if (status === 'settled' && (!Number.isFinite(redemptionNav) || redemptionNav <= 0)) return null; return { id: String(record.id), date: date.replace(/-/g, '.'), status, units, redemptionNav: status === 'settled' ? redemptionNav : '', fee, tax, note: String(record?.note || '').slice(0, 100), costMethod: 'average' }; },
		hydrateFundRedemptionData() { try { const raw = localStorage.getItem(this.getRedemptionStorageKey()); const saved = raw ? JSON.parse(raw) : null; if (!saved || typeof saved !== 'object') return; this.funds.forEach(fund => { const records = Array.isArray(saved[fund.key]) ? saved[fund.key].map(record => this.normalizeStoredRedemptionRecord(record)).filter(Boolean) : null; if (records) this.$store.commit('REPLACE_FUND_REDEMPTION_RECORDS', { fundKey: fund.key, records }); }); } catch { } },
		persistFundRedemptionData() { try { const snapshot = {}; this.funds.forEach(fund => { snapshot[fund.key] = this.getFundRedemptionRecords(fund.key).map(record => ({ id: record.id, date: record.date, status: record.status, units: record.units, redemptionNav: record.redemptionNav, fee: record.fee, tax: record.tax, note: record.note, costMethod: 'average' })); }); localStorage.setItem(this.getRedemptionStorageKey(), JSON.stringify(snapshot)); } catch { } },
		isIncompletePurchaseRecord(record) { const isMissingValue = value => value === '' || value === null || value === undefined || !Number.isFinite(Number(value)) || Number(value) <= 0; return !record || isMissingValue(record.subscriptionNav) || isMissingValue(record.units); },
		calculateRecord(record, nav) { const principal = Number(record.principal); const isIncomplete = this.isIncompletePurchaseRecord(record); const units = Number(record.units); const navValue = Number(nav); const marketValue = !isIncomplete && Number.isFinite(units) && Number.isFinite(navValue) && navValue > 0 ? units * navValue : null; const profitLoss = Number.isFinite(marketValue) ? marketValue - principal : null; const returnPct = Number.isFinite(profitLoss) && principal > 0 ? (profitLoss / principal) * 100 : null; return { ...record, isIncomplete, marketValue, profitLoss, returnPct }; },
		calculateFundLedger(fundKey, nav, redemptionRecords = null) { const purchases = this.getFundPurchaseRecords(fundKey).filter(record => !this.isIncompletePurchaseRecord(record)).map(record => ({ type: 'purchase', date: this.normalizeDate(record.date), id: String(record.id), units: Number(record.units), principal: Number(record.principal) })); const redemptions = (redemptionRecords || this.getFundRedemptionRecords(fundKey)).filter(record => record?.status === 'settled').map(record => ({ type: 'redemption', date: this.normalizeDate(record.date), id: String(record.id), units: Number(record.units), redemptionNav: Number(record.redemptionNav), fee: Number(record.fee || 0), tax: Number(record.tax || 0) })); const events = [...purchases, ...redemptions].sort((a, b) => a.date.localeCompare(b.date) || (a.type === 'purchase' ? -1 : 1)); let purchasedUnits = 0; let purchasedCost = 0; let remainingUnits = 0; let remainingCost = 0; let settledUnits = 0; let realizedProfitLoss = 0; const redemptionMetrics = {}; const invalidRedemptionIds = []; events.forEach(event => { if (event.type === 'purchase') { purchasedUnits += event.units; purchasedCost += event.principal; remainingUnits += event.units; remainingCost += event.principal; return; } const valid = event.date && Number.isFinite(event.units) && event.units > 0 && Number.isFinite(event.redemptionNav) && event.redemptionNav > 0 && event.units <= remainingUnits + 0.000001; if (!valid) { invalidRedemptionIds.push(event.id); redemptionMetrics[event.id] = { netProceeds: null, costBasis: null, realizedProfitLoss: null, isValid: false }; return; } const averageCost = remainingUnits > 0 ? remainingCost / remainingUnits : 0; const costBasis = event.units * averageCost; const netProceeds = event.units * event.redemptionNav - event.fee - event.tax; const profitLoss = netProceeds - costBasis; remainingUnits -= event.units; remainingCost -= costBasis; settledUnits += event.units; realizedProfitLoss += profitLoss; redemptionMetrics[event.id] = { netProceeds, costBasis, realizedProfitLoss: profitLoss, isValid: true }; }); const pendingUnits = (redemptionRecords || this.getFundRedemptionRecords(fundKey)).filter(record => record?.status === 'pending').reduce((total, record) => total + (Number.isFinite(Number(record.units)) && Number(record.units) > 0 ? Number(record.units) : 0), 0); const navValue = Number(nav); const marketValue = remainingUnits > 0 && Number.isFinite(navValue) && navValue > 0 ? remainingUnits * navValue : 0; const unrealizedProfitLoss = marketValue - remainingCost; return { purchasedUnits, purchasedCost, settledUnits, pendingUnits, remainingUnits, remainingCost, availableRedemptionUnits: Math.max(0, remainingUnits - pendingUnits), marketValue, realizedProfitLoss, unrealizedProfitLoss, totalProfitLoss: realizedProfitLoss + unrealizedProfitLoss, redemptionMetrics, invalidRedemptionIds }; },
		getRedemptionMetric(record) { return this.activeLedger.redemptionMetrics[String(record.id)] || { netProceeds: null, costBasis: null, realizedProfitLoss: null }; },
		getNavStorageKey(fundKey) { return `cashflow-manager:fund-nav:v1:${ fundKey }`; },
		getWorkerBaseUrl() { return typeof window.CASHFLOW_QUOTE_PROXY_URL === 'string' ? window.CASHFLOW_QUOTE_PROXY_URL.trim().replace(/\/+$/, '') : ''; },
		getNavRequest(fundKey, force = false) { const workerBaseUrl = this.getWorkerBaseUrl(); if (workerBaseUrl) { const endpoint = new URL(`${ workerBaseUrl }/nav`); endpoint.searchParams.set('fund', fundKey); endpoint.searchParams.set('cacheVersion', '4'); if (force) endpoint.searchParams.set('force', '1'); return { url: endpoint.toString(), isExternalProxy: true }; } if (window.location.hostname.endsWith('.github.io')) throw new Error('GitHub Pages 尚未設定 Cloudflare Worker 淨值端點'); const input = encodeURIComponent(JSON.stringify({ json: { fund: fundKey, force } })); return { url: `/api/trpc/market.officialNav?input=${ input }`, isExternalProxy: false }; },
		applyNavSnapshot(fundKey, snapshot, source = 'remote') { const fund = this.funds.find(item => item.key === fundKey); if (!fund || !snapshot || snapshot.fundKey !== fundKey || !Number.isFinite(Number(snapshot.nav)) || !this.normalizeDate(snapshot.navDate)) return false; fund.nav = Number(snapshot.nav); fund.navDate = this.normalizeDate(snapshot.navDate); fund.updatedAt = this.formatTaipeiDateTime(Number(snapshot.fetchedAt || snapshot.savedAt || Date.now())); fund.navError = ''; fund.cacheMode = source; return true; },
		hydrateFundCache(fundKey) { try { const raw = localStorage.getItem(this.getNavStorageKey(fundKey)); const snapshot = raw ? JSON.parse(raw) : null; return this.applyNavSnapshot(fundKey, snapshot, 'local'); } catch { return false; } },
		hydrateFundCaches() { this.funds.forEach(fund => this.hydrateFundCache(fund.key)); },
		async refreshFundNav(fundKey, force = false) { const fund = this.funds.find(item => item.key === fundKey); if (!fund || fund.isRefreshing) return false; fund.isRefreshing = true; fund.navError = ''; try { const request = this.getNavRequest(fundKey, force); const abortController = new AbortController(); const timeout = window.setTimeout(() => abortController.abort(), 12000); let response; try { response = await fetch(request.url, { cache: 'no-store', credentials: request.isExternalProxy ? 'omit' : 'same-origin', signal: abortController.signal }); } finally { window.clearTimeout(timeout); } if (!response.ok) throw new Error(`官方淨值服務回應 ${ response.status }`); const payload = await response.json(); const snapshot = request.isExternalProxy ? payload : payload?.result?.data?.json; if (!this.applyNavSnapshot(fundKey, snapshot)) throw new Error('官方淨值資料不完整'); try { localStorage.setItem(this.getNavStorageKey(fundKey), JSON.stringify({ ...snapshot, fundKey, savedAt: Date.now() })); } catch { } return true; } catch { fund.navError = '官方淨值更新失敗，已保留前次資料'; return false; } finally { fund.isRefreshing = false; } },
		async refreshAllFunds(force = true) { if (this.isRefreshingAll) return; this.isRefreshingAll = true; this.refreshSummary = force ? '正在重整四檔基金的官方淨值…' : '正在同步四檔基金淨值…'; this.refreshHasError = false; try { const results = await Promise.all(this.funds.map(fund => this.refreshFundNav(fund.key, force))); const failed = results.filter(result => !result).length; this.refreshHasError = failed > 0; this.refreshSummary = failed ? `${ failed } 檔基金更新失敗，已保留前次成功資料` : '四檔基金官方淨值已更新'; } finally { this.isRefreshingAll = false; } }
	}
};
</script>
