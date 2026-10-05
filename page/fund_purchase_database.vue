<template>
	<section class="fund_purchase_page fund_purchase_db_page">
		<section class="fund_selector fund_purchase_page_selector normal_shadow" aria-label="資料庫基金選擇">
			<div>
				<p class="fund_kicker">Supabase 資料庫</p>
				<h2>申購紀錄（資料庫）</h2>
				<p>此頁獨立管理資料庫中的申購、贖回與庫存；不會使用原申購紀錄的本機資料。</p>
			</div>
			<div class="fund_selector_list" role="tablist" aria-label="選擇資料庫基金申購紀錄">
				<button v-for="fund in funds" :key="fund.key" type="button" role="tab"
					:aria-selected="activeFundKey === fund.key"
					:class="['fund_selector_button', activeFundKey === fund.key ? 'is-active' : '']"
					:disabled="isSaving" @click="selectFund(fund.key)">
					<span>{{ fund.shortName }}</span><small>{{ fund.riskLevel }}</small>
				</button>
			</div>
		</section>

		<section v-if="!isLoading && !session" class="fund_purchase_page_content" aria-label="資料庫申購紀錄登入提示">
			<article class="fund_purchase_page_card normal_shadow">
				<p class="fund_kicker">需要登入</p>
				<h3>請先登入以讀取資料庫申購與贖回紀錄</h3>
				<p class="fund_purchase_page_note">登入後才能讀取與管理自己的申購及贖回紀錄。</p>
				<p v-if="pageError" class="fund_purchase_page_modal_error" role="alert">{{ pageError }}</p>
				<router-link class="fund_purchase_page_add_button" to="/login">前往登入</router-link>
			</article>
		</section>

		<template v-else>
			<header class="fund_purchase_page_hero normal_shadow">
				<div>
					<p class="fund_kicker">目前選擇基金</p>
					<h2>{{ activeFund.name }}</h2>
					<p>資料庫帳號：{{ userEmail || '驗證中' }}。已結算贖回採先進先出；處理中贖回僅保留單位。</p>
				</div>
				<div class="fund_purchase_page_refresh">
					<button class="fund_purchase_page_refresh_button" type="button"
						:disabled="isLoading || isRefreshingNavs || isSaving" @click="refreshPageData">
						<svg class="fund_refresh_icon" :class="{ 'is-spinning': isLoading || isRefreshingNavs }"
							viewBox="0 0 24 24" aria-hidden="true">
							<path d="M20 11a8 8 0 1 0 2 5.5M20 4v7h-7"></path>
						</svg>{{ isLoading || isRefreshingNavs ? '正在更新資料庫與淨值' : '更新資料庫與淨值' }}
					</button>
					<p v-if="lastLoadedAt" class="fund_purchase_page_refresh_status">資料庫最後載入：{{
						formatTaipeiDateTime(lastLoadedAt) }}</p>
					<p class="fund_purchase_page_refresh_status" :class="{ 'is-error': activeFund.navError }">{{
						activeNavStatus }}</p>
				</div>
			</header>

			<section class="fund_purchase_page_totals" aria-label="資料庫基金申購與贖回總覽">
				<article class="fund_purchase_page_total normal_shadow">
					<span>四檔基金合計總損益</span><strong :class="getChangeClass(allFundsProfitLoss)">{{
						formatSignedTwd(allFundsProfitLoss) }}</strong>
					<small>已實現與尚餘部位未實現損益合計</small>
				</article>
				<article class="fund_purchase_page_total normal_shadow">
					<span>{{ activeFund.name }}庫存損益</span><strong
						:class="getChangeClass(activeLedger.unrealizedProfitLoss)">{{
							formatSignedTwd(activeLedger.unrealizedProfitLoss) }}</strong>
					<small>先進先出，僅計算尚餘部位</small>
				</article>
				<article class="fund_purchase_page_total normal_shadow">
					<span>{{ activeFund.name }}總投入本金</span><strong>{{ formatTwd(activeFundTotalPrincipal) }}</strong>
					<small>歷次申購原始本金，包含待補資料</small>
				</article>
				<article class="fund_purchase_page_total normal_shadow">
					<span>{{ activeFund.name }}總市值</span><strong>{{ formatTwd(activeLedger.marketValue) }}</strong>
					<small>已扣除已結算贖回部位</small>
				</article>
				<article class="fund_purchase_page_total fund_purchase_page_realized_total normal_shadow">
					<span>累積已實現損益</span><strong :class="getChangeClass(activeLedger.realizedProfitLoss)">{{
						formatSignedTwd(activeLedger.realizedProfitLoss) }}</strong>
					<small>僅計入已結算贖回</small>
				</article>
				<article class="fund_purchase_page_total fund_purchase_page_pending_total normal_shadow">
					<span>目前基金待補資料</span><strong>{{ activeIncompleteRecordCount }}
						筆</strong><small>申購淨值或庫存單位數尚未填寫</small>
				</article>
			</section>

			<section class="fund_purchase_page_content" aria-label="資料庫申購與贖回紀錄">
				<article class="fund_purchase_page_card normal_shadow">
					<header class="fund_purchase_page_card_head">
						<div>
							<p class="fund_kicker">資料庫紀錄</p>
							<h3>{{ activeFund.name }}</h3>
							<div class="fund_purchase_page_tabs" role="tablist" aria-label="資料庫申購、贖回與庫存總覽">
								<button v-for="tab in recordTabs" :key="tab.key" type="button" role="tab"
									:aria-selected="activeTab === tab.key"
									:class="['fund_purchase_page_tab_button', activeTab === tab.key ? 'is-active' : '']"
									@click="activeTab = tab.key">{{ tab.label }}</button>
							</div>
						</div>
						<div class="fund_purchase_page_nav"><span>最新公開淨值</span><strong>{{ formatNav(activeFund.nav)
								}}</strong><small>淨值日期 {{ formatDate(activeFund.navDate) }} · {{
									formatTime(activeFund.navUpdatedAt) }}</small></div>
					</header>
					<p v-if="pageError" class="fund_purchase_page_modal_error" role="alert">{{ pageError }}</p>
					<p v-if="activeLedger.invalidRedemptionIds.length" class="fund_purchase_page_modal_error"
						role="alert">有 {{ activeLedger.invalidRedemptionIds.length }}
						筆已結算贖回超過交易當日可用單位或資料不完整，尚未納入計算。請檢查申購日期、單位數與贖回紀錄。</p>

					<section v-if="activeTab === 'purchase'" aria-label="資料庫申購紀錄">
						<div class="fund_purchase_page_card_controls">
							<button class="fund_purchase_page_add_button" type="button"
								:disabled="!session || isLoading || isSaving" @click="openPurchaseModal('add')">＋
								新增申購紀錄</button>
							<button :class="['fund_purchase_page_filter_button', showOnlyIncomplete ? 'is-active' : '']"
								type="button" :aria-pressed="showOnlyIncomplete"
								@click="showOnlyIncomplete = !showOnlyIncomplete">{{ showOnlyIncomplete ? '顯示全部紀錄' :
								'僅顯示待補資料' }}</button>
						</div>
						<p class="fund_purchase_page_note">列表顯示贖回後的剩餘成本與單位；編輯視窗保留原始申購資料，請勿再手動扣除贖回。</p>
						<div class="fund_purchase_page_table_box">
							<table class="fund_purchase_page_table">
								<thead>
									<tr>
										<th>日期</th>
										<th>剩餘成本</th>
										<th>申購淨值</th>
										<th>剩餘單位數</th>
										<th>市值</th>
										<th>報酬率</th>
										<th>損益</th>
										<th>操作</th>
									</tr>
								</thead>
								<tbody>
									<tr v-if="visibleRecords.length === 0">
										<td colspan="8" class="fund_purchase_page_empty">{{ isLoading ? '正在讀取資料庫資料…' :
											'資料庫目前沒有符合篩選條件的申購紀錄。' }}</td>
									</tr>
									<tr v-for="record in visibleRecords" :key="record.id">
										<td>{{ formatDate(record.date) }}<span v-if="record.isIncomplete"
												class="fund_purchase_page_pending_badge">待補資料</span></td>
										<td>{{ formatTwd(record.remainingPrincipal) }}</td>
										<td>{{ formatNav(record.subscriptionNav) }}</td>
										<td>{{ formatUnits(record.remainingUnits) }}</td>
										<td>{{ formatTwd(record.marketValue) }}</td>
										<td><strong :class="getChangeClass(record.returnPct)">{{
											formatPercent(record.returnPct) }}</strong></td>
										<td><strong :class="getChangeClass(record.profitLoss)">{{
											formatSignedTwd(record.profitLoss) }}</strong></td>
										<td><button class="fund_purchase_page_edit_button" type="button"
												:disabled="isLoading || isSaving"
												:aria-label="`編輯 ${formatDate(record.date)} 的資料庫申購紀錄`"
												@click="openPurchaseModal('edit', record)">編輯</button></td>
									</tr>
								</tbody>
							</table>
						</div>
						<div class="fund_purchase_page_mobile_records" aria-label="行動版資料庫申購紀錄">
							<p v-if="visibleRecords.length === 0" class="fund_purchase_page_mobile_empty">{{ isLoading ?
								'正在讀取資料庫資料…' : '資料庫目前沒有符合篩選條件的申購紀錄。' }}</p>
							<article v-for="record in visibleRecords" :key="`mobile-${record.id}`"
								class="fund_purchase_page_mobile_record">
								<div class="fund_purchase_page_mobile_record_top">
									<div class="fund_purchase_page_mobile_record_date"><strong>{{
										formatDate(record.date) }}</strong><span v-if="record.isIncomplete"
											class="fund_purchase_page_pending_badge">待補資料</span></div><span
										:class="getChangeClass(record.returnPct)">{{ formatPercent(record.returnPct)
										}}</span>
								</div>
								<dl>
									<div>
										<dt>剩餘成本</dt>
										<dd>{{ formatTwd(record.remainingPrincipal) }}</dd>
									</div>
									<div>
										<dt>申購淨值</dt>
										<dd>{{ formatNav(record.subscriptionNav) }}</dd>
									</div>
									<div>
										<dt>剩餘單位數</dt>
										<dd>{{ formatUnits(record.remainingUnits) }}</dd>
									</div>
									<div>
										<dt>市值</dt>
										<dd>{{ formatTwd(record.marketValue) }}</dd>
									</div>
									<div>
										<dt>損益</dt>
										<dd :class="getChangeClass(record.profitLoss)">{{
											formatSignedTwd(record.profitLoss) }}</dd>
									</div>
								</dl>
								<button class="fund_purchase_page_edit_button fund_purchase_page_mobile_edit_button"
									type="button" :disabled="isLoading || isSaving"
									@click="openPurchaseModal('edit', record)">編輯這筆紀錄</button>
							</article>
						</div>
					</section>

					<section v-else-if="activeTab === 'redemption'" aria-label="資料庫贖回紀錄">
						<div class="fund_purchase_page_redemption_intro">
							<div><strong>可再贖回 {{ formatUnits(activeLedger.availableRedemptionUnits) }}</strong><span>已扣除
									{{ formatUnits(activeLedger.pendingUnits) }} 處理中保留單位</span></div>
							<button class="fund_purchase_page_add_button fund_purchase_page_redemption_add_button"
								type="button" :disabled="!session || isLoading || isSaving"
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
										<td colspan="8" class="fund_purchase_page_empty">尚無資料庫贖回紀錄。</td>
									</tr>
									<tr v-for="record in activeRedemptionRecords" :key="record.id">
										<td>{{ formatDate(record.date) }}</td>
										<td><span :class="['fund_purchase_page_status_badge', `is-${record.status}`]">{{
											formatRedemptionStatus(record.status) }}</span></td>
										<td>{{ formatUnits(record.units) }}</td>
										<td>{{ record.status === 'settled' ? formatNav(record.redemptionNav) : '—' }}
										</td>
										<td>{{ record.status === 'settled' ?
											formatTwd(getRedemptionMetric(record).netProceeds) : '—' }}</td>
										<td>{{ record.status === 'settled' ?
											formatTwd(getRedemptionMetric(record).costBasis) : '—' }}<small
												v-if="record.status === 'settled'" style="display:block">{{
													formatRedemptionAllocation(record) }}</small></td>
										<td><strong
												:class="getChangeClass(getRedemptionMetric(record).realizedProfitLoss)">{{
													record.status === 'settled' ?
														formatSignedTwd(getRedemptionMetric(record).realizedProfitLoss) : '—'
												}}</strong></td>
										<td><button class="fund_purchase_page_edit_button" type="button"
												:disabled="isLoading || isSaving"
												@click="openRedemptionModal('edit', record)">編輯</button></td>
									</tr>
								</tbody>
							</table>
						</div>
						<div class="fund_purchase_page_mobile_records" aria-label="行動版資料庫贖回紀錄">
							<p v-if="activeRedemptionRecords.length === 0" class="fund_purchase_page_mobile_empty">
								尚無資料庫贖回紀錄。</p>
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
										<dd>{{ record.status === 'settled' ? formatNav(record.redemptionNav) : '—' }}
										</dd>
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
									<div v-if="record.status === 'settled'">
										<dt>扣除申購</dt>
										<dd>{{ formatRedemptionAllocation(record) }}</dd>
									</div>
									<div>
										<dt>已實現損益</dt>
										<dd :class="getChangeClass(getRedemptionMetric(record).realizedProfitLoss)">{{
											record.status === 'settled' ?
												formatSignedTwd(getRedemptionMetric(record).realizedProfitLoss) : '—' }}
										</dd>
									</div>
								</dl>
								<button class="fund_purchase_page_edit_button fund_purchase_page_mobile_edit_button"
									type="button" :disabled="isLoading || isSaving"
									@click="openRedemptionModal('edit', record)">編輯這筆紀錄</button>
							</article>
						</div>
					</section>

					<section v-else class="fund_purchase_page_inventory" aria-label="資料庫庫存總覽">
						<div class="fund_purchase_page_inventory_grid">
							<article><span>已申購單位</span><strong>{{ formatUnits(activeLedger.purchasedUnits)
									}}</strong><small>僅計入資料完整的申購紀錄</small></article>
							<article><span>已結算贖回</span><strong>{{ formatUnits(activeLedger.settledUnits)
									}}</strong><small>已自尚餘部位扣除</small></article>
							<article><span>處理中保留</span><strong>{{ formatUnits(activeLedger.pendingUnits)
									}}</strong><small>尚未計入已實現損益</small></article>
							<article><span>尚餘持有單位</span><strong>{{ formatUnits(activeLedger.remainingUnits)
									}}</strong><small>可用單位 {{ formatUnits(activeLedger.availableRedemptionUnits)
									}}</small></article>
							<article><span>尚餘部位成本</span><strong>{{ formatTwd(activeLedger.remainingCost)
									}}</strong><small>已扣除已結算贖回成本</small></article>
							<article><span>尚餘部位市值</span><strong>{{ formatTwd(activeLedger.marketValue)
									}}</strong><small>依最新公開淨值試算</small></article>
							<article><span>尚餘部位未實現損益</span><strong
									:class="getChangeClass(activeLedger.unrealizedProfitLoss)">{{
										formatSignedTwd(activeLedger.unrealizedProfitLoss)
									}}</strong><small>尚餘市值減尚餘成本</small></article>
							<article><span>基金合計損益</span><strong :class="getChangeClass(activeLedger.totalProfitLoss)">{{
								formatSignedTwd(activeLedger.totalProfitLoss) }}</strong><small>已實現與未實現損益合計</small>
							</article>
						</div>
						<p class="fund_purchase_page_inventory_note">
							先進先出：已結算贖回依申購日期由早到晚扣除單位。部分贖回按該筆申購淨值扣除成本，整筆贖完則扣清剩餘成本。處理中交易僅保留單位；取消交易不影響庫存。</p>
					</section>
				</article>
			</section>
		</template>

		<div v-if="purchaseModal.mode" class="alert fund_purchase_page_modal showAdd" role="dialog" aria-modal="true"
			aria-labelledby="fund-purchase-db-modal-title" @click.self="closePurchaseModal">
			<div class="alert_box">
				<button class="alert_close" type="button" aria-label="關閉資料庫申購紀錄視窗" :disabled="isSaving"
					@click="closePurchaseModal"><svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M18 6 6 18M6 6l12 12"></path>
					</svg></button>
				<div class="alert_title"><span id="fund-purchase-db-modal-title">{{ purchaseModal.mode === 'edit' ?
					'編輯資料庫申購紀錄'
					: '新增資料庫申購紀錄' }}</span>
					<p>{{ activeFund.name }}</p>
				</div>
				<form class="alert_content" @submit.prevent="saveDatabaseRecord">
					<div class="alert_content_item" data-txt="日期"><input v-model="purchaseModal.form.date"
							class="alert_inp" type="date" required :disabled="isSaving"></div>
					<div class="alert_content_item" data-txt="原始投入本金"><input v-model="purchaseModal.form.principal"
							class="alert_inp" type="number" min="0.01" step="0.01" placeholder="請輸入原始投入本金" required
							:disabled="isSaving"></div>
					<div class="alert_content_item" data-txt="申購淨值（選填）"><input
							v-model="purchaseModal.form.subscriptionNav" class="alert_inp" type="number" min="0.01"
							step="0.01" placeholder="尚未取得可留白" :disabled="isSaving">
					</div>
					<div class="alert_content_item" data-txt="原始申購單位數（選填）"><input v-model="purchaseModal.form.units"
							class="alert_inp" type="number" min="0.01" step="0.01" inputmode="decimal"
							placeholder="最多小數點後兩位" :disabled="isSaving"></div>
					<p v-if="purchaseModal.error" class="fund_purchase_page_modal_error" role="alert">{{
						purchaseModal.error }}
					</p>
					<p class="fund_purchase_page_modal_hint">
						請填原始申購本金與單位，系統會自動扣除已結算贖回，勿在此重複扣除。選填欄位留白會顯示為待補資料。單位數最多小數點後兩位。</p>
					<div class="alert_funcbox"><button class="normal_btn _secondary" type="button" :disabled="isSaving"
							@click="closePurchaseModal">取消</button><button class="normal_btn _primary" type="submit"
							:disabled="isSaving">{{ isSaving ? '儲存中…' : purchaseModal.mode === 'edit' ? '儲存更新' : '新增紀錄'
							}}</button></div>
				</form>
			</div>
		</div>

		<div v-if="redemptionModal.mode" class="alert fund_purchase_page_modal showAdd" role="dialog" aria-modal="true"
			aria-labelledby="fund-redemption-db-modal-title" @click.self="closeRedemptionModal">
			<div class="alert_box">
				<button class="alert_close" type="button" aria-label="關閉資料庫贖回紀錄視窗" :disabled="isSaving"
					@click="closeRedemptionModal"><svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M18 6 6 18M6 6l12 12"></path>
					</svg></button>
				<div class="alert_title"><span id="fund-redemption-db-modal-title">{{ redemptionModal.mode === 'edit' ?
					'編輯資料庫贖回紀錄' : '新增資料庫贖回紀錄' }}</span>
					<p>{{ activeFund.name }} · 先進先出</p>
				</div>
				<form class="alert_content" @submit.prevent="saveDatabaseRedemption">
					<div class="alert_content_item" data-txt="贖回日期"><input v-model="redemptionModal.form.date"
							class="alert_inp" type="date" required :disabled="isSaving"></div>
					<div class="alert_content_item" data-txt="狀態"><select v-model="redemptionModal.form.status"
							class="alert_inp" :disabled="isSaving">
							<option value="pending">處理中</option>
							<option value="settled">已結算</option>
							<option value="cancelled">取消</option>
						</select></div>
					<div class="alert_content_item" data-txt="贖回單位數"><input v-model="redemptionModal.form.units"
							class="alert_inp" type="number" min="0.01" step="0.01" inputmode="decimal" required
							:disabled="isSaving"></div>
					<div class="alert_content_item" data-txt="贖回淨值（已結算必填）"><input
							v-model="redemptionModal.form.redemptionNav" class="alert_inp" type="number" min="0.01"
							step="0.01" :required="redemptionModal.form.status === 'settled'"
							:disabled="isSaving || redemptionModal.form.status !== 'settled'"></div>
					<div class="alert_content_item" data-txt="手續費"><input v-model="redemptionModal.form.fee"
							class="alert_inp" type="number" min="0" step="0.01" :disabled="isSaving"></div>
					<div class="alert_content_item" data-txt="稅費／其他扣款"><input v-model="redemptionModal.form.tax"
							class="alert_inp" type="number" min="0" step="0.01" :disabled="isSaving"></div>
					<div class="alert_content_item" data-txt="備註"><input v-model="redemptionModal.form.note"
							class="alert_inp" type="text" maxlength="100" placeholder="選填，例如入帳銀行或交易單號"
							:disabled="isSaving"></div>
					<p class="fund_purchase_page_modal_available">目前可再贖回：{{ formatUnits(redemptionAvailableUnits) }}</p>
					<p v-if="redemptionModal.error" class="fund_purchase_page_modal_error" role="alert">{{
						redemptionModal.error
						}}</p>
					<p class="fund_purchase_page_modal_hint">已結算贖回從最早申購扣除，不足時接續下一筆。處理中僅保留單位，取消不影響庫存。儲存時會檢查交易日期是否有足夠單位。
					</p>
					<div class="alert_funcbox"><button class="normal_btn _secondary" type="button" :disabled="isSaving"
							@click="closeRedemptionModal">取消</button><button class="normal_btn _primary" type="submit"
							:disabled="isSaving">{{ isSaving ? '儲存中…' : redemptionModal.mode === 'edit' ? '儲存更新' :
							'儲存贖回紀錄'
							}}</button></div>
				</form>
			</div>
		</div>

		<p v-if="saveMessage" class="fund_purchase_page_save_toast" role="status">{{ saveMessage }}</p>
		<p v-if="session" class="fund_purchase_page_note">庫存損益＝剩餘單位 × 最新公開淨值－剩餘成本。已實現損益＝贖回入帳淨額－該次贖回成本；合計損益包含兩者。入帳淨額依單位 ×
			贖回淨值－費用計算，與券商整元入帳可能有小數尾差。</p>
	</section>
</template>

<script>
// 完整替換版：FIFO、剩餘部位列表、贖回來源、交易日期驗證。
const FUND_PURCHASE_DATABASE_PAGE_VERSION = 'fund-purchase-db-v1.2.0-2026.10.05';
const FUND_PURCHASE_DB_KEYS = [
	{ key: 'taiwanTechnology', shortName: '安聯台灣科技', name: '安聯台灣科技基金', riskLevel: 'RR5', nav: 760.91, navDate: '2026-08-11' },
	{ key: 'taiwanDaba', shortName: '安聯台灣大壩', name: '安聯台灣大壩基金 A', riskLevel: 'RR4', nav: 313.43, navDate: '2026-08-11' },
	{ key: 'taiwanIntelligence', shortName: '安聯台灣智慧', name: '安聯台灣智慧基金', riskLevel: 'RR4', nav: 409.63, navDate: '2026-08-11' },
	{ key: 'fuhwaOmni', shortName: '復華全方位 A', name: '復華全方位基金 A', riskLevel: 'RR4', nav: 196.74, navDate: '2026-08-12' },
];
const PURCHASE_COLUMNS = 'id, fund_key, purchase_date, principal, subscription_nav, units, created_at, updated_at';
const REDEMPTION_COLUMNS = 'id, fund_key, redemption_date, status, units, redemption_nav, fee, tax, note, created_at, updated_at';
const EPSILON = 0.000001;
const emptyPurchaseModal = () => ({ mode: '', editingId: '', form: { date: '', principal: '', subscriptionNav: '', units: '' }, error: '' });
const emptyRedemptionModal = () => ({ mode: '', editingId: '', form: { date: '', status: 'pending', units: '', redemptionNav: '', fee: '0', tax: '0', note: '' }, error: '' });

module.exports = {
	data() {
		return {
			funds: FUND_PURCHASE_DB_KEYS.map(fund => ({ ...fund, navUpdatedAt: '', navError: '', cacheMode: '', isRefreshing: false })),
			activeFundKey: 'taiwanTechnology', activeTab: 'purchase',
			recordTabs: [{ key: 'purchase', label: '申購紀錄' }, { key: 'redemption', label: '贖回紀錄' }, { key: 'inventory', label: '庫存總覽' }],
			records: [], redemptions: [], session: null,
			isLoading: true, isSaving: false, isRefreshingNavs: false, isBootstrapping: false, isDisposed: false,
			pageError: '', saveMessage: '', lastLoadedAt: 0, showOnlyIncomplete: false,
			purchaseModal: emptyPurchaseModal(), redemptionModal: emptyRedemptionModal(),
		};
	},
	computed: {
		activeFund() { return this.funds.find(fund => fund.key === this.activeFundKey) || this.funds[0]; },
		userEmail() { return this.session?.user?.email || ''; },
		activeLedger() { return this.calculateFundLedger(this.activeFundKey); },
		activeRecords() {
			const metrics = this.activeLedger.purchaseMetrics;
			return this.records.filter(record => record.fundKey === this.activeFundKey)
				.slice().sort((a, b) => b.date.localeCompare(a.date) || String(b.createdAt).localeCompare(String(a.createdAt)))
				.map(record => ({
					...this.calculateRecord(record, this.activeFund.nav),
					remainingPrincipal: record.principal,
					remainingUnits: record.units,
					...(metrics[String(record.id)] || {}),
				}));
		},
		visibleRecords() { return this.showOnlyIncomplete ? this.activeRecords.filter(record => record.isIncomplete) : this.activeRecords; },
		activeIncompleteRecordCount() { return this.activeRecords.filter(record => record.isIncomplete).length; },
		activeRedemptionRecords() {
			return this.redemptions.filter(record => record.fundKey === this.activeFundKey).slice()
				.sort((a, b) => b.date.localeCompare(a.date) || String(b.createdAt).localeCompare(String(a.createdAt)));
		},
		redemptionAvailableUnits() { return this.getRedeemableUnitsForModal(); },
		activeFundTotalPrincipal() {
			return this.records.filter(record => record.fundKey === this.activeFundKey).reduce((total, record) => {
				const principal = Number(record.principal);
				return total + (Number.isFinite(principal) && principal > 0 ? principal : 0);
			}, 0);
		},
		allFundsProfitLoss() {
			const values = this.funds.map(fund => this.calculateFundLedger(fund.key).totalProfitLoss);
			return values.every(value => Number.isFinite(value)) ? values.reduce((total, value) => total + value, 0) : null;
		},
		activeNavStatus() {
			if (this.isRefreshingNavs) return '正在同步四檔基金最新公開淨值…';
			if (this.activeFund.navError) return this.activeFund.navError;
			return this.activeFund.navUpdatedAt ? `最新公開淨值已更新：${this.activeFund.navUpdatedAt}` : '尚未更新，暫用預設淨值，請確認淨值日期';
		},
	},
	async mounted() {
		this.authChangeHandler = event => {
			const previousUserId = this.session?.user?.id;
			this.session = event.detail?.session || null;
			if (!this.session || previousUserId !== this.session.user?.id) {
				this.records = []; this.redemptions = []; this.lastLoadedAt = 0;
				this.pageError = ''; this.saveMessage = '';
				this.resetPurchaseModal(); this.resetRedemptionModal();
			}
			if (this.session && event.detail?.event === 'SIGNED_IN') {
				// 避免在同步 Auth 事件處理期間重入驗證服務。
				window.setTimeout(() => { if (!this.isDisposed) this.bootstrap(); }, 0);
			}
		};
		window.addEventListener('cashflow-auth-change', this.authChangeHandler);
		try { await this.bootstrap(); }
		finally { this.$store?.dispatch('SET_LOADING_ACTION', false); }
	},
	beforeUnmount() {
		this.isDisposed = true;
		window.removeEventListener('cashflow-auth-change', this.authChangeHandler);
	},
	methods: {
		async bootstrap() {
			if (this.isBootstrapping || this.isDisposed) return;
			this.isBootstrapping = true; this.isLoading = true; this.pageError = '';
			try {
				const auth = window.CASHFLOW_SUPABASE_AUTH;
				if (!auth || typeof auth.getSession !== 'function' || typeof auth.getClient !== 'function') throw new Error('登入服務尚未載入，請重新整理後再試一次。');
				await auth.subscribe();
				const session = await auth.getSession();
				if (this.isDisposed) return;
				this.session = session;
				if (!session) return;
				this.hydrateFundCaches();
				await this.loadDatabaseRecords();
				if (!this.isDisposed && this.session) this.refreshAllFundNav(false);
			} catch (error) {
				this.pageError = this.getFriendlyError(error, '無法初始化資料庫申購與贖回紀錄。');
			} finally { this.isBootstrapping = false; this.isLoading = false; }
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
			const userId = this.session.user?.id;
			this.isLoading = true; this.pageError = '';
			try {
				const client = await this.getDbClient();
				const [purchaseResponse, redemptionResponse] = await Promise.all([
					client.from('fund_purchase_records').select(PURCHASE_COLUMNS).order('purchase_date', { ascending: false }).order('created_at', { ascending: false }),
					client.from('fund_redemption_records').select(REDEMPTION_COLUMNS).order('redemption_date', { ascending: false }).order('created_at', { ascending: false }),
				]);
				if (purchaseResponse.error) throw purchaseResponse.error;
				if (redemptionResponse.error) throw redemptionResponse.error;
				if (this.isDisposed || !this.session || this.session.user?.id !== userId) return false;
				this.records = (purchaseResponse.data || []).map(row => this.mapDatabaseRecord(row)).filter(Boolean);
				this.redemptions = (redemptionResponse.data || []).map(row => this.mapDatabaseRedemption(row)).filter(Boolean);
				this.lastLoadedAt = Date.now(); return true;
			} catch (error) {
				if (!this.isDisposed && this.session?.user?.id === userId) this.pageError = this.getFriendlyError(error, '讀取資料庫申購與贖回紀錄失敗。');
				return false;
			} finally { this.isLoading = false; }
		},
		getNavStorageKey(fundKey) { return `cashflow-manager:fund-nav:v1:${fundKey}`; },
		hydrateFundCache(fundKey) {
			try {
				const raw = localStorage.getItem(this.getNavStorageKey(fundKey));
				return this.applyNavSnapshot(fundKey, raw ? JSON.parse(raw) : null, 'local');
			} catch { return false; }
		},
		hydrateFundCaches() { this.funds.forEach(fund => this.hydrateFundCache(fund.key)); },
		applyNavSnapshot(fundKey, snapshot, source = 'remote') {
			const fund = this.funds.find(item => item.key === fundKey);
			if (!fund || !snapshot || snapshot.fundKey !== fundKey || !Number.isFinite(Number(snapshot.nav)) || Number(snapshot.nav) <= 0 || !this.normalizeDate(snapshot.navDate)) return false;
			fund.nav = Number(snapshot.nav); fund.navDate = this.normalizeDate(snapshot.navDate);
			fund.navUpdatedAt = this.formatTaipeiDateTime(Number(snapshot.fetchedAt || snapshot.savedAt || Date.now()));
			fund.navError = ''; fund.cacheMode = source; return true;
		},
		getWorkerBaseUrl() { return typeof window.CASHFLOW_QUOTE_PROXY_URL === 'string' ? window.CASHFLOW_QUOTE_PROXY_URL.trim().replace(/\/+$/, '') : ''; },
		getNavRequest(fundKey, force = false) {
			const base = this.getWorkerBaseUrl();
			if (base) {
				const endpoint = new URL(`${base}/nav`);
				endpoint.searchParams.set('fund', fundKey); endpoint.searchParams.set('cacheVersion', '4');
				if (force) endpoint.searchParams.set('force', '1');
				return { url: endpoint.toString(), isExternalProxy: true };
			}
			if (window.location.hostname.endsWith('.github.io')) throw new Error('GitHub Pages 尚未設定 Cloudflare Worker 淨值端點');
			const input = encodeURIComponent(JSON.stringify({ json: { fund: fundKey, force } }));
			return { url: `/api/trpc/market.officialNav?input=${input}`, isExternalProxy: false };
		},
		async refreshFundNav(fundKey, force = false) {
			const fund = this.funds.find(item => item.key === fundKey);
			if (!fund || fund.isRefreshing || this.isDisposed) return false;
			fund.isRefreshing = true; fund.navError = '';
			let timeout;
			try {
				const request = this.getNavRequest(fundKey, force);
				const controller = new AbortController();
				timeout = window.setTimeout(() => controller.abort(), request.isExternalProxy ? 25000 : 12000);
				const response = await fetch(request.url, { cache: 'no-store', credentials: request.isExternalProxy ? 'omit' : 'same-origin', signal: controller.signal });
				if (!response.ok) throw new Error(`官方淨值服務回應 ${response.status}`);
				const payload = await response.json();
				const snapshot = request.isExternalProxy ? payload : payload?.result?.data?.json;
				if (this.isDisposed) return false;
				if (!this.applyNavSnapshot(fundKey, snapshot, 'remote')) throw new Error('官方淨值資料不完整');
				try { localStorage.setItem(this.getNavStorageKey(fundKey), JSON.stringify({ ...snapshot, fundKey, savedAt: Date.now() })); } catch { }
				return true;
			} catch {
				fund.navError = fund.navUpdatedAt ? '官方淨值更新失敗，已保留前次資料；請確認日期' : '官方淨值更新失敗，暫用預設淨值；請確認日期';
				return false;
			} finally { window.clearTimeout(timeout); fund.isRefreshing = false; }
		},
		async refreshAllFundNav(force = false) {
			if (this.isRefreshingNavs || this.isDisposed) return false;
			this.isRefreshingNavs = true;
			try { return (await Promise.all(this.funds.map(fund => this.refreshFundNav(fund.key, force)))).every(Boolean); }
			finally { this.isRefreshingNavs = false; }
		},
		async refreshPageData() {
			if (!this.session || this.isLoading || this.isSaving) return;
			await Promise.all([this.loadDatabaseRecords(), this.refreshAllFundNav(true)]);
		},
		selectFund(fundKey) {
			if (this.isSaving || !this.funds.some(fund => fund.key === fundKey)) return;
			this.resetPurchaseModal(); this.resetRedemptionModal();
			this.activeFundKey = fundKey; this.showOnlyIncomplete = false; this.activeTab = 'purchase'; this.saveMessage = '';
		},
		getTodayInputDate() { return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); },
		openPurchaseModal(mode, record = null) {
			if (!this.session || this.isLoading || this.isSaving) return;
			const current = record || {};
			this.saveMessage = ''; this.resetRedemptionModal();
			this.purchaseModal = { mode, editingId: current.id || '', form: { date: current.date ? this.normalizeDate(current.date) : this.getTodayInputDate(), principal: current.principal ?? '', subscriptionNav: current.subscriptionNav ?? '', units: current.units ?? '' }, error: '' };
		},
		resetPurchaseModal() { this.purchaseModal = emptyPurchaseModal(); },
		closePurchaseModal() { if (!this.isSaving) this.resetPurchaseModal(); },
		openRedemptionModal(mode, record = null) {
			if (!this.session || this.isLoading || this.isSaving) return;
			const current = record || {};
			this.saveMessage = ''; this.resetPurchaseModal();
			this.redemptionModal = { mode, editingId: current.id || '', form: { date: current.date ? this.normalizeDate(current.date) : this.getTodayInputDate(), status: current.status || 'pending', units: current.units ?? '', redemptionNav: current.redemptionNav ?? '', fee: current.fee ?? '0', tax: current.tax ?? '0', note: current.note || '' }, error: '' };
		},
		resetRedemptionModal() { this.redemptionModal = emptyRedemptionModal(); },
		closeRedemptionModal() { if (!this.isSaving) this.resetRedemptionModal(); },
		normalizeDate(value) {
			const match = String(value || '').match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:$|[T\s])/);
			if (!match) return '';
			const [, year, month, day] = match;
			const normalized = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
			const date = new Date(`${normalized}T00:00:00Z`);
			return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === normalized ? normalized : '';
		},
		normalizeOptionalPositive(value, fieldName, maximumDecimalPlaces = null) {
			if (value === '' || value === null || value === undefined) return null;
			const text = String(value).trim();
			if (!text) return null;
			const number = Number(text);
			if (!Number.isFinite(number) || number <= 0) throw new Error(`${fieldName}必須是大於 0 的數字，或留白`);
			if (maximumDecimalPlaces !== null && !new RegExp(`^\\d+(?:\\.\\d{1,${maximumDecimalPlaces}})?$`).test(text)) throw new Error(`${fieldName}最多可輸入小數點後 ${maximumDecimalPlaces} 位`);
			return number;
		},
		normalizeNonNegative(value, fieldName) {
			const text = String(value ?? '').trim() || '0';
			const number = Number(text);
			if (!Number.isFinite(number) || number < 0 || !/^\d+(?:\.\d{1,2})?$/.test(text)) throw new Error(`${fieldName}必須是小數點後最多兩位的非負數`);
			return number;
		},
		buildDatabasePayload() {
			const form = this.purchaseModal.form;
			const date = this.normalizeDate(form.date);
			const principal = this.normalizeOptionalPositive(form.principal, '投入本金', 2);
			if (!date) throw new Error('請填寫有效日期');
			if (principal === null) throw new Error('投入本金必須大於 0');
			return { fund_key: this.activeFundKey, purchase_date: date, principal, subscription_nav: this.normalizeOptionalPositive(form.subscriptionNav, '申購淨值'), units: this.normalizeOptionalPositive(form.units, '庫存單位數', 2) };
		},
		buildRedemptionPayload() {
			const form = this.redemptionModal.form;
			const date = this.normalizeDate(form.date);
			const status = form.status;
			const units = this.normalizeOptionalPositive(form.units, '贖回單位數', 2);
			if (!date) throw new Error('請填寫有效贖回日期');
			if (!['pending', 'settled', 'cancelled'].includes(status)) throw new Error('請選擇正確的贖回狀態');
			if (units === null) throw new Error('請填寫大於 0 的贖回單位數');
			const nav = status === 'settled' ? this.normalizeOptionalPositive(form.redemptionNav, '贖回淨值') : null;
			if (status === 'settled' && nav === null) throw new Error('已結算贖回必須填寫大於 0 的正式贖回淨值');
			const payload = { fund_key: this.activeFundKey, redemption_date: date, status, units, redemption_nav: nav, fee: this.normalizeNonNegative(form.fee, '手續費'), tax: this.normalizeNonNegative(form.tax, '稅費／其他扣款'), note: String(form.note || '').trim().slice(0, 100) };
			const editingId = this.redemptionModal.mode === 'edit' ? String(this.redemptionModal.editingId) : '';
			const original = this.redemptions.find(record => String(record.id) === editingId);
			const candidate = this.mapDatabaseRedemption({ ...payload, id: editingId || '__new_redemption__', created_at: original?.createdAt || new Date().toISOString() });
			const candidates = this.redemptions.filter(record => String(record.id) !== editingId).concat(candidate);
			this.assertValidInventory(this.activeFundKey, candidates, this.records);
			return payload;
		},
		// 檢查每一個交易日期，避免使用未來的申購補足過去的贖回。
		assertValidInventory(fundKey, redemptions, purchases) {
			const events = purchases.filter(record => record.fundKey === fundKey && !this.isIncompletePurchaseRecord(record))
				.map(record => ({ date: record.date, type: 'purchase', units: Number(record.units) }))
				.concat(redemptions.filter(record => record && record.fundKey === fundKey && record.status !== 'cancelled')
					.map(record => ({ date: record.date, type: 'redemption', units: Number(record.units) })))
				.sort((a, b) => a.date.localeCompare(b.date) || (a.type === b.type ? 0 : a.type === 'purchase' ? -1 : 1));
			let available = 0;
			for (const event of events) {
				available += event.type === 'purchase' ? event.units : -event.units;
				if (available < -EPSILON) throw new Error(`${this.formatDate(event.date)} 的贖回與處理中保留單位超過當時可用庫存，請確認日期與單位數。`);
			}
		},
		async saveDatabaseRecord() {
			if (this.isSaving || !this.purchaseModal.mode) return;
			this.purchaseModal.error = ''; this.isSaving = true;
			const userId = this.session?.user?.id;
			const mode = this.purchaseModal.mode;
			const editingId = this.purchaseModal.editingId;
			try {
				if (!userId) throw new Error('登入工作階段已失效，請重新登入。');
				const payload = this.buildDatabasePayload();
				const original = this.records.find(record => record.id === editingId);
				const candidate = this.mapDatabaseRecord({ ...payload, id: editingId || '__new_purchase__', created_at: original?.createdAt || new Date().toISOString() });
				this.assertValidInventory(payload.fund_key, this.redemptions, this.records.filter(record => record.id !== editingId).concat(candidate));
				const client = await this.getDbClient();
				if (this.isDisposed || this.session?.user?.id !== userId) throw new Error('登入工作階段已變更，請重新操作。');
				const response = mode === 'edit'
					? await client.from('fund_purchase_records').update(payload).eq('id', editingId).select(PURCHASE_COLUMNS).single()
					: await client.from('fund_purchase_records').insert(payload).select(PURCHASE_COLUMNS).single();
				if (response.error) throw response.error;
				if (this.isDisposed || this.session?.user?.id !== userId) return;
				const saved = this.mapDatabaseRecord(response.data);
				if (!saved) throw new Error('資料庫回傳的申購紀錄格式不完整。');
				const index = this.records.findIndex(record => record.id === saved.id);
				if (index >= 0) this.records.splice(index, 1, saved); else this.records.unshift(saved);
				this.lastLoadedAt = Date.now(); this.saveMessage = mode === 'edit' ? '資料庫申購紀錄已更新。' : '資料庫申購紀錄已新增。';
				this.resetPurchaseModal();
			} catch (error) { this.purchaseModal.error = this.getFriendlyError(error, '儲存資料庫申購紀錄失敗。'); }
			finally { this.isSaving = false; }
		},
		async saveDatabaseRedemption() {
			if (this.isSaving || !this.redemptionModal.mode) return;
			this.redemptionModal.error = ''; this.isSaving = true;
			const userId = this.session?.user?.id;
			const mode = this.redemptionModal.mode;
			const editingId = this.redemptionModal.editingId;
			try {
				if (!userId) throw new Error('登入工作階段已失效，請重新登入。');
				const payload = this.buildRedemptionPayload();
				const client = await this.getDbClient();
				if (this.isDisposed || this.session?.user?.id !== userId) throw new Error('登入工作階段已變更，請重新操作。');
				const response = mode === 'edit'
					? await client.from('fund_redemption_records').update(payload).eq('id', editingId).select(REDEMPTION_COLUMNS).single()
					: await client.from('fund_redemption_records').insert(payload).select(REDEMPTION_COLUMNS).single();
				if (response.error) throw response.error;
				if (this.isDisposed || this.session?.user?.id !== userId) return;
				const saved = this.mapDatabaseRedemption(response.data);
				if (!saved) throw new Error('資料庫回傳的贖回紀錄格式不完整。');
				const index = this.redemptions.findIndex(record => record.id === saved.id);
				if (index >= 0) this.redemptions.splice(index, 1, saved); else this.redemptions.unshift(saved);
				this.lastLoadedAt = Date.now(); this.saveMessage = mode === 'edit' ? '資料庫贖回紀錄已更新。' : '資料庫贖回紀錄已新增。';
				this.resetRedemptionModal();
			} catch (error) { this.redemptionModal.error = this.getFriendlyError(error, '儲存資料庫贖回紀錄失敗。'); }
			finally { this.isSaving = false; }
		},
		mapDatabaseRecord(row) {
			const date = this.normalizeDate(row?.purchase_date);
			const principal = Number(row?.principal);
			if (!row?.id || !FUND_PURCHASE_DB_KEYS.some(fund => fund.key === row.fund_key) || !date || !Number.isFinite(principal) || principal <= 0) return null;
			return { id: String(row.id), fundKey: row.fund_key, date, principal, subscriptionNav: row.subscription_nav == null ? '' : Number(row.subscription_nav), units: row.units == null ? '' : Number(row.units), createdAt: row.created_at || '', updatedAt: row.updated_at || '' };
		},
		mapDatabaseRedemption(row) {
			const date = this.normalizeDate(row?.redemption_date);
			const units = Number(row?.units); const fee = Number(row?.fee || 0); const tax = Number(row?.tax || 0);
			const status = ['pending', 'settled', 'cancelled'].includes(row?.status) ? row.status : '';
			const nav = row?.redemption_nav == null ? null : Number(row.redemption_nav);
			if (!row?.id || !FUND_PURCHASE_DB_KEYS.some(fund => fund.key === row.fund_key) || !date || !status || !Number.isFinite(units) || units <= 0 || !Number.isFinite(fee) || fee < 0 || !Number.isFinite(tax) || tax < 0 || (status === 'settled' && (!Number.isFinite(nav) || nav <= 0))) return null;
			return { id: String(row.id), fundKey: row.fund_key, date, status, units, redemptionNav: status === 'settled' ? nav : null, fee, tax, note: String(row.note || '').slice(0, 100), createdAt: row.created_at || '', updatedAt: row.updated_at || '' };
		},
		isIncompletePurchaseRecord(record) {
			const missing = value => value === '' || value == null || !Number.isFinite(Number(value)) || Number(value) <= 0;
			return !record || missing(record.subscriptionNav) || missing(record.units);
		},
		calculateRecord(record, nav) {
			const isIncomplete = this.isIncompletePurchaseRecord(record);
			const marketValue = !isIncomplete && Number.isFinite(Number(nav)) && Number(nav) > 0 ? Number(record.units) * Number(nav) : null;
			const profitLoss = marketValue === null ? null : marketValue - Number(record.principal);
			return { ...record, isIncomplete, marketValue, profitLoss, returnPct: profitLoss !== null && Number(record.principal) > 0 ? profitLoss / Number(record.principal) * 100 : null };
		},
		calculateFundLedger(fundKey, redemptionRecords = null) {
			const purchases = this.records.filter(record => record.fundKey === fundKey && !this.isIncompletePurchaseRecord(record))
				.map(record => ({ id: String(record.id), date: this.normalizeDate(record.date), createdAt: record.createdAt || '', units: Number(record.units), principal: Number(record.principal), subscriptionNav: Number(record.subscriptionNav), remainingUnits: Number(record.units), remainingCost: Number(record.principal) }))
				.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
			const relevant = (redemptionRecords ?? this.redemptions).filter(record => record.fundKey === fundKey);
			const settled = relevant.filter(record => record.status === 'settled').slice()
				.sort((a, b) => this.normalizeDate(a.date).localeCompare(this.normalizeDate(b.date)) || String(a.createdAt || '').localeCompare(String(b.createdAt || '')) || String(a.id).localeCompare(String(b.id)));
			const purchasedUnits = purchases.reduce((total, lot) => total + lot.units, 0);
			const purchasedCost = purchases.reduce((total, lot) => total + lot.principal, 0);
			let settledUnits = 0; let realizedProfitLoss = 0;
			const redemptionMetrics = {}; const invalidRedemptionIds = [];
			for (const record of settled) {
				const id = String(record.id); const date = this.normalizeDate(record.date);
				const units = Number(record.units); const nav = Number(record.redemptionNav);
				const fee = Number(record.fee ?? 0); const tax = Number(record.tax ?? 0);
				const lots = purchases.filter(lot => lot.date <= date);
				const available = lots.reduce((total, lot) => total + lot.remainingUnits, 0);
				const valid = date && Number.isFinite(units) && units > 0 && Number.isFinite(nav) && nav > 0 && Number.isFinite(fee) && fee >= 0 && Number.isFinite(tax) && tax >= 0 && units <= available + EPSILON;
				if (!valid) {
					invalidRedemptionIds.push(id);
					redemptionMetrics[id] = { netProceeds: null, costBasis: null, realizedProfitLoss: null, isValid: false, allocations: [] };
					continue;
				}
				let needed = units; let costBasis = 0; const allocations = [];
				for (const lot of lots) {
					if (needed <= EPSILON) break;
					if (lot.remainingUnits <= 0) continue;
					const taken = Math.min(needed, lot.remainingUnits);
					const closesLot = lot.remainingUnits - taken <= EPSILON;
					// 本次採用的成本規則：部分按申購淨值；結清時扣除全部餘額。
					const cost = closesLot ? lot.remainingCost : Math.min(lot.remainingCost, taken * lot.subscriptionNav);
					lot.remainingUnits = closesLot ? 0 : lot.remainingUnits - taken;
					lot.remainingCost = closesLot ? 0 : lot.remainingCost - cost;
					needed -= taken; costBasis += cost;
					allocations.push({ purchaseId: lot.id, purchaseDate: lot.date, units: taken, costBasis: cost });
				}
				const netProceeds = units * nav - fee - tax;
				const profitLoss = netProceeds - costBasis;
				settledUnits += units; realizedProfitLoss += profitLoss;
				redemptionMetrics[id] = { netProceeds, costBasis, realizedProfitLoss: profitLoss, isValid: true, allocations };
			}
			const pendingUnits = relevant.filter(record => record.status === 'pending').reduce((total, record) => total + (Number.isFinite(Number(record.units)) && Number(record.units) > 0 ? Number(record.units) : 0), 0);
			const remainingUnits = purchases.reduce((total, lot) => total + lot.remainingUnits, 0);
			const remainingCost = purchases.reduce((total, lot) => total + lot.remainingCost, 0);
			const nav = Number(this.funds.find(fund => fund.key === fundKey)?.nav);
			const hasNav = Number.isFinite(nav) && nav > 0;
			const marketValue = remainingUnits === 0 ? 0 : hasNav ? remainingUnits * nav : null;
			const unrealizedProfitLoss = marketValue === null ? null : marketValue - remainingCost;
			const purchaseMetrics = {};
			for (const lot of purchases) {
				const value = lot.remainingUnits === 0 ? 0 : hasNav ? lot.remainingUnits * nav : null;
				const profit = value === null ? null : value - lot.remainingCost;
				purchaseMetrics[lot.id] = { remainingUnits: lot.remainingUnits, remainingPrincipal: lot.remainingCost, marketValue: value, profitLoss: profit, returnPct: profit !== null && lot.remainingCost > 0 ? profit / lot.remainingCost * 100 : null };
			}
			return { purchasedUnits, purchasedCost, settledUnits, pendingUnits, remainingUnits, remainingCost, availableRedemptionUnits: Math.max(0, remainingUnits - pendingUnits), marketValue, realizedProfitLoss, unrealizedProfitLoss, totalProfitLoss: unrealizedProfitLoss === null ? null : realizedProfitLoss + unrealizedProfitLoss, redemptionMetrics, purchaseMetrics, invalidRedemptionIds };
		},
		// 必須與 calculateFundLedger 同層，不能刪除或放進 computed。
		getRedeemableUnitsForModal() {
			const editingId = this.redemptionModal.mode === 'edit' ? String(this.redemptionModal.editingId) : '';
			const records = this.redemptions.filter(record => record.fundKey === this.activeFundKey && String(record.id) !== editingId);
			return this.calculateFundLedger(this.activeFundKey, records).availableRedemptionUnits;
		},
		getRedemptionMetric(record) {
			return this.activeLedger.redemptionMetrics[String(record.id)] || { netProceeds: null, costBasis: null, realizedProfitLoss: null, allocations: [] };
		},
		formatRedemptionAllocation(record) {
			const metric = this.getRedemptionMetric(record);
			if (metric.isValid === false) return '交易資料待確認';
			return (metric.allocations || []).map(item => `${this.formatDate(item.purchaseDate)}：${this.formatUnits(item.units)}`).join('；') || '—';
		},
		isUsableNumber(value) { return value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)); },
		formatDate(value) { const date = this.normalizeDate(value); return date ? date.replace(/-/g, ' / ') : '尚未取得'; },
		formatTime(value) { const match = String(value || '').match(/(\d{1,2}:\d{2})/); return match ? match[1] : '尚未更新'; },
		formatNav(value) { return this.isUsableNumber(value) && Number(value) > 0 ? `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 新臺幣` : '—'; },
		formatTwd(value) { return this.isUsableNumber(value) ? `TWD ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'TWD —'; },
		formatSignedTwd(value) { return this.isUsableNumber(value) ? `${Number(value) > 0 ? '+' : Number(value) < 0 ? '-' : ''}TWD ${Math.abs(Number(value)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'TWD —'; },
		formatUnits(value) { return this.isUsableNumber(value) ? `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} 單位` : '—'; },
		formatPercent(value) { return this.isUsableNumber(value) ? `${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(2)}%` : '—'; },
		formatRedemptionStatus(status) { return ({ pending: '處理中', settled: '已結算', cancelled: '取消' })[status] || '處理中'; },
		formatTaipeiDateTime(timestamp) {
			const date = new Date(timestamp);
			if (!Number.isFinite(date.getTime())) return '尚未更新';
			return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(date).replace(/\//g, ' / ').replace(',', '');
		},
		getChangeClass(value) { return Number(value) > 0 ? 'fund_positive' : Number(value) < 0 ? 'fund_negative' : 'fund_flat'; },
		getFriendlyError(error, fallback) {
			const message = String(error?.message || '');
			if (/JWT|session|not authenticated|401|403/i.test(message)) return '登入工作階段已失效或沒有資料庫權限，請重新登入後再試一次。';
			if (/schema cache|relation .* does not exist/i.test(message)) return '資料表或欄位尚未準備完成，請確認 Supabase 的申購與贖回資料表設定。';
			return message || fallback;
		},
	},
};
</script>
