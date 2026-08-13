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
  } as const;
  
  export type FundNavKey = keyof typeof FUND_NAV_SOURCES;
  
  export const FUND_HISTORY_SOURCES: Record<FundNavKey, { sourceName: string; sourceUrl: string }> = {
    taiwanTechnology: { sourceName: "公開基金淨值表（華南銀行／MoneyDJ）", sourceUrl: "https://fund.hncb.com.tw/w/wr/wr02_ACDD04-005003.djhtm" },
    taiwanDaba: { sourceName: "公開基金淨值表（兆豐銀行／MoneyDJ）", sourceUrl: "https://fund.megabank.com.tw/w/wr/wr02_ACDD01-4101.djhtm" },
    taiwanIntelligence: { sourceName: "公開基金淨值表（華南銀行／MoneyDJ）", sourceUrl: "https://fund.hncb.com.tw/w/wr/wr02_ACDD19-005019.djhtm" },
    fuhwaOmni: { sourceName: "公開基金淨值表（華南銀行／MoneyDJ）", sourceUrl: "https://fund.hncb.com.tw/w/wr/wr02.djhtm?a=ACFH15-031015" },
  };
  
  export type OfficialNavSnapshot = {
    fundKey: FundNavKey;
    nav: number;
    navDate: string;
    sourceName: string;
    sourceUrl: string;
    fetchedAt: number;
    cacheTtlSeconds: number;
    cacheExpiresAt: number;
    changePct: number | null;
  };
  
  export type RecentHistorySnapshot = {
    fundKey: FundNavKey;
    rows: Array<{ date: string; value: number; changePct: number }>;
    sourceName: string;
    sourceUrl: string;
    fetchedAt: number;
    cacheTtlSeconds: number;
    cacheExpiresAt: number;
  };
  
  const REQUEST_TIMEOUT_MS = 8_000;
  export const CACHE_TTL_MS = 10 * 60 * 1_000;
  const cachedSnapshots = new Map<FundNavKey, OfficialNavSnapshot>();
  const pendingSnapshots = new Map<FundNavKey, Promise<OfficialNavSnapshot>>();
  const cachedHistorySnapshots = new Map<FundNavKey, RecentHistorySnapshot>();
  const pendingHistorySnapshots = new Map<FundNavKey, Promise<RecentHistorySnapshot>>();
  const REQUEST_HEADERS = {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
  };
  
  function stripHtml(html: string) {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  function normalizeNavDate(value: string) {
    const match = value.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (!match) throw new Error("官方淨值日期格式不完整");
    return `${match[1]}/${match[2].padStart(2, "0")}/${match[3].padStart(2, "0")}`;
  }
  
  export function parseOfficialNav(html: string, parser: "allianzTable" | "hncbTable" | "fuhwaHero", fundName = "") {
    if (parser === "allianzTable") {
      const text = stripHtml(html);
      const nameIndex = text.indexOf(fundName);
      const segment = nameIndex >= 0 ? text.slice(nameIndex, nameIndex + 320) : "";
      const matcher = segment.match(/TWD\s*([0-9][0-9,]*(?:\.\d+)?)\s*(\d{4}[/-]\d{1,2}[/-]\d{1,2})/);
      if (!matcher) throw new Error("找不到安聯官方最新淨值");
      return { nav: Number(matcher[1].replace(/,/g, "")), navDate: normalizeNavDate(matcher[2]) };
    }
  
    if (parser === "hncbTable") {
      const text = stripHtml(html);
      const matcher = text.match(/(\d{4}[/-]\d{1,2}[/-]\d{1,2})\s+([0-9][0-9,]*(?:\.\d+)?)(?:\s+[+-]?[0-9][0-9,]*(?:\.\d+)?){1,2}/);
      if (!matcher) throw new Error("找不到復華公開最新淨值");
      const nav = Number(matcher[2].replace(/,/g, ""));
      if (!Number.isFinite(nav) || nav <= 0) throw new Error("官方淨值數值不完整");
      return { nav, navDate: normalizeNavDate(matcher[1]) };
    }
  
    const heroMatcher = html.match(/class=["'][^"']*fundState-type[^"']*["'][^>]*>\s*淨值\s*<\/div>[\s\S]{0,800}?class=["'][^"']*fundState-value[^"']*["'][^>]*>\s*([0-9][0-9,]*(?:\.\d+)?)[\s\S]{0,800}?class=["'][^"']*fundState-date[^"']*["'][^>]*>\s*(\d{4}[/-]\d{1,2}[/-]\d{1,2})/i);
    if (!heroMatcher) throw new Error("找不到復華官方最新淨值");
    const nav = Number(heroMatcher[1].replace(/,/g, ""));
    if (!Number.isFinite(nav) || nav <= 0) throw new Error("官方淨值數值不完整");
    return { nav, navDate: normalizeNavDate(heroMatcher[2]) };
  }
  
  export function parseRecentHistoryNav(html: string, limit = 5) {
    const text = stripHtml(html);
    const matches = Array.from(text.matchAll(/(\d{4}[/-]\d{1,2}[/-]\d{1,2})\s+([0-9][0-9,]*(?:\.\d+)?)\s+([+-]?[0-9][0-9,]*(?:\.\d+)?)\s+([+-]?[0-9][0-9,]*(?:\.\d+)?)/g));
    const seenDates = new Set<string>();
    const rows: RecentHistorySnapshot["rows"] = [];
    for (const match of matches) {
      const date = normalizeNavDate(match[1]);
      if (seenDates.has(date)) continue;
      const value = Number(match[2].replace(/,/g, ""));
      const changePct = Number(match[4].replace(/,/g, ""));
      if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(changePct)) continue;
      seenDates.add(date);
      rows.push({ date, value, changePct });
      if (rows.length === limit) break;
    }
    if (rows.length !== limit) throw new Error("找不到足夠的公開歷史淨值");
    return rows.reverse();
  }
  
  export async function requestOfficialNav(fundKey: FundNavKey, fetchImpl: typeof fetch = fetch, now: () => number = Date.now): Promise<OfficialNavSnapshot> {
    const source = FUND_NAV_SOURCES[fundKey];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetchImpl(source.sourceUrl, { headers: REQUEST_HEADERS, signal: controller.signal });
      if (!response.ok) throw new Error(`官方淨值資料回應 ${response.status}`);
      const { nav, navDate } = parseOfficialNav(await response.text(), source.parser, "fundName" in source ? source.fundName : "");
      const fetchedAt = now();
      return { fundKey, nav, navDate, sourceName: source.sourceName, sourceUrl: source.sourceUrl, fetchedAt, cacheTtlSeconds: CACHE_TTL_MS / 1_000, cacheExpiresAt: fetchedAt + CACHE_TTL_MS, changePct: null };
    } finally {
      clearTimeout(timeout);
    }
  }
  
  export async function requestRecentHistoryNav(fundKey: FundNavKey, fetchImpl: typeof fetch = fetch, now: () => number = Date.now): Promise<RecentHistorySnapshot> {
    const source = FUND_HISTORY_SOURCES[fundKey];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetchImpl(source.sourceUrl, { headers: REQUEST_HEADERS, signal: controller.signal });
      if (!response.ok) throw new Error(`公開歷史淨值資料回應 ${response.status}`);
      const fetchedAt = now();
      return { fundKey, rows: parseRecentHistoryNav(await response.text()), sourceName: source.sourceName, sourceUrl: source.sourceUrl, fetchedAt, cacheTtlSeconds: CACHE_TTL_MS / 1_000, cacheExpiresAt: fetchedAt + CACHE_TTL_MS };
    } finally {
      clearTimeout(timeout);
    }
  }
  
  export function synchronizeLatestNavHistory(navSnapshot: OfficialNavSnapshot, historySnapshot: RecentHistorySnapshot): { nav: OfficialNavSnapshot; history: RecentHistorySnapshot } {
    const navDate = navSnapshot.navDate.replace(/\//g, "-");
    const historyRows = [...historySnapshot.rows]
      .map(row => ({ ...row, date: row.date.replace(/\//g, "-") }))
      .sort((left, right) => left.date.localeCompare(right.date));
    const priorRow = historyRows.filter(row => row.date < navDate).at(-1);
    const existingCurrentRow = historyRows.find(row => row.date === navDate);
    const calculatedChange = priorRow && priorRow.value > 0
      ? Number((((navSnapshot.nav - priorRow.value) / priorRow.value) * 100).toFixed(6))
      : Number.isFinite(existingCurrentRow?.changePct) ? Number(existingCurrentRow?.changePct) : null;
    const latestRow = { date: navDate, value: navSnapshot.nav, changePct: calculatedChange ?? 0 };
    const rows = [...historyRows.filter(row => row.date !== navDate), latestRow]
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(-5);
  
    return {
      nav: { ...navSnapshot, changePct: calculatedChange },
      history: { ...historySnapshot, rows },
    };
  }
  
  export async function getOfficialNav(fundKey: FundNavKey, force = false): Promise<OfficialNavSnapshot> {
    const cached = cachedSnapshots.get(fundKey);
    if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached;
    const pending = pendingSnapshots.get(fundKey);
    if (pending) return pending;
    const request = requestOfficialNav(fundKey);
    pendingSnapshots.set(fundKey, request);
    try {
      const snapshot = await request;
      cachedSnapshots.set(fundKey, snapshot);
      return snapshot;
    } finally {
      pendingSnapshots.delete(fundKey);
    }
  }
  
  export async function getRecentHistoryNav(fundKey: FundNavKey, force = false): Promise<RecentHistorySnapshot> {
    const cached = cachedHistorySnapshots.get(fundKey);
    if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached;
    const pending = pendingHistorySnapshots.get(fundKey);
    if (pending) return pending;
    const request = (async () => {
      const history = await requestRecentHistoryNav(fundKey);
      try {
        const officialNav = await getOfficialNav(fundKey, force);
        const synced = synchronizeLatestNavHistory(officialNav, history);
        cachedSnapshots.set(fundKey, synced.nav);
        return synced.history;
      } catch {
        return history;
      }
    })();
    pendingHistorySnapshots.set(fundKey, request);
    try {
      const snapshot = await request;
      cachedHistorySnapshots.set(fundKey, snapshot);
      return snapshot;
    } finally {
      pendingHistorySnapshots.delete(fundKey);
    }
  }
  