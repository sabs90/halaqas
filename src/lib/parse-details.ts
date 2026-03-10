/**
 * Extract key details (rak'at, juz, nights, time ranges, khatm) from an event description.
 * Returns a compact string like "20 rak'at · 1 juz · khatm" or null if nothing found.
 */
export function parseDetailSummary(description: string | null): string | null {
  if (!description) return null;

  const nuggets: string[] = [];

  // Rak'at / rakat
  const rakatMatch = description.match(/(\d+)\s*(?:rak['\u2019]?at|raka['']?at|rakaat)/i);
  if (rakatMatch) nuggets.push(`${rakatMatch[1]} rak'at`);

  // Juz / ajza (handles fractions like 1½, 1.5, ½)
  const juzMatch = description.match(/([\d½¼¾]+(?:[.\s]?[\d½¼¾]*)?)\s*(?:juz|ajza|juz')/i);
  if (juzMatch) nuggets.push(`${juzMatch[1].trim()} juz`);

  // "Last 10 nights" or "every night" or "nightly"
  const nightsMatch = description.match(/(last\s+\d+\s+nights?|every\s+night|nightly|all\s+\d+\s+nights?)/i);
  if (nightsMatch) nuggets.push(nightsMatch[1].toLowerCase());

  // Time range like "12am–3am" or "11:30pm - 2:00am"
  const timeRange = description.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*[-–—to]+\s*\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
  if (timeRange) nuggets.push(timeRange[1].replace(/\s+/g, ''));

  // Khatm / completion of Quran
  if (/khatm|complete.*quran|full.*quran/i.test(description)) nuggets.push('khatm');

  if (nuggets.length === 0) return null;
  return nuggets.join(' · ');
}
