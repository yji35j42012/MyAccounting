import { describe, expect, it } from "vitest";
import { createWorker, FUND_HOLDINGS_SOURCES, FUND_SYMBOLS, HOLDINGS_CACHE_TTL_SECONDS, normalizeYahooQuote, parseAllianzHoldings, parseFuhwaHoldings, parseMoneyDjHoldings, parseOfficialNav, parseRecentHistoryNav, synchronizeLatestNavHistory } from "../cloudflare-worker/src/worker.mjs";

const allowedOrigin = "https://yji35j42012.github.io";
const localDevOrigin = "http://127.0.0.1:5511";
const localhostDevOrigin = "http://localhost:5511";

function yahooPayload(price: number, previousClose: number) {
  return { chart: { result: [{ meta: { regularMarketPrice: price, chartPreviousClose: previousClose, regularMarketTime: 1_786_517_400 } }] } };
}

function moneyDjHoldingsHtml() {
  return `<table><tr><td>基金持股分佈</td><td>資料日期:2026/07/31</td></tr><tr><td>股票名稱</td><td>持股(千股)</td><td>比例</td><td>增減</td><td>股票名稱</td><td>持股(千股)</td><td>比例</td><td>增減</td></tr><tr><td>台積電</td><td>8,561</td><td>8.22</td><td>1.85%</td><td>旺矽</td><td>3,640</td><td>7.61</td><td>0.29%</td></tr></table>`;
}

describe("Cloudflare Yahoo quote worker", () => {
	it("returns a fixed fund whitelist with the allowed GitHub Pages CORS origin", async () => {
    const requestedSymbols: string[] = [];
    const requestedUserAgents: string[] = [];
    const worker = createWorker({
      fetchImpl: async (input, init) => {
        const symbol = decodeURIComponent(String(input)).match(/chart\/([^?]+)/)?.[1] ?? "";
        requestedSymbols.push(symbol);
        requestedUserAgents.push(String((init?.headers as Record<string, string>)?.["User-Agent"] ?? ""));
        return new Response(JSON.stringify(yahooPayload(200, 190)), { status: 200 });
      },
      now: () => 1,
    });
    const request = new Request("https://worker.example/quotes?fund=taiwanIntelligence", { headers: { Origin: allowedOrigin } });
    const response = await worker.fetch(request, { ALLOWED_ORIGIN: allowedOrigin }, {});
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(allowedOrigin);
    expect(requestedSymbols).toEqual(FUND_SYMBOLS.taiwanIntelligence);
    expect(requestedUserAgents).toHaveLength(10);
    expect(requestedUserAgents.every(value => value.startsWith("Mozilla/5.0"))).toBe(true);
		 expect(body).toMatchObject({ fundKey: "taiwanIntelligence", failedSymbols: [] });
			expect(body.quotes).toHaveLength(10);
		});

it("accepts explicitly allowlisted local development origins without opening CORS to other origins", async () => {
				const worker = createWorker({ fetchImpl: async () => new Response(JSON.stringify(yahooPayload(200, 190)), { status: 200 }), now: () => 1 });
				const env = { ALLOWED_ORIGIN: `${allowedOrigin}, ${localDevOrigin}, ${localhostDevOrigin}` };
				const localResponse = await worker.fetch(new Request("https://worker.example/quotes?fund=taiwanTechnology", { headers: { Origin: localDevOrigin } }), env, {});
				const localhostResponse = await worker.fetch(new Request("https://worker.example/quotes?fund=taiwanTechnology", { headers: { Origin: localhostDevOrigin } }), env, {});
				const forbiddenResponse = await worker.fetch(new Request("https://worker.example/quotes?fund=taiwanTechnology", { headers: { Origin: "http://127.0.0.1:5510" } }), env, {});

				expect(localResponse.status).toBe(200);
				expect(localResponse.headers.get("Access-Control-Allow-Origin")).toBe(localDevOrigin);
				expect(localhostResponse.status).toBe(200);
				expect(localhostResponse.headers.get("Access-Control-Allow-Origin")).toBe(localhostDevOrigin);
				expect(forbiddenResponse.status).toBe(403);
				expect(forbiddenResponse.headers.get("Access-Control-Allow-Origin")).toBeNull();
			});

			it("includes the current Fuhwa official top-ten holdings in the Yahoo whitelist", async () => {
				expect(FUND_SYMBOLS.fuhwaOmni).toEqual([
					"2383.TW", "3037.TW", "8046.TW", "2330.TW", "2345.TW",
					"3017.TW", "2308.TW", "6223.TWO", "2303.TW", "2454.TW",
				]);
			});

		it("accepts a genuine Yahoo flat quote but rejects zero, stale, and future market data", () => {
				const referenceTime = Date.UTC(2026, 7, 20, 4, 0, 0);
				const valid = normalizeYahooQuote("2383.TW", { regularMarketPrice: 576, chartPreviousClose: 576, regularMarketTime: Math.floor(referenceTime / 1000) }, referenceTime);
				expect(valid).toMatchObject({ symbol: "2383.TW", price: 576, previousClose: 576 });
				expect(() => normalizeYahooQuote("2383.TW", { regularMarketPrice: 0, chartPreviousClose: 576, regularMarketTime: Math.floor(referenceTime / 1000) }, referenceTime)).toThrow(/不完整或過期/);
				expect(() => normalizeYahooQuote("2383.TW", { regularMarketPrice: 576, chartPreviousClose: 576, regularMarketTime: Math.floor((referenceTime - 9 * 24 * 60 * 60 * 1000) / 1000) }, referenceTime)).toThrow(/不完整或過期/);
				expect(() => normalizeYahooQuote("2383.TW", { regularMarketPrice: 576, chartPreviousClose: 576, regularMarketTime: Math.floor((referenceTime + 10 * 60 * 1000) / 1000) }, referenceTime)).toThrow(/不完整或過期/);
			});

  it("rejects a non-GitHub-Pages origin and unknown fund key", async () => {
    const worker = createWorker({ fetchImpl: async () => new Response(JSON.stringify(yahooPayload(200, 190)), { status: 200 }) });
    const forbidden = await worker.fetch(new Request("https://worker.example/quotes?fund=taiwanTechnology", { headers: { Origin: "https://attacker.example" } }), { ALLOWED_ORIGIN: allowedOrigin }, {});
    const unknown = await worker.fetch(new Request("https://worker.example/quotes?fund=unknown", { headers: { Origin: allowedOrigin } }), { ALLOWED_ORIGIN: allowedOrigin }, {});

    expect(forbidden.status).toBe(403);
    expect(unknown.status).toBe(400);
  });

  it("answers an allowed GitHub Pages CORS preflight", async () => {
    const worker = createWorker({ fetchImpl: async () => new Response(JSON.stringify(yahooPayload(200, 190)), { status: 200 }) });
    const preflight = await worker.fetch(new Request("https://worker.example/quotes", {
      method: "OPTIONS",
      headers: { Origin: allowedOrigin, "Access-Control-Request-Method": "GET" },
    }), { ALLOWED_ORIGIN: allowedOrigin }, {});

		expect(preflight.status).toBe(204);
		expect(preflight.headers.get("Access-Control-Allow-Origin")).toBe(allowedOrigin);
		expect(preflight.headers.get("Access-Control-Allow-Methods")).toContain("GET");
	});

it("answers a preflight from an explicitly allowlisted local development origin", async () => {
			const worker = createWorker({ fetchImpl: async () => new Response(JSON.stringify(yahooPayload(200, 190)), { status: 200 }) });
			const preflight = await worker.fetch(new Request("https://worker.example/nav", {
				method: "OPTIONS",
				headers: { Origin: localhostDevOrigin, "Access-Control-Request-Method": "GET" },
			}), { ALLOWED_ORIGIN: `${allowedOrigin}\n${localDevOrigin}\n${localhostDevOrigin}` }, {});

			expect(preflight.status).toBe(204);
			expect(preflight.headers.get("Access-Control-Allow-Origin")).toBe(localhostDevOrigin);
		});

	it("returns exactly one allowed-origin value and no-store when serving a cached quote snapshot", async () => {
    const cacheDescriptor = Object.getOwnPropertyDescriptor(globalThis, "caches");
    const cachedSnapshot = new Response(JSON.stringify({ fundKey: "taiwanIntelligence", quotes: [], failedSymbols: [], fetchedAt: 1 }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allowedOrigin,
        "Cache-Control": "public, max-age=55",
      },
    });
    Object.defineProperty(globalThis, "caches", {
      configurable: true,
      value: { default: { match: async () => cachedSnapshot, put: async () => undefined } },
    });

    try {
      const worker = createWorker({ fetchImpl: async () => { throw new Error("A cache hit must not call Yahoo"); } });
      const response = await worker.fetch(new Request("https://worker.example/quotes?fund=taiwanIntelligence", { headers: { Origin: allowedOrigin } }), { ALLOWED_ORIGIN: allowedOrigin }, {});

      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(allowedOrigin);
      expect(response.headers.get("Cache-Control")).toBe("no-store");
    } finally {
      if (cacheDescriptor) Object.defineProperty(globalThis, "caches", cacheDescriptor);
      else delete globalThis.caches;
    }
  });

  it("parses latest public NAV data from Allianz and the Fuhwa public NAV table", () => {
    const allianz = parseOfficialNav("安聯台灣科技基金 TWD 773.58 2026/08/12 +12.67", "allianzTable", "安聯台灣科技基金");
    const fuhwa = parseOfficialNav('���A����-��30��b�� ��� �b�� ��/�^ ���^�T(%) 2026/08/12 196.74 5.14 2.68 2026/08/11 191.60', "hncbTable");

    expect(allianz).toEqual({ nav: 773.58, navDate: "2026/08/12" });
    expect(fuhwa).toEqual({ nav: 196.74, navDate: "2026/08/12" });
  });

  it("returns a CORS-enabled official NAV snapshot only for the fixed fund whitelist", async () => {
    const worker = createWorker({
			fetchImpl: async input => String(input).includes("WebNav.aspx")
				? new Response("安聯台灣智慧基金 TWD 418.03 2026/08/13 +2.45", { status: 200 })
				: new Response("近30日淨值 2026/08/12 415.58 5.95 1.45 2026/08/11 409.63 3.97 0.98 2026/08/10 405.66 10.75 2.72 2026/08/07 394.91 -9.59 -2.37 2026/08/06 404.50 5.74 1.44", { status: 200 }),
      now: () => 1,
    });
    const response = await worker.fetch(new Request("https://worker.example/nav?fund=taiwanIntelligence", { headers: { Origin: allowedOrigin } }), { ALLOWED_ORIGIN: allowedOrigin }, {});
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(allowedOrigin);
		expect(body).toMatchObject({ fundKey: "taiwanIntelligence", nav: 418.03, navDate: "2026/08/13", sourceName: "安聯投信" });
		expect(body).toMatchObject({ fetchedAt: 1, cacheTtlSeconds: 600, cacheExpiresAt: 600_001 });
		expect(body.changePct).toBeCloseTo(0.589538, 6);
  });

	it("bypasses an existing NAV cache when the manual force parameter is set", async () => {
		const cacheDescriptor = Object.getOwnPropertyDescriptor(globalThis, "caches");
		Object.defineProperty(globalThis, "caches", {
			configurable: true,
			value: {
				default: {
					match: async () => new Response(JSON.stringify({ fundKey: "taiwanIntelligence", nav: 1, navDate: "2026/01/01" })),
					put: async () => undefined,
				},
			},
		});

		try {
			const worker = createWorker({
				fetchImpl: async () => new Response("安聯台灣智慧基金 TWD 415.58 2026/08/12 +5.95", { status: 200 }),
				now: () => 1,
			});
			const response = await worker.fetch(new Request("https://worker.example/nav?fund=taiwanIntelligence&force=1", { headers: { Origin: allowedOrigin } }), { ALLOWED_ORIGIN: allowedOrigin }, {});
			expect(await response.json()).toMatchObject({ nav: 415.58, navDate: "2026/08/12" });
		} finally {
			if (cacheDescriptor) Object.defineProperty(globalThis, "caches", cacheDescriptor);
			else delete globalThis.caches;
		}
	});

  it("keeps the allowed CORS origin when an official NAV upstream request fails", async () => {
    const worker = createWorker({ fetchImpl: async () => new Response("upstream failure", { status: 502 }) });
    const response = await worker.fetch(new Request("https://worker.example/nav?fund=fuhwaOmni", { headers: { Origin: allowedOrigin } }), { ALLOWED_ORIGIN: allowedOrigin }, {});

    expect(response.status).toBe(502);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(allowedOrigin);
    expect(await response.json()).toEqual({ error: "官方淨值暫時無法提供資料" });
  });

  it("parses the five most recent public history NAV rows in chronological order", () => {
    const rows = parseRecentHistoryNav("近30日淨值 2026/08/12 196.74 5.14 2.68 2026/08/11 191.60 2.54 1.34 2026/08/10 189.06 4.33 2.34 2026/08/07 184.73 -4.22 -2.23 2026/08/06 188.95 3.61 1.95");
    expect(rows).toEqual([
      { date: "2026/08/06", value: 188.95, changePct: 1.95 },
      { date: "2026/08/07", value: 184.73, changePct: -2.23 },
      { date: "2026/08/10", value: 189.06, changePct: 2.34 },
      { date: "2026/08/11", value: 191.6, changePct: 1.34 },
      { date: "2026/08/12", value: 196.74, changePct: 2.68 },
    ]);
  });

	it("adds a newer official NAV into the latest five rows and derives its daily change", () => {
		const synced = synchronizeLatestNavHistory(
			{ fundKey: "taiwanTechnology", nav: 784.71, navDate: "2026/08/13" },
			{ fundKey: "taiwanTechnology", rows: [
				{ date: "2026/08/06", value: 751.72, changePct: 1.7 },
				{ date: "2026/08/07", value: 734.24, changePct: -2.33 },
				{ date: "2026/08/10", value: 750.24, changePct: 2.18 },
				{ date: "2026/08/11", value: 760.91, changePct: 1.42 },
				{ date: "2026/08/12", value: 773.58, changePct: 1.67 },
			] },
		);

		expect(synced.nav.changePct).toBeCloseTo(1.438765, 6);
		expect(synced.history.rows).toHaveLength(5);
		expect(synced.history.rows.at(-1)).toMatchObject({ date: "2026-08-13", value: 784.71 });
	});

	it("returns a synchronized 8/13 history row when the public history source still ends on 8/12", async () => {
		const worker = createWorker({
			fetchImpl: async input => String(input).includes("WebNav.aspx")
				? new Response("安聯台灣科技基金 TWD 784.71 2026/08/13 +11.13", { status: 200 })
				: new Response("近30日淨值 2026/08/12 773.58 12.67 1.67 2026/08/11 760.91 10.67 1.42 2026/08/10 750.24 16.00 2.18 2026/08/07 734.24 -17.48 -2.33 2026/08/06 751.72 12.56 1.70", { status: 200 }),
			now: () => 1,
		});
		const response = await worker.fetch(new Request("https://worker.example/history?fund=taiwanTechnology", { headers: { Origin: allowedOrigin } }), { ALLOWED_ORIGIN: allowedOrigin }, {});
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.rows).toHaveLength(5);
		expect(body.rows.at(-1)).toMatchObject({ date: "2026-08-13", value: 784.71 });
		expect(body.rows.at(-1).changePct).toBeCloseTo(1.438765, 6);
	});

  it("returns a CORS-enabled dynamic five-row history snapshot", async () => {
    const worker = createWorker({
      fetchImpl: async () => new Response("近30日淨值 2026/08/12 415.58 5.95 1.45 2026/08/11 409.63 3.97 0.98 2026/08/10 405.66 10.75 2.72 2026/08/07 394.91 -9.59 -2.37 2026/08/06 404.50 5.74 1.44", { status: 200 }),
      now: () => 1,
    });
    const response = await worker.fetch(new Request("https://worker.example/history?fund=taiwanIntelligence", { headers: { Origin: allowedOrigin } }), { ALLOWED_ORIGIN: allowedOrigin }, {});
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(allowedOrigin);
    expect(body).toMatchObject({ fundKey: "taiwanIntelligence", sourceName: "公開基金淨值表（華南銀行／MoneyDJ）" });
    expect(body.rows).toHaveLength(5);
	  expect(body.rows.at(-1)).toMatchObject({ date: "2026/08/12", value: 415.58, changePct: 1.45 });
	});

	it("parses Allianz official investment holdings while preserving their date, industry and weight", () => {
		const parsed = parseAllianzHoldings(`
			<section><h3>投資標的</h3><p>資料日期 2026/07/31</p>
			<table><thead><tr><th>持股</th><th>國家/地區</th><th>產業</th><th>比重</th></tr></thead><tbody>
			<tr><td>台積電</td><td>台灣</td><td>半導體業</td><td>8.22%</td></tr>
			<tr><td>旺矽</td><td>台灣</td><td>半導體業</td><td>7.61%</td></tr>
			</tbody></table></section>
		`);

		expect(parsed).toEqual({
			holdingsDate: "2026/07/31",
			holdings: [
				{ rank: 1, name: "台積電", weight: 8.22, industry: "半導體業" },
				{ rank: 2, name: "旺矽", weight: 7.61, industry: "半導體業" },
			],
		});
	});

	it("parses the anonymous public fund holdings table used when Allianz blocks Worker requests", () => {
		const parsed = parseMoneyDjHoldings(moneyDjHoldingsHtml(), { "台積電": "半導體業", "旺矽": "半導體業" });

		expect(parsed).toEqual({
			holdingsDate: "2026/07/31",
			holdings: [
				{ rank: 1, name: "台積電", weight: 8.22, industry: "半導體業" },
				{ rank: 2, name: "旺矽", weight: 7.61, industry: "半導體業" },
			],
		});
		expect(FUND_HOLDINGS_SOURCES.taiwanTechnology).toMatchObject({ parser: "moneyDjHoldings", sourceUrl: expect.stringContaining("wr04.djhtm") });
		expect(FUND_HOLDINGS_SOURCES.taiwanDaba).toMatchObject({ parser: "moneyDjHoldings", sourceUrl: expect.stringContaining("wr04.djhtm") });
		expect(FUND_HOLDINGS_SOURCES.taiwanIntelligence).toMatchObject({ parser: "moneyDjHoldings", sourceUrl: expect.stringContaining("wr04.djhtm") });
	});

	it("parses Fuhwa official holdings JSON without inventing stock symbols", () => {
		const parsed = parseFuhwaHoldings({
			result: [{ ddate: "2026/07/31", stockHold: { stockhold: [
				{ iOrder: 2, itemName: "欣興", sectorName: "電子零組件", ratio: "6.44%" },
				{ iOrder: 1, itemName: "台光電", sectorName: "電子零組件", ratio: "7.75%" },
			] } }],
		});

		expect(parsed).toEqual({
			holdingsDate: "2026/07/31",
			holdings: [
				{ rank: 1, name: "台光電", weight: 7.75, industry: "電子零組件" },
				{ rank: 2, name: "欣興", weight: 6.44, industry: "電子零組件" },
			],
		});
	});

	it("returns a CORS-enabled daily official holdings snapshot for an allowed fund", async () => {
		const worker = createWorker({
			fetchImpl: async input => {
				expect(String(input)).toContain("wr04.djhtm");
				return new Response(moneyDjHoldingsHtml(), { status: 200 });
			},
			now: () => 1_000,
		});
		const response = await worker.fetch(new Request("https://worker.example/holdings?fund=taiwanTechnology", { headers: { Origin: allowedOrigin } }), { ALLOWED_ORIGIN: allowedOrigin }, {});
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe(allowedOrigin);
			expect(body).toMatchObject({
				fundKey: "taiwanTechnology",
				holdingsDate: "2026/07/31",
				sourceName: "公開基金持股表（華南銀行／MoneyDJ）",
				fetchedAt: 1_000,
			cacheTtlSeconds: HOLDINGS_CACHE_TTL_SECONDS,
			cacheExpiresAt: 1_000 + HOLDINGS_CACHE_TTL_SECONDS * 1_000,
		});
			expect(body.holdings).toEqual([
				{ rank: 1, name: "台積電", weight: 8.22, industry: "半導體業" },
				{ rank: 2, name: "旺矽", weight: 7.61, industry: "半導體業" },
			]);
	});

	it("bypasses an existing holdings cache only when force=1 is requested", async () => {
		const cacheDescriptor = Object.getOwnPropertyDescriptor(globalThis, "caches");
		Object.defineProperty(globalThis, "caches", {
			configurable: true,
			value: {
				default: {
					match: async () => new Response(JSON.stringify({ fundKey: "taiwanTechnology", holdingsDate: "2026/01/01", holdings: [] })),
					put: async () => undefined,
				},
			},
		});

		try {
			const worker = createWorker({
				fetchImpl: async () => new Response(moneyDjHoldingsHtml(), { status: 200 }),
				now: () => 1,
			});
			const response = await worker.fetch(new Request("https://worker.example/holdings?fund=taiwanTechnology&force=1", { headers: { Origin: allowedOrigin } }), { ALLOWED_ORIGIN: allowedOrigin }, {});
			const body = await response.json();
			expect(body).toMatchObject({ holdingsDate: "2026/07/31" });
			expect(body.holdings).toEqual(expect.arrayContaining([expect.objectContaining({ name: "台積電", weight: 8.22 })]));
		} finally {
			if (cacheDescriptor) Object.defineProperty(globalThis, "caches", cacheDescriptor);
			else delete globalThis.caches;
		}
	});
});
