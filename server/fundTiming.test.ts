import { beforeAll, describe, expect, it } from "vitest";

type FundUpdateTimingApi = {
	isTaipeiStockAutoWindow (timestamp: number): boolean;
	getQuoteAutoSlot (timestamp: number): string;
	isTaipeiFundPublishWindow (timestamp: number): boolean;
	getExpectedFundNavDate (timestamp: number): string;
	isExpectedFundNavDate (value: string, timestamp: number): boolean;
	normalizeFundDate (value: string): string;
};

let timing: FundUpdateTimingApi;

beforeAll(async () => {
	await import("../js/fund-update-timing.js");
	timing = (globalThis as typeof globalThis & { FundUpdateTiming: FundUpdateTimingApi }).FundUpdateTiming;
});

describe("Taipei trading and fund NAV update timing", () => {
	it("limits automatic Yahoo updates to weekday 09:00 through before 14:00 Taipei time", () => {
		expect(timing.isTaipeiStockAutoWindow(Date.parse("2026-08-14T00:59:00Z"))).toBe(false);
		expect(timing.isTaipeiStockAutoWindow(Date.parse("2026-08-14T01:00:00Z"))).toBe(true);
		expect(timing.isTaipeiStockAutoWindow(Date.parse("2026-08-14T05:59:00Z"))).toBe(true);
		expect(timing.isTaipeiStockAutoWindow(Date.parse("2026-08-14T06:00:00Z"))).toBe(false);
		expect(timing.isTaipeiStockAutoWindow(Date.parse("2026-08-15T02:00:00Z"))).toBe(false);
		expect(timing.getQuoteAutoSlot(Date.parse("2026-08-14T01:04:00Z"))).toBe("2026-08-14-09-0");
		expect(timing.getQuoteAutoSlot(Date.parse("2026-08-14T01:05:00Z"))).toBe("2026-08-14-09-1");
	});

	it("uses the previous weekday NAV before 16:00 and the current date at or after 16:00 Taipei time", () => {
		const fridayMorning = Date.parse("2026-08-14T02:27:00Z");
		const fridayBeforePublish = Date.parse("2026-08-14T07:59:00Z");
		const fridayPublish = Date.parse("2026-08-14T08:00:00Z");
		const mondayMorning = Date.parse("2026-08-17T02:00:00Z");

		expect(timing.isTaipeiFundPublishWindow(fridayMorning)).toBe(false);
		expect(timing.getExpectedFundNavDate(fridayMorning)).toBe("2026-08-13");
		expect(timing.getExpectedFundNavDate(fridayBeforePublish)).toBe("2026-08-13");
		expect(timing.isTaipeiFundPublishWindow(fridayPublish)).toBe(true);
		expect(timing.getExpectedFundNavDate(fridayPublish)).toBe("2026-08-14");
		expect(timing.getExpectedFundNavDate(mondayMorning)).toBe("2026-08-14");
	});

	it("accepts a local cache only when its data date matches the expected NAV date", () => {
		const morning = Date.parse("2026-08-14T02:27:00Z");
		const afterPublish = Date.parse("2026-08-14T08:01:00Z");

		expect(timing.normalizeFundDate("2026 / 08 / 13")).toBe("2026-08-13");
		expect(timing.isExpectedFundNavDate("2026 / 08 / 13", morning)).toBe(true);
		expect(timing.isExpectedFundNavDate("2026 / 08 / 12", morning)).toBe(false);
		expect(timing.isExpectedFundNavDate("2026 / 08 / 13", afterPublish)).toBe(false);
		expect(timing.isExpectedFundNavDate("2026 / 08 / 14", afterPublish)).toBe(true);
	});
});
