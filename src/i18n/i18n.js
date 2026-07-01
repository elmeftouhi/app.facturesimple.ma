import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import ar from "./locales/ar.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      ar: { translation: ar }
    },
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"]
    }
  });

// Set text direction based on selected language
i18n.on("languageChanged", (lng) => {
  const isRtl = lng.startsWith("ar");
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
  document.documentElement.lang = lng;
});

// Initialize direction on load
const currentLang = i18n.language || "fr";
document.documentElement.dir = currentLang.startsWith("ar") ? "rtl" : "ltr";
document.documentElement.lang = currentLang;

export default i18n;
