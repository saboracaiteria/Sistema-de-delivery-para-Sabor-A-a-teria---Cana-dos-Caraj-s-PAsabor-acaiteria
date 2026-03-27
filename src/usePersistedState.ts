
import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

/**
 * Custom hook to use state that is persisted using Capacitor Preferences.
 */
export const usePersistedState = <T,>(key: string, initialValue: T) => {
  const [state, setState] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      try {
        const { value } = await Preferences.get({ key });
        if (value) {
          setState(JSON.parse(value));
        }
      } catch (error) {
        console.error(`Error loading ${key} from Preferences:`, error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadState();
  }, [key]);

  // Save state on change (only after initial load)
  useEffect(() => {
    if (!isLoaded) return;

    const saveState = async () => {
      try {
        await Preferences.set({ key, value: JSON.stringify(state) });
      } catch (error) {
        console.error(`Error saving ${key} to Preferences:`, error);
      }
    };
    saveState();
  }, [key, state, isLoaded]);

  return [state, setState, isLoaded] as const;
};
