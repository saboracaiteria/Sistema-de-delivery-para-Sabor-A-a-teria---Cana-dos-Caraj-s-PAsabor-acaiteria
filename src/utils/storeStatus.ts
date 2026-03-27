import { GlobalSettings } from '../types';

/**
 * Calculates whether the store is open based on its status and opening hours.
 * @param currentSettings The global settings of the store.
 * @returns boolean true if open, false if closed.
 */
export const calculateStoreStatus = (currentSettings: GlobalSettings): boolean => {
  if (!currentSettings || !currentSettings.openingHours || !Array.isArray(currentSettings.openingHours)) {
    return false;
  }

  if (currentSettings.storeStatus === 'open') return true;
  if (currentSettings.storeStatus === 'closed') return false;

  // Auto Mode
  const now = new Date();
  const day = now.getDay(); // 0 (Sun) to 6 (Sat)
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // 1. Check Today's Schedule
  const todayConfig = currentSettings.openingHours.find(h => h.dayOfWeek === day);
  if (todayConfig && todayConfig.enabled && todayConfig.open && todayConfig.close) {
    const [oh, om] = todayConfig.open.split(':').map(Number);
    const [ch, cm] = todayConfig.close.split(':').map(Number);

    if (!isNaN(oh) && !isNaN(om) && !isNaN(ch) && !isNaN(cm)) {
      const openTime = oh * 60 + om;
      const closeTime = ch * 60 + cm;

      if (closeTime < openTime) {
        // Crosses midnight (e.g. 18:00 - 02:00)
        if (currentTime >= openTime) return true;
      } else {
        // Normal day (e.g. 08:00 - 20:00)
        if (currentTime >= openTime && currentTime <= closeTime) return true;
      }
    }
  }

  // 2. Check Yesterday's Schedule (Early Morning Handling)
  const yesterdayDay = day === 0 ? 6 : day - 1;
  const yesterdayConfig = currentSettings.openingHours.find(h => h.dayOfWeek === yesterdayDay);
  if (yesterdayConfig && yesterdayConfig.enabled && yesterdayConfig.open && yesterdayConfig.close) {
    const [oh, om] = yesterdayConfig.open.split(':').map(Number);
    const [ch, cm] = yesterdayConfig.close.split(':').map(Number);

    if (!isNaN(oh) && !isNaN(om) && !isNaN(ch) && !isNaN(cm)) {
      const openTime = oh * 60 + om;
      const closeTime = ch * 60 + cm;

      // Only matters if yesterday crossed midnight
      if (closeTime < openTime) {
        // We are in the "early morning" part of yesterday's shift
        if (currentTime <= closeTime) return true;
      }
    }
  }

  return false;
};
