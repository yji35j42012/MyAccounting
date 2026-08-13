import { describe, expect, it } from "vitest";
import { createWorker, FUND_SYMBOLS, parseOfficialNav, parseRecentHistoryNav } from "../cloudflare-worker/src/worker.mjs";

const allowedOrigin = "https://example.github.io";

function yahooPayload(price: number, previousClose: number) {
  return { chart: { result: [{ meta: { regularMarketPrice: price, chartPreviousClose: previousClose, regularMarketTime: 1_786_517_400 } }] } };
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
      fetchImpl: async () => new Response("安聯台灣智慧基金 TWD 415.58 2026/08/12 +5.95", { status: 200 }),
      now: () => 1,
    });
    const response = await worker.fetch(new Request("https://worker.example/nav?fund=taiwanIntelligence", { headers: { Origin: allowedOrigin } }), { ALLOWED_ORIGIN: allowedOrigin }, {});
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(allowedOrigin);
    expect(body).toMatchObject({ fundKey: "taiwanIntelligence", nav: 415.58, navDate: "2026/08/12", sourceName: "安聯投信" });
		expect(body).toMatchObject({ fetchedAt: 1, cacheTtlSeconds: 600, cacheExpiresAt: 600_001 });
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
});
