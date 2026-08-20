import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const fundVersion = 'fund-analysis-v1.5.32-2026.08.20';

describe('基金頁版本化 SFC 載入', () => {
	it('uses one release version to bust GitHub Pages caches for the route script and fund component', async () => {
		const [indexSource, routeSource, fundSource] = await Promise.all([
			readFile(path.join(projectRoot, 'index.html'), 'utf8'),
			readFile(path.join(projectRoot, 'js/route.js'), 'utf8'),
			readFile(path.join(projectRoot, 'page/fund_analysis.vue'), 'utf8'),
		]);

		expect(indexSource).toContain(`<script src="./js/route.js?v=${fundVersion}"></script>`);
		expect(routeSource).toContain(`const FUND_ANALYSIS_COMPONENT_VERSION = '${fundVersion}';`);
		expect(routeSource).toContain('loadModule(`./page/fund_analysis.vue?v=${FUND_ANALYSIS_COMPONENT_VERSION}`, options)');
		expect(fundSource).toContain(`const FUND_ANALYSIS_VERSION = '${fundVersion}';`);
	});
});
