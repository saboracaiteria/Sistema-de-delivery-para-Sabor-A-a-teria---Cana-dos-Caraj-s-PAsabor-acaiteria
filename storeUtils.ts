
import { GlobalSettings } from './types';

// Currency Formatter
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Formata um valor numérico para o formato de moeda BRL (R$).
 */
export const formatCurrency = (value: number) => {
  return currencyFormatter.format(value);
};

/**
 * Converte um arquivo para uma string Base64.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Calcula se a loja está aberta baseada nos horários de funcionamento e status manual.
 */
export const calculateStoreStatus = (currentSettings: GlobalSettings): boolean => {
  if (!currentSettings || !currentSettings.openingHours || !Array.isArray(currentSettings.openingHours)) {
    return false;
  }

  if (currentSettings.storeStatus === 'open') return true;
  if (currentSettings.storeStatus === 'closed') return false;

  // Auto Mode
  const now = new Date();
  const day = now.getDay();
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

      if (closeTime < openTime) {
        // Early morning of yesterday's shift
        if (currentTime <= closeTime) return true;
      }
    }
  }

  return false;
};
