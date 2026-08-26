import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const fundVersion = 'fund-analysis-v1.5.40-2026.08.20';
const routeVersion = 'fund-pages-v1.5.52-2026.08.25';
const purchaseVersion = 'fund-purchase-v1.0.6-2026.08.25';

describe('基金頁版本化 SFC 載入', () => {
	it('uses one release version to bust GitHub Pages caches for the route script and fund component', async () => {
		const [indexSource, routeSource, fundSource, purchaseSource] = await Promise.all([
			readFile(path.join(projectRoot, 'index.html'), 'utf8'),
			readFile(path.join(projectRoot, 'js/route.js'), 'utf8'),
			readFile(path.join(projectRoot, 'page/fund_analysis.vue'), 'utf8'),
			readFile(path.join(projectRoot, 'page/fund_purchase.vue'), 'utf8'),
		]);

		expect(indexSource).toContain(`<script src="./js/route.js?v=${routeVersion}"></script>`);
		expect(indexSource).toContain('class="lucide lucide-layout-dashboard w-4 h-4" aria-hidden="true"');
		expect(indexSource).toContain('class="lucide lucide-receipt-text w-4 h-4" aria-hidden="true"');
		expect(indexSource).toContain('<router-link class="nav_link" to="/report">');
		expect(indexSource).toContain('<router-link class="nav_link" to="/fund-purchase">');
		expect(indexSource).toContain('\n\t\t\t\t\t\t\t申購紀錄\n\t\t\t\t\t\t</router-link>');
		expect(routeSource).toContain(`const FUND_ANALYSIS_COMPONENT_VERSION = '${fundVersion}';`);
		expect(routeSource).toContain('loadModule(`./page/fund_analysis.vue?v=${FUND_ANALYSIS_COMPONENT_VERSION}`, options)');
		expect(routeSource).toContain(`const FUND_PURCHASE_COMPONENT_VERSION = '${purchaseVersion}';`);
		expect(routeSource).toContain('path: \'/fund-purchase\'');
		expect(routeSource).toContain('loadModule(`./page/fund_purchase.vue?v=${FUND_PURCHASE_COMPONENT_VERSION}`, options)');
		expect(fundSource).toContain(`const FUND_ANALYSIS_VERSION = '${fundVersion}';`);
		expect(purchaseSource).toContain('this.$store?.state?.FundData?.[fundKey]');
		expect(purchaseSource).toContain('待補資料');
		expect(purchaseSource).toContain('＋ 新增申購紀錄');
		expect(purchaseSource).toContain('編輯這筆紀錄');
		expect(purchaseSource).toContain('僅顯示待補資料');
		expect(purchaseSource).toContain("this.$store.commit('ADD_FUND_PURCHASE_RECORD'");
		expect(purchaseSource).toContain("this.$store.commit('UPDATE_FUND_PURCHASE_RECORD'");
		expect(purchaseSource).not.toContain('const PURCHASE_RECORDS = [');
	});
});
