import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en";
import hr from "./locales/hr";

export const SUPPORTED_LANGUAGES = ["en", "hr"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const resources = {
  en,
  hr,
};

const DEFAULT_LANGUAGE: AppLanguage = "en";
const LANGUAGE_STORAGE_KEY = "app.language";

const getDeviceLanguage = (): AppLanguage => {
  const locales = Localization.getLocales();
  const deviceLanguage = locales?.[0]?.languageCode?.toLowerCase();

  if (
    deviceLanguage &&
    SUPPORTED_LANGUAGES.includes(deviceLanguage as AppLanguage)
  ) {
    return deviceLanguage as AppLanguage;
  }

  return DEFAULT_LANGUAGE;
};

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
});

export const getCurrentLanguage = (): AppLanguage => {
  const lng = i18n.language as AppLanguage | undefined;
  return lng && SUPPORTED_LANGUAGES.includes(lng) ? lng : DEFAULT_LANGUAGE;
};

export const changeLanguage = (language: AppLanguage) =>
  i18n.changeLanguage(language);

export const setAppLanguage = async (language: AppLanguage) => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
};

// Resolve persisted user choice after init.
// This runs "in the background" and updates i18n once it finishes loading.
void (async () => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!saved) return;
    if (!SUPPORTED_LANGUAGES.includes(saved as AppLanguage)) return;
    const savedLanguage = saved as AppLanguage;
    if (savedLanguage === getCurrentLanguage()) return;
    await i18n.changeLanguage(savedLanguage);
  } catch {
    // If storage is unavailable (rare), just keep device-language/default.
  }
})();

export default i18n;
