(function (global) {
	const TAIPEI_FORMATTER = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Taipei',
		weekday: 'short',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23'
	});

	function getTaipeiParts(timestamp = Date.now()) {
		const values = Object.fromEntries(TAIPEI_FORMATTER.formatToParts(new Date(timestamp)).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
		return { year: Number(values.year), month: Number(values.month), day: Number(values.day), hour: Number(values.hour), minute: Number(values.minute), weekday: values.weekday };
	}

	function formatDate({ year, month, day }) { return `${ year }-${ String(month).padStart(2, '0') }-${ String(day).padStart(2, '0') }`; }
	function weekdayFor({ year, month, day }) { return new Date(Date.UTC(year, month - 1, day)).getUTCDay(); }
	function isTaipeiWeekday(timestamp = Date.now()) { const day = weekdayFor(getTaipeiParts(timestamp)); return day >= 1 && day <= 5; }
	function normalizeFundDate(value) {
		const match = String(value || '').replace(/\s/g, '').match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
		return match ? `${ match[1] }-${ match[2].padStart(2, '0') }-${ match[3].padStart(2, '0') }` : '';
	}

	function previousTaipeiWeekday(parts) {
		const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
		do { date.setUTCDate(date.getUTCDate() - 1); } while (date.getUTCDay() === 0 || date.getUTCDay() === 6);
		return formatDate({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() });
	}

	function isTaipeiStockAutoWindow(timestamp = Date.now()) {
		if (!isTaipeiWeekday(timestamp)) return false;
		const parts = getTaipeiParts(timestamp);
		const minutes = parts.hour * 60 + parts.minute;
		return minutes >= 9 * 60 && minutes < 14 * 60;
	}

	function getQuoteAutoSlot(timestamp = Date.now()) {
		if (!isTaipeiStockAutoWindow(timestamp)) return '';
		const parts = getTaipeiParts(timestamp);
		return `${ formatDate(parts) }-${ String(parts.hour).padStart(2, '0') }-${ Math.floor(parts.minute / 5) }`;
	}

	function isTaipeiFundPublishWindow(timestamp = Date.now()) {
		if (!isTaipeiWeekday(timestamp)) return false;
		const parts = getTaipeiParts(timestamp);
		return parts.hour * 60 + parts.minute >= 16 * 60;
	}

	function getExpectedFundNavDate(timestamp = Date.now()) {
		const parts = getTaipeiParts(timestamp);
		return isTaipeiFundPublishWindow(timestamp) ? formatDate(parts) : previousTaipeiWeekday(parts);
	}

	function isExpectedFundNavDate(snapshotDate, timestamp = Date.now()) { return normalizeFundDate(snapshotDate) === getExpectedFundNavDate(timestamp); }

	global.FundUpdateTiming = {
		getTaipeiParts,
		isTaipeiWeekday,
		isTaipeiStockAutoWindow,
		getQuoteAutoSlot,
		isTaipeiFundPublishWindow,
		getExpectedFundNavDate,
		isExpectedFundNavDate,
		normalizeFundDate
	};
})(typeof window !== 'undefined' ? window : globalThis);
