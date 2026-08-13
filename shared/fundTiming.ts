export function formatCountdown(milliseconds: number): string {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1_000));
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;
  return minutes > 0 ? `${minutes} 分 ${String(remainSeconds).padStart(2, "0")} 秒` : `${remainSeconds} 秒`;
}

export function getRefreshTimingText(
  fetchedAt: number,
  cacheExpiresAt: number,
  now: number,
  autoRefreshMs = 30 * 60 * 1_000,
): string {
  if (!Number.isFinite(fetchedAt) || fetchedAt <= 0) return "取得後顯示快取與自動更新倒數";
  const cacheRemaining = formatCountdown(Math.max(0, cacheExpiresAt - now));
  const autoRemaining = formatCountdown(Math.max(0, fetchedAt + autoRefreshMs - now));
  return `快取剩餘 ${cacheRemaining} · 下次自動更新 ${autoRemaining}`;
}
