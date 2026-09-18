Cloudflare Worker

export const FUND_SYMBOLS = {
  taiwanTechnology: [
    "6223.TWO",
    "2330.TW",
    "3443.TW",
    "2383.TW",
    "3037.TW",
    "3017.TW",
    "2368.TW",
    "6274.TWO",
    "8046.TW",
    "2303.TW",
  ],
  taiwanDaba: [
    "6223.TWO",
    "3017.TW",
    "2330.TW",
    "5274.TWO",
    "3037.TW",
    "8046.TW",
    "6669.TW",
    "3443.TW",
    "6274.TWO",
    "3189.TW",
  ],
  taiwanIntelligence: [
    "2408.TW",
    "2383.TW",
    "2344.TW",
    "6223.TWO",
    "5274.TWO",
    "2059.TW",
    "6669.TW",
    "3037.TW",
    "6274.TWO",
    "3017.TW",
  ],
  fuhwaOmni: [
    "2383.TW",
    "3037.TW",
    "8046.TW",
    "3653.TW",
    "2308.TW",
    "3017.TW",
    "2059.TW",
    "2330.TW",
    "2408.TW",
    "6805.TW",
  ],
};

export const FUND_NAV_SOURCES = {
  taiwanTechnology: {
    sourceName: "安聯投信",
    sourceUrl: "https://ifund.allianzgi.com.tw/WebNav.aspx",
    parser: "allianzTable",
    fundName: "安聯台灣科技基金",
  },
  taiwanDaba: {
    sourceName: "安聯投信",
    sourceUrl: "https://ifund.allianzgi.com.tw/WebNav.aspx",
    parser: "allianzTable",
    fundName: "安聯台灣大壩基金 - A類型-新臺幣",
  },
  taiwanIntelligence: {
    sourceName: "安聯投信",
    sourceUrl: "https://ifund.allianzgi.com.tw/WebNav.aspx",
    parser: "allianzTable",
    fundName: "安聯台灣智慧基金",
  },
  fuhwaOmni: {
    sourceName: "公開基金淨值表（華南銀行／MoneyDJ）",
    sourceUrl: "https://fund.hncb.com.tw/w/wr/wr02.djhtm?a=ACFH15-031015",
    parser: "hncbTable",
  },
};

export const FUND_HISTORY_SOURCES = {
  taiwanTechnology: { sourceName: "公開基金淨值表（華南銀行／MoneyDJ）", sourceUrl: "https://fund.hncb.com.tw/w/wr/wr02_ACDD04-005003.djhtm" },
  taiwanDaba: { sourceName: "公開基金淨值表（兆豐銀行／MoneyDJ）", sourceUrl: "https://fund.megabank.com.tw/w/wr/wr02_ACDD01-4101.djhtm" },
  taiwanIntelligence: { sourceName: "公開基金淨值表（華南銀行／MoneyDJ）", sourceUrl: "https://fund.hncb.com.tw/w/wr/wr02_ACDD19-005019.djhtm" },
  fuhwaOmni: { sourceName: "公開基金淨值表（華南銀行／MoneyDJ）", sourceUrl: "https://fund.hncb.com.tw/w/wr/wr02.djhtm?a=ACFH15-031015" },
};

export const FUND_HOLDINGS_SOURCES = {
  taiwanTechnology: {
    sourceName: "公開基金持股表（華南銀行／MoneyDJ）",
    sourceUrl: "https://fund.hncb.com.tw/w/wr/wr04.djhtm?a=ACDD04-005003",
    parser: "moneyDjHoldings",
  },
  taiwanDaba: {
    sourceName: "公開基金持股表（兆豐銀行／MoneyDJ）",
    sourceUrl: "https://fund.megabank.com.tw/w/wr/wr04.djhtm?a=ACDD01-4101",
    parser: "moneyDjHoldings",
  },
  taiwanIntelligence: {
    sourceName: "公開基金持股表（華南銀行／MoneyDJ）",
    sourceUrl: "https://fund.hncb.com.tw/w/wr/wr04.djhtm?a=ACDD19-005019",
    parser: "moneyDjHoldings",
  },
  fuhwaOmni: {
    sourceName: "復華投信公開持股",
    sourceUrl: "https://www.fhtrust.com.tw/api/stockhold?fundID=15",
    parser: "fuhwaJson",
  },
};

const FUND_HOLDING_INDUSTRIES = {
  taiwanTechnology: {
    "台積電": "半導體業",
    "旺矽": "半導體業",
    "台光電": "電子零組件業",
    "台光電子":
      "電子零組件業",
    "欣興": "電子零組件業", "台燿": "電子零組件業", "創意": "科技", "創意電子": "科技", "聯電": "半導體業", "奇鋐": "電腦週邊", "穎崴": "半導體業", "國巨*": "電子零組件業", "國巨": "電子零組件業"
  },
  taiwanDaba: { "旺矽": "半導體業", "台光電": "電子零組件業", "台光電子": "電子零組件業", "台積電": "半導體業", "穎崴": "半導體業", "台燿": "電子零組件業", "信驊": "半導體業", "信驊科技": "半導體業", "欣興": "電子零組件業", "南電": "電子零組件業", "台達電": "電腦零組件", "台達電子": "電腦零組件", "智邦": "通訊網路" },
  taiwanIntelligence: { "旺矽": "半導體業", "台光電": "電子零組件業", "台光電子": "電子零組件業", "信驊": "半導體業", "信驊科技": "半導體業", "台積電": "半導體業", "華邦電": "半導體業", "華邦電子": "半導體業", "南亞科": "科技", "欣興": "電子零組件業", "台燿": "電子零組件業", "智邦": "通訊網路", "景碩": "半導體業", "景碩科技": "半導體業" },
};

const QUOTE_CACHE_TTL_SECONDS = 55;
export const NAV_CACHE_TTL_SECONDS = 10 * 60;
export const HISTORY_CACHE_TTL_SECONDS = 10 * 60;
export const HOLDINGS_CACHE_TTL_SECONDS = 24 * 60 * 60;
const NAV_CACHE_VERSION = "v4";
const HISTORY_CACHE_VERSION = "v3";
const HOLDINGS_CACHE_VERSION = "v2";
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_CONCURRENT_YAHOO_REQUESTS = 4;
const YAHOO_REQUEST_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};
const FUND_NAV_REQUEST_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

function responseJson(body, status = 200, origin = null) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function responseWithCors(response, origin) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Vary", "Origin");
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function requireAllowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!env.ALLOWED_ORIGIN) return { error: "尚未設定 ALLOWED_ORIGIN", status: 500 };
  if (origin !== env.ALLOWED_ORIGIN) return { error: "不允許的請求來源", status: 403 };
  return { origin };
}

async function fetchWithTimeout(url, fetchImpl, headers) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, { headers, signal: controller.signal });
    if (!response.ok) throw new Error(`上游資料回應 ${response.status}`);
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchChartQuote(symbol, fetchImpl) {
  const endpoint = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`;
  const response = await fetchWithTimeout(endpoint, fetchImpl, YAHOO_REQUEST_HEADERS);
  const payload = await response.json();
  const meta = payload?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  const previousClose = meta?.chartPreviousClose ?? meta?.previousClose;
  const marketTime = meta?.regularMarketTime;
  if (!Number.isFinite(price) || !Number.isFinite(previousClose) || previousClose === 0 || !Number.isFinite(marketTime)) {
    throw new Error("Yahoo 報價資料不完整");
  }
  return { symbol, price: Number(price), previousClose: Number(previousClose), marketTime: Number(marketTime) };
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      try {
        results[index] = { status: "fulfilled", value: await mapper(items[index]) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function requestYahooQuotes(fundKey, fetchImpl = fetch, now = Date.now) {
  const symbols = FUND_SYMBOLS[fundKey];
  const results = await mapWithConcurrency(symbols, MAX_CONCURRENT_YAHOO_REQUESTS, symbol => fetchChartQuote(symbol, fetchImpl));
  const quotes = [];
  const failedSymbols = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") quotes.push(result.value);
    else failedSymbols.push(symbols[index]);
  });
  if (!quotes.length) throw new Error("Yahoo 股市暫時無法提供報價");
  return { fundKey, quotes, failedSymbols, fetchedAt: now() };
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeNavDate(value) {
  const match = String(value).match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!match) throw new Error("官方淨值日期格式不完整");
  return `${match[1]}/${match[2].padStart(2, "0")}/${match[3].padStart(2, "0")}`;
}

function toNavValue(value) {
  const nav = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(nav) || nav <= 0) throw new Error("官方淨值數值不完整");
  return nav;
}

function decodeHtml(value) {
  return String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function toHoldingWeight(value) {
  const normalized = String(value).replace(/[^0-9.-]/g, "");
  if (!normalized) throw new Error("官方持股比重格式不完整");
  const weight = Number(normalized);
  if (!Number.isFinite(weight) || weight < 0 || weight > 100) throw new Error("官方持股比重格式不完整");
  return weight;
}

function findHoldingsDate(value) {
  const matches = [...String(value).matchAll(/資料日期[\s\S]{0,160}?(\d{4}[/-]\d{1,2}[/-]\d{1,2})/g)];
  if (!matches.length) throw new Error("官方持股資料日期不完整");
  return normalizeNavDate(matches.at(-1)[1]);
}

export function parseAllianzHoldings(html) {
  const tables = [...String(html).matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)];
  let portfolioTable = "";
  for (const tableMatch of tables) {
    const text = stripHtml(tableMatch[0]);
    if (text.includes("持股") && text.includes("比重")) portfolioTable = tableMatch[0];
  }
  if (!portfolioTable) throw new Error("找不到安聯官方投資標的表格");

  const holdings = [];
  for (const rowMatch of portfolioTable.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map(cell => decodeHtml(stripHtml(cell[1])));
    if (cells.length < 4) continue;
    try {
      const [name, , industry, rawWeight] = cells;
      if (name === "持股" || rawWeight === "比重") continue;
      const weight = toHoldingWeight(rawWeight);
      if (!name || !industry) continue;
      holdings.push({ rank: holdings.length + 1, name, weight, industry });
    } catch {
      // 表頭或備註列不屬於持股資料，略過後續繼續解析。
    }
    if (holdings.length === 10) break;
  }
  if (!holdings.length) throw new Error("找不到安聯官方公開持股");
  return { holdingsDate: findHoldingsDate(html), holdings };
}

function decodeMoneyDjHtml(value) {
  if (typeof value === "string") return value;
  const bytes = value instanceof ArrayBuffer ? value : ArrayBuffer.isView(value) ? value.buffer : null;
  if (!bytes) return String(value || "");
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  if (utf8.includes("股票名稱") || utf8.includes("資料日期")) return utf8;
  return new TextDecoder("big5").decode(bytes);
}

export function parseMoneyDjHoldings(payload, industries = {}) {
  const html = decodeMoneyDjHtml(payload);
  const holdings = [];
  for (const rowMatch of String(html).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map(cell => decodeHtml(stripHtml(cell[1])));
    if (cells.length < 8 || cells[0] === "股票名稱") continue;
    for (const offset of [0, 4]) {
      const name = String(cells[offset] || "").trim();
      const rawWeight = cells[offset + 2];
      if (!name || !rawWeight) continue;
      try {
        holdings.push({ name, weight: toHoldingWeight(rawWeight), industry: industries[name] || "公開持股" });
      } catch {
        // 非持股列或比例格式不完整時略過。
      }
    }
  }
  const sorted = holdings
    .filter(item => item.name && Number.isFinite(item.weight))
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 10)
    .map((item, index) => ({ rank: index + 1, ...item }));
  if (!sorted.length) throw new Error("找不到公開基金持股資料");
  return { holdingsDate: findHoldingsDate(html), holdings: sorted };
}

export function parseFuhwaHoldings(payload) {
  const root = typeof payload === "string" ? JSON.parse(payload) : payload;
  const result = root?.result?.[0];
  const rows = result?.stockHold?.stockhold;
  if (!result?.ddate || !Array.isArray(rows)) throw new Error("找不到復華官方公開持股");
  const holdings = rows
    .map((row, index) => {
      const rank = Number(row?.iOrder);
      const name = decodeHtml(row?.itemName || "");
      const industry = decodeHtml(row?.sectorName || "");
      const weight = toHoldingWeight(row?.ratio);
      return { rank: Number.isInteger(rank) && rank > 0 ? rank : index + 1, name, weight, industry };
    })
    .filter(row => row.name && row.industry)
    .sort((left, right) => left.rank - right.rank)
    .slice(0, 10);
  if (!holdings.length) throw new Error("找不到復華官方公開持股");
  return { holdingsDate: normalizeNavDate(result.ddate), holdings };
}

export function parseOfficialNav(html, parser, fundName = "") {
  if (parser === "allianzTable") {
    const text = stripHtml(html);
    const nameIndex = text.indexOf(fundName);
    const segment = nameIndex >= 0 ? text.slice(nameIndex, nameIndex + 320) : "";
    const matcher = segment.match(/TWD\s*([0-9][0-9,]*(?:\.\d+)?)\s*(\d{4}[/-]\d{1,2}[/-]\d{1,2})/);
    if (!matcher) throw new Error("找不到安聯官方最新淨值");
    return { nav: toNavValue(matcher[1]), navDate: normalizeNavDate(matcher[2]) };
  }

  if (parser === "hncbTable") {
    const text = stripHtml(html);
    const matcher = text.match(/(\d{4}[/-]\d{1,2}[/-]\d{1,2})\s+([0-9][0-9,]*(?:\.\d+)?)(?:\s+[+-]?[0-9][0-9,]*(?:\.\d+)?){1,2}/);
    if (!matcher) throw new Error("找不到復華公開最新淨值");
    return { nav: toNavValue(matcher[2]), navDate: normalizeNavDate(matcher[1]) };
  }

  const heroMatcher = html.match(/class=["'][^"']*fundState-type[^"']*["'][^>]*>\s*淨值\s*<\/div>[\s\S]{0,800}?class=["'][^"']*fundState-value[^"']*["'][^>]*>\s*([0-9][0-9,]*(?:\.\d+)?)[\s\S]{0,800}?class=["'][^"']*fundState-date[^"']*["'][^>]*>\s*(\d{4}[/-]\d{1,2}[/-]\d{1,2})/i);
  if (!heroMatcher) throw new Error("找不到復華官方最新淨值");
  return { nav: toNavValue(heroMatcher[1]), navDate: normalizeNavDate(heroMatcher[2]) };
}

export function parseRecentHistoryNav(html, limit = 5) {
  const text = stripHtml(html);
  const matches = [...text.matchAll(/(\d{4}[/-]\d{1,2}[/-]\d{1,2})\s+([0-9][0-9,]*(?:\.\d+)?)\s+([+-]?[0-9][0-9,]*(?:\.\d+)?)\s+([+-]?[0-9][0-9,]*(?:\.\d+)?)/g)];
  const seenDates = new Set();
  const rows = [];
  for (const match of matches) {
    const date = normalizeNavDate(match[1]);
    if (seenDates.has(date)) continue;
    const value = toNavValue(match[2]);
    const changePct = Number(String(match[4]).replace(/,/g, ""));
    if (!Number.isFinite(changePct)) continue;
    seenDates.add(date);
    rows.push({ date, value, changePct });
    if (rows.length === limit) break;
  }
  if (rows.length !== limit) throw new Error("找不到足夠的公開歷史淨值");
  return rows.reverse();
}

export async function requestOfficialNav(fundKey, fetchImpl = fetch, now = Date.now) {
  const source = FUND_NAV_SOURCES[fundKey];
  if (!source) throw new Error("不允許的基金代號");
  const response = await fetchWithTimeout(source.sourceUrl, fetchImpl, FUND_NAV_REQUEST_HEADERS);
  const { nav, navDate } = parseOfficialNav(await response.text(), source.parser, source.fundName);
  return { fundKey, nav, navDate, sourceName: source.sourceName, sourceUrl: source.sourceUrl, fetchedAt: now() };
}

export async function requestRecentHistoryNav(fundKey, fetchImpl = fetch, now = Date.now) {
  const source = FUND_HISTORY_SOURCES[fundKey];
  if (!source) throw new Error("不允許的基金代號");
  const response = await fetchWithTimeout(source.sourceUrl, fetchImpl, FUND_NAV_REQUEST_HEADERS);
  const rows = parseRecentHistoryNav(await response.text());
  return { fundKey, rows, sourceName: source.sourceName, sourceUrl: source.sourceUrl, fetchedAt: now() };
}

export async function requestHoldings(fundKey, fetchImpl = fetch, now = Date.now) {
  const source = FUND_HOLDINGS_SOURCES[fundKey];
  if (!source) throw new Error("不允許的基金代號");
  const response = await fetchWithTimeout(source.sourceUrl, fetchImpl, FUND_NAV_REQUEST_HEADERS);
  const payload = source.parser === "fuhwaJson" ? await response.json() : source.parser === "moneyDjHoldings" ? await response.arrayBuffer() : await response.text();
  const parsed = source.parser === "fuhwaJson" ? parseFuhwaHoldings(payload) : source.parser === "moneyDjHoldings" ? parseMoneyDjHoldings(payload, FUND_HOLDING_INDUSTRIES[fundKey]) : parseAllianzHoldings(payload);
  return { fundKey, ...parsed, sourceName: source.sourceName, sourceUrl: source.sourceUrl, fetchedAt: now() };
}

const pendingOfficialNavRequests = new Map();
const pendingHistoryNavRequests = new Map();
const pendingHoldingsRequests = new Map();

function requestOfficialNavCoalesced(fundKey, fetchImpl, now) {
  const pending = pendingOfficialNavRequests.get(fundKey);
  if (pending) return pending;
  const request = requestOfficialNav(fundKey, fetchImpl, now);
  pendingOfficialNavRequests.set(fundKey, request);
  request.then(() => pendingOfficialNavRequests.delete(fundKey), () => pendingOfficialNavRequests.delete(fundKey));
  return request;
}

function requestRecentHistoryNavCoalesced(fundKey, fetchImpl, now) {
  const pending = pendingHistoryNavRequests.get(fundKey);
  if (pending) return pending;
  const request = requestRecentHistoryNav(fundKey, fetchImpl, now);
  pendingHistoryNavRequests.set(fundKey, request);
  request.then(() => pendingHistoryNavRequests.delete(fundKey), () => pendingHistoryNavRequests.delete(fundKey));
  return request;
}

function requestHoldingsCoalesced(fundKey, fetchImpl, now) {
  const pending = pendingHoldingsRequests.get(fundKey);
  if (pending) return pending;
  const request = requestHoldings(fundKey, fetchImpl, now);
  pendingHoldingsRequests.set(fundKey, request);
  request.then(() => pendingHoldingsRequests.delete(fundKey), () => pendingHoldingsRequests.delete(fundKey));
  return request;
}

export function synchronizeLatestNavHistory(navSnapshot, historySnapshot) {
  const navDate = String(navSnapshot.navDate).replace(/\//g, "-");
  const historyRows = [...historySnapshot.rows]
    .map(row => ({ ...row, date: String(row.date).replace(/\//g, "-") }))
    .sort((left, right) => left.date.localeCompare(right.date));
  const priorRow = historyRows.filter(row => row.date < navDate).at(-1);
  const existingCurrentRow = historyRows.find(row => row.date === navDate);
  const calculatedChange = priorRow && priorRow.value > 0
    ? Number((((navSnapshot.nav - priorRow.value) / priorRow.value) * 100).toFixed(6))
    : Number.isFinite(existingCurrentRow?.changePct) ? Number(existingCurrentRow.changePct) : null;
  const latestRow = { date: navDate, value: Number(navSnapshot.nav), changePct: calculatedChange ?? 0 };
  const rows = [...historyRows.filter(row => row.date !== navDate), latestRow]
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-5);

  return {
    nav: { ...navSnapshot, changePct: calculatedChange },
    history: { ...historySnapshot, rows },
  };
}

export function createWorker({ fetchImpl = fetch, now = Date.now } = {}) {
  return {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      const originCheck = requireAllowedOrigin(request, env);
      if (originCheck.error) return responseJson({ error: originCheck.error }, originCheck.status);
      const origin = originCheck.origin;

      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
            "Vary": "Origin",
          },
        });
      }

      const pathname = url.pathname.replace(/\/+$/, "");
      if (request.method !== "GET" || !["/quotes", "/nav", "/history", "/holdings"].includes(pathname)) {
        return responseJson({ error: "找不到端點" }, 404, origin);
      }

      const fundKey = url.searchParams.get("fund") || "taiwanTechnology";
      if (!Object.prototype.hasOwnProperty.call(FUND_NAV_SOURCES, fundKey) || !Object.prototype.hasOwnProperty.call(FUND_HISTORY_SOURCES, fundKey) || !Object.prototype.hasOwnProperty.call(FUND_HOLDINGS_SOURCES, fundKey)) {
        return responseJson({ error: "不允許的基金代號" }, 400, origin);
      }

      const isNavRequest = pathname === "/nav";
      const isHistoryRequest = pathname === "/history";
      const isHoldingsRequest = pathname === "/holdings";
      const forceRefresh = url.searchParams.get("force") === "1";
      const cache = globalThis.caches?.default;
      const cacheNamespace = isNavRequest ? `fund-nav-${NAV_CACHE_VERSION}` : isHistoryRequest ? `fund-history-${HISTORY_CACHE_VERSION}` : isHoldingsRequest ? `fund-holdings-${HOLDINGS_CACHE_VERSION}` : "yahoo-quotes";
      const cacheKey = new Request(`${url.origin}/internal/${cacheNamespace}/${fundKey}`);
      if (cache && !forceRefresh) {
        const cached = await cache.match(cacheKey);
        if (cached) return responseWithCors(cached, origin);
      }

      try {
        let snapshot;
        if (isNavRequest) {
          const officialNav = await requestOfficialNavCoalesced(fundKey, fetchImpl, now);
          try {
            const history = await requestRecentHistoryNavCoalesced(fundKey, fetchImpl, now);
            snapshot = synchronizeLatestNavHistory(officialNav, history).nav;
          } catch {
            snapshot = { ...officialNav, changePct: null };
          }
        } else if (isHistoryRequest) {
          const history = await requestRecentHistoryNavCoalesced(fundKey, fetchImpl, now);
          try {
            const officialNav = await requestOfficialNavCoalesced(fundKey, fetchImpl, now);
            snapshot = synchronizeLatestNavHistory(officialNav, history).history;
          } catch {
            snapshot = history;
          }
        } else if (isHoldingsRequest) {
          snapshot = await requestHoldingsCoalesced(fundKey, fetchImpl, now);
        } else {
          snapshot = await requestYahooQuotes(fundKey, fetchImpl, now);
        }
        const cacheTtlSeconds = isNavRequest ? NAV_CACHE_TTL_SECONDS : isHistoryRequest ? HISTORY_CACHE_TTL_SECONDS : isHoldingsRequest ? HOLDINGS_CACHE_TTL_SECONDS : QUOTE_CACHE_TTL_SECONDS;
        const snapshotWithCache = isNavRequest || isHistoryRequest || isHoldingsRequest
          ? { ...snapshot, cacheTtlSeconds, cacheExpiresAt: Number(snapshot.fetchedAt) + cacheTtlSeconds * 1000 }
          : snapshot;
        const cachedResponse = responseJson(snapshotWithCache, 200, env.ALLOWED_ORIGIN);
        cachedResponse.headers.set("Cache-Control", `public, max-age=${cacheTtlSeconds}`);
        if (cache) {
          const cacheWrite = cache.put(cacheKey, cachedResponse.clone());
          if (ctx?.waitUntil) ctx.waitUntil(cacheWrite);
          else await cacheWrite;
        }
        return responseJson(snapshotWithCache, 200, origin);
      } catch {
        return responseJson({ error: isNavRequest ? "官方淨值暫時無法提供資料" : isHistoryRequest ? "公開歷史淨值暫時無法提供資料" : isHoldingsRequest ? "官方公開持股暫時無法提供資料" : "Yahoo 股市暫時無法提供報價" }, 502, origin);
      }
    },
  };
}

export default createWorker();