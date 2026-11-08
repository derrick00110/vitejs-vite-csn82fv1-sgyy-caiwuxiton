// 账单账期：月份文案保持「8月」，年份单独存放，展示为「2025年8月」。

export const MONTH_LABELS = Array.from({ length: 12 }, (_, index) => `${index + 1}月`);

/** 历史种子账是 2026-03-19 一次性导入的，createdAt 不能代表业务发生年。 */
export const HISTORICAL_SEED_ENTERED_AT = Date.parse('2026-03-19T06:43:03.552Z');

const CHINA_OFFSET_MS = 8 * 60 * 60 * 1000;

export function parseMonthNumber(month: unknown): number | null {
  if (typeof month === 'number' && Number.isInteger(month) && month >= 1 && month <= 12) {
    return month;
  }
  if (month == null) return null;
  const matched = String(month).match(/(\d{1,2})\s*月/);
  if (!matched) return null;
  const monthNumber = Number(matched[1]);
  if (monthNumber < 1 || monthNumber > 12) return null;
  return monthNumber;
}

/** 去掉年份，只留原来的「8月」，避免把年份写进 month 字段。 */
export function normalizeMonthLabel(month: unknown): string {
  const monthNumber = parseMonthNumber(month);
  return monthNumber ? `${monthNumber}月` : '';
}

export function formatPeriod(year: unknown, month: unknown): string {
  const label = normalizeMonthLabel(month);
  const yearNumber = Number(year);
  if (Number.isInteger(yearNumber) && yearNumber > 0 && label) return `${yearNumber}年${label}`;
  return label || '未填月份';
}

export function makePeriodKey(year: unknown, month: unknown): string {
  const yearNumber = Number(year);
  const monthNumber = parseMonthNumber(month);
  const yearPart = Number.isInteger(yearNumber) ? String(yearNumber).padStart(4, '0') : '0000';
  const monthPart = monthNumber ? String(monthNumber).padStart(2, '0') : '99';
  return `${yearPart}-${monthPart}`;
}

function chinaEntryDate(createdAt: unknown): { year: number; month: number } | null {
  const timestamp = Number(createdAt);
  if (!Number.isFinite(timestamp) || timestamp < 1e11) return null;
  const shifted = new Date(timestamp + CHINA_OFFSET_MS);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1 };
}

type YearSource = {
  year?: unknown;
  month?: unknown;
  createdAt?: unknown;
};

/**
 * 年份优先级：
 * 1. 单据上的 year（新增账单，或用户改过月份后写入的年份）
 * 2. 月份原文里已经带年份，例如「2025年8月」
 * 3. 用 createdAt 的中国日期推断：账单月份晚于录入月份，则属于上一年。
 *    2026-03-19 导入的 10/11/12 月因此是 2025；1 月、3 月以及之后逐月录入的是 2026。
 * 4. 没有可靠日期时默认 2026。现有云端账单的录入时间都在 2026，不用这个默认去覆盖已有日期。
 */
export function resolveBillYear(item: YearSource | null | undefined): number {
  const explicit = Number(item?.year);
  if (Number.isInteger(explicit) && explicit >= 2000 && explicit <= 2100) return explicit;

  const embedded = String(item?.month ?? '').match(/(20\d{2})\s*年/);
  if (embedded) return Number(embedded[1]);

  const monthNumber = parseMonthNumber(item?.month);
  const entered = chinaEntryDate(item?.createdAt);
  if (monthNumber && entered) {
    if (monthNumber > entered.month) return entered.year - 1;
    return entered.year;
  }

  return 2026;
}

export function yearForHistoricalSeed(month: unknown): number {
  return resolveBillYear({ month, createdAt: HISTORICAL_SEED_ENTERED_AT });
}

/** 至少覆盖 2025 与 2026，并随当前年向后留一年，已选中的更远年份也保留。 */
export function yearChoices(selected?: unknown, nowYear = new Date().getFullYear()): number[] {
  let start = Math.min(2025, nowYear - 1);
  let end = Math.max(2026, nowYear + 1);
  const extra = Number(selected);
  if (Number.isInteger(extra) && extra >= 2000 && extra <= 2100) {
    if (extra < start) start = extra;
    if (extra > end) end = extra;
  }
  const years: number[] = [];
  for (let year = start; year <= end; year += 1) years.push(year);
  return years;
}

export function blankBillDraft(now = new Date()) {
  return {
    year: now.getFullYear(),
    month: `${now.getMonth() + 1}月`,
    student: '',
    course: '',
    revenue: '',
    teacher: '',
    notes: '',
    category: '乐器初级',
  };
}
