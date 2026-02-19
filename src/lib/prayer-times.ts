import { PrayerTimes, CalculationMethod, Coordinates, SunnahTimes } from 'adhan';
import type { PrayerName } from './types';

// Sydney CBD coordinates as citywide proxy
const SYDNEY_COORDS = new Coordinates(-33.8688, 151.2093);

export function getPrayerTimes(date: Date = new Date()): Record<PrayerName, Date> {
  const params = CalculationMethod.MuslimWorldLeague();
  // Shafi'i uses standard Asr calculation (shadow = object length)
  // MuslimWorldLeague default is already standard (Shafi'i)
  const prayers = new PrayerTimes(SYDNEY_COORDS, date, params);

  return {
    fajr: prayers.fajr,
    dhuhr: prayers.dhuhr,
    asr: prayers.asr,
    maghrib: prayers.maghrib,
    isha: prayers.isha,
  };
}

export function formatPrayerTime(date: Date): string {
  return date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Australia/Sydney',
  });
}

export function getEventTime(
  prayerAnchor: PrayerName,
  offsetMinutes: number,
  date: Date = new Date()
): { label: string; calculatedTime: Date } {
  const prayers = getPrayerTimes(date);
  const prayerTime = prayers[prayerAnchor];
  const calculatedTime = new Date(prayerTime.getTime() + offsetMinutes * 60 * 1000);

  const prayerLabel = prayerAnchor.charAt(0).toUpperCase() + prayerAnchor.slice(1);
  const timeStr = formatPrayerTime(calculatedTime);

  let label: string;
  if (offsetMinutes === 0) {
    label = `At ${prayerLabel} (~${timeStr})`;
  } else if (offsetMinutes > 0) {
    label = `${offsetMinutes}min after ${prayerLabel} (~${timeStr})`;
  } else {
    label = `${Math.abs(offsetMinutes)}min before ${prayerLabel} (~${timeStr})`;
  }

  return { label, calculatedTime };
}

export function getNextPrayerTimesForWeek(): Record<PrayerName, string> {
  const today = new Date();
  const prayers = getPrayerTimes(today);
  return {
    fajr: formatPrayerTime(prayers.fajr),
    dhuhr: formatPrayerTime(prayers.dhuhr),
    asr: formatPrayerTime(prayers.asr),
    maghrib: formatPrayerTime(prayers.maghrib),
    isha: formatPrayerTime(prayers.isha),
  };
}
