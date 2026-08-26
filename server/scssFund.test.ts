import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const fundScssPath = path.join(projectRoot, "style/scss/_fund.scss");
const scssEntryPath = path.join(projectRoot, "style/scss/all.scss");
const compiledCssPath = path.join(projectRoot, "style/css/all.css");

describe("基金分析 SCSS 模組", () => {
	it("保留使用者提供的選擇器、漲跌配色與集中 RWD 規則", () => {
		const scss = fs.readFileSync(fundScssPath, "utf8");
		const entry = fs.readFileSync(scssEntryPath, "utf8");

		expect(scss).toContain("@include collect-mw(S, (padding-bottom:24px));");
		expect(scss).toContain("width:calc(50% - 4px)");
		expect(scss).toContain("@include collect-mw(XS, (flex-wrap:wrap));");
		expect(scss).toContain("max-width: 100%");
		expect(scss).toContain("&_nav { width: 100%; max-width: 560px");
		expect(scss).toContain("margin-top: 20px");
		expect(scss).toContain("&_main { flex: 1 1 auto; min-width: 0; }");
		expect(scss).toContain("&_contribution_card .fund_nav_contribution_detail");
			expect(scss).toContain("&_holdings_asof_inline");
			expect(scss).toContain("&_holdings_controls");
			expect(scss).toContain("&_holdings_refresh_status");
				expect(scss).toContain("&_holdings_source");
					expect(scss).toContain("&_holdings_cache_clear_button");
					expect(scss).toContain("&_quote_cache_warning");
					expect(scss).toContain("&_quote_missing");
			expect(scss).toContain("&_flat_badge");
			expect(scss).toContain("&_previous_close");
				expect(scss).toContain("&_pending_total");
				expect(scss).toContain("&_pending_badge");
				expect(scss).toContain("&_add_button, &_edit_button");
				expect(scss).toContain("&_filter_button");
				expect(scss).toContain("&_modal { position: fixed");
				expect(scss).toContain("&_save_toast");
		expect(scss).toContain("color: #98a6b5; font-size: 12px");
		expect(scss).toContain("&_nav_refresh_button");
		expect(scss).toContain("&_nav_last_updated");
		expect(scss).toContain("&_nav_success_toast");
		expect(scss).not.toContain("&_notice");
		expect(scss).toContain("&_nav_signal_line { display: block;");
		expect(scss).not.toMatch(/font-size:\s*10px/);
		expect(scss).toContain("@include collect-mw(S, (max-width:60%));");
		expect(scss).toContain("&_nav_contribution");
		expect(scss).toContain("&_holdings_signal");
		expect(scss).toContain("&_mobile_holdings");
		expect(scss).toContain("color: #bd3441 !important;");
		expect(scss).toContain("color: #11724d !important;");
		expect(scss).toContain("@media (max-width: 768px)");
		expect(entry).toContain("@include emit-mw();");
	});

	it("將基金桌面與手機版規則編譯到 Vue CDN 載入的 CSS", () => {
		const css = fs.readFileSync(compiledCssPath, "utf8");

		expect(css).toContain(".fund_nav_contribution");
			expect(css).toContain(".fund_mobile_holdings");
			expect(css).toContain(".fund_holdings_controls");
				expect(css).toContain(".fund_holdings_source");
					expect(css).toContain(".fund_holdings_cache_clear_button");
					expect(css).toContain(".fund_quote_cache_warning");
					expect(css).toContain(".fund_quote_missing");
				expect(css).toContain(".fund_flat_badge");
				expect(css).toContain(".fund_previous_close");
				expect(css).toContain(".fund_purchase_page_pending_badge");
				expect(css).toContain(".fund_purchase_page_add_button");
				expect(css).toContain(".fund_purchase_page_filter_button");
				expect(css).toContain(".fund_purchase_page_modal");
				expect(css).toContain(".fund_purchase_page_save_toast");
		expect(css).toContain(".fund_positive");
		expect(css).toContain("@media (max-width: 768px)");
		expect(css).toContain("@media screen and (max-width: 768px)");
	});
});
