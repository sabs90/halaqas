/**
 * Extract key details (rak'at, juz, nights, time ranges, khatm) from an event description.
 * Returns a compact string like "20 rak'at · 1 juz · khatm" or null if nothing found.
 */
export function parseDetailSummary(description: string | null): string | null {
  if (!description) return null;

  const nuggets: string[] = [];

  // Rak'at / rakat (various spellings)
  const rakatMatch = description.match(/(\d+)\s*(?:rak['\u2019]?at|raka['\u2019]?at|rakaat|rak['`]ah)/i);
  if (rakatMatch) nuggets.push(`${rakatMatch[1]} rak'at`);

  // Juz / ajza / ajzaa (handles fractions like 1½, 1.5, ½)
  const juzMatch = description.match(/([\d½¼¾]+(?:[.\s]?[\d½¼¾]*)?)\s*(?:juz|ajza+|juz')/i);
  if (juzMatch) nuggets.push(`${juzMatch[1].trim()} juz`);

  // "Last 10 nights" or "every night" or "nightly" or "last ten nights"
  const nightsMatch = description.match(/(last\s+(?:\d+|ten|five)\s+nights?|every\s+night|nightly|all\s+\d+\s+nights?)/i);
  if (nightsMatch) {
    let val = nightsMatch[1].toLowerCase();
    val = val.replace('ten', '10').replace('five', '5');
    nuggets.push(val);
  }

  // Time range: "3:00 AM - 5:00 AM", "1am-5am", "1:30am to 4:30am", "from 3am to 5am"
  const timeRange = description.match(
    /(?:from\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*[-–—]+\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i
  ) || description.match(
    /(?:from\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s+to\s+(?:approximately\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i
  );
  if (timeRange) {
    const start = timeRange[1].replace(/\s+/g, '').toLowerCase();
    const end = timeRange[2].replace(/\s+/g, '').toLowerCase();
    nuggets.push(`${start}-${end}`);
  }

  // Khatm / completion of Quran
  if (/khatm|complete.*quran|full.*quran/i.test(description)) nuggets.push('khatm');

  if (nuggets.length === 0) return null;
  return nuggets.join(' · ');
}
