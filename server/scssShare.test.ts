import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const shareScssPath = path.join(projectRoot, "style/scss/_share.scss");
const compiledCssPath = path.join(projectRoot, "style/css/all.css");

describe("共享 SCSS 模組", () => {
	it("保留使用者提供的頁首、交易表單、報表與集中 RWD 規則", () => {
		const scss = fs.readFileSync(shareScssPath, "utf8");

		expect(scss).toContain(".header");
		expect(scss).toContain(".normal_shadow");
		expect(scss).toContain("@include collect-mw(S, (padding:10px 15px));");
		expect(scss).toContain("&_selector");
		expect(scss).toContain("@include collect-mw(S, (gap: 8px));");
		expect(scss).toContain("&_annual");
		expect(scss).toContain("@include collect-mw(S, (width: 100%, justify-content: space-between));");
		expect(scss).toContain("&:focus-visible");
		expect(scss).toContain("outline: 3px solid #7bb4d7;");
		expect(scss).toContain("&:active { transform: scale(.97); }");
		expect(scss).toContain("@media (hover: hover) and (pointer: fine)");
		expect(scss).toContain("@media (prefers-reduced-motion: reduce)");
		expect(scss).toContain("grid-template-columns: repeat(4, minmax(0, 1fr))");
		expect(scss).toContain("&.report_annual_category_expenses");
	});

	it("將共享手機樣式規則編譯至 Vue CDN 載入的 CSS", () => {
		const css = fs.readFileSync(compiledCssPath, "utf8");

		expect(css).toContain(".report_selector");
		expect(css).toContain(".report_annual_controls");
		expect(css).toContain("@media screen and (max-width: 768px)");
		expect(css).toContain(".nav_link:focus-visible");
		expect(css).toContain("@media (prefers-reduced-motion: reduce)");
		expect(css).toContain(".report_category_expenses.report_annual_category_expenses");
	});
});
