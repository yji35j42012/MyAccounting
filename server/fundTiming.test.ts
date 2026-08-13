import { describe, expect, it } from "vitest";
import { formatCountdown, getRefreshTimingText } from "../shared/fundTiming";

describe("fund refresh timing", () => {
  it("formats cache and automatic refresh countdowns", () => {
    expect(formatCountdown(61_001)).toBe("1 分 02 秒");
    expect(formatCountdown(-100)).toBe("0 秒");
    expect(getRefreshTimingText(1_000, 601_000, 121_000)).toBe("快取剩餘 8 分 00 秒 · 下次自動更新 28 分 00 秒");
  });

  it("explains timing before the first successful snapshot", () => {
    expect(getRefreshTimingText(0, 0, 1_000)).toBe("取得後顯示快取與自動更新倒數");
  });
});
