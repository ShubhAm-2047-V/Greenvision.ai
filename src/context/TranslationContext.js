'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

const TranslationContext = createContext({});

const translations = {
  en: {
    brand: "AgroMind AI",
    tagline: "AI-Powered Smart Farming Intelligence Platform",
    dashboard: "Dashboard",
    predict: "Predict Crop",
    disease: "Disease Scanner",
    advisor: "AI Advisor",
    logout: "Logout",
    login: "Login",
    register: "Register",
    total_predictions: "Total Predictions",
    active_farms: "Active Farms",
    average_ph: "Average pH",
    weather_score: "Weather Score",
    farm_score: "Farm Health Score",
    recommended_crops: "Recommended Crops",
    yield_projections: "Yield Forecast",
    profit_forecast: "Profit Forecast",
    disease_alerts: "Disease Alerts",
    run_predictor: "Analyze Farm",
    leaf_scan: "Scan Leaf",
    nitrogen: "Nitrogen",
    phosphorus: "Phosphorus",
    potassium: "Potassium",
    ph: "Soil pH",
    state: "State",
    district: "District",
    season: "Sowing Season",
    calculate: "Execute AI Recommendation",
    chatbot: "AI Chatbot",
    q1: "Which crop should I grow?",
    q2: "How much fertilizer do I need?",
    q3: "Will rain affect my crop?",
    q4: "How can I increase yield?",
    q5: "How can I prevent disease?",
    chatbot_placeholder: "Ask me anything about farming..."
  },
  hi: {
    brand: "एग्रोमाइंड AI",
    tagline: "एआई-संचालित स्मार्ट खेती सूचना प्रणाली",
    dashboard: "डैशबोर्ड",
    predict: "फसल भविष्यवाणी",
    disease: "रोग स्कैनर",
    advisor: "एआई सलाहकार",
    logout: "लॉगआउट",
    login: "लॉगिन",
    register: "पंजीकरण",
    total_predictions: "कुल भविष्यवाणियां",
    active_farms: "सक्रिय खेत",
    average_ph: "औसत पीएच",
    weather_score: "मौसम स्कोर",
    farm_score: "खेत स्वास्थ्य स्कोर",
    recommended_crops: "अनुशंसित फसलें",
    yield_projections: "पैदावार पूर्वानुमान",
    profit_forecast: "लाभ पूर्वानुमान",
    disease_alerts: "रोग चेतावनी",
    run_predictor: "खेत विश्लेषण करें",
    leaf_scan: "पत्ती स्कैन करें",
    nitrogen: "नाइट्रोजन",
    phosphorus: "फास्फोरस",
    potassium: "पोटेशियम",
    ph: "मिट्टी पीएच",
    state: "राज्य",
    district: "जिला",
    season: "बोने का मौसम",
    calculate: "एआई अनुशंसा चलाएं",
    chatbot: "एआई चैटबॉट",
    q1: "मुझे कौन सी फसल उगानी चाहिए?",
    q2: "मुझे कितने उर्वरक की आवश्यकता है?",
    q3: "क्या बारिश मेरी फसल को प्रभावित करेगी?",
    q4: "मैं पैदावार कैसे बढ़ा सकता हूँ?",
    q5: "मैं बीमारी को कैसे रोक सकता हूँ?",
    chatbot_placeholder: "मुझसे खेती के बारे में कुछ भी पूछें..."
  },
  mr: {
    brand: "एग्रोमाइंड AI",
    tagline: "एआय-संचलित स्मार्ट शेती माहिती प्रणाली",
    dashboard: "डॅशबोर्ड",
    predict: "पीक अंदाज",
    disease: "रोग स्कॅनर",
    advisor: "एआय सल्लागार",
    logout: "लॉगआउट",
    login: "लॉगिन",
    register: "नोंदणी",
    total_predictions: "एकूण अंदाज",
    active_farms: "सक्रिय शेत",
    average_ph: "औसत पीएच",
    weather_score: "हवामान स्कोर",
    farm_score: "शेत आरोग्य स्कोर",
    recommended_crops: "शिफारस केलेली पिके",
    yield_projections: "उत्पादन अंदाज",
    profit_forecast: "नफा अंदाज",
    disease_alerts: "रोग सतर्कता",
    run_predictor: "शेत विश्लेषण करा",
    leaf_scan: "पान स्कॅन करा",
    nitrogen: "नायट्रोजन",
    phosphorus: "फॉस्फरस",
    potassium: "पोटॅशियम",
    ph: "माती पीएच",
    state: "राज्य",
    district: "जिल्हा",
    season: "पेरणीचा हंगाम",
    calculate: "एआय सल्ला मिळवा",
    chatbot: "एआय चॅटबॉट",
    q1: "मी कोणते पीक घेतले पाहिजे?",
    q2: "मला किती खताची गरज आहे?",
    q3: "पावसामुळे माझ्या पिकावर परिणाम होईल का?",
    q4: "मी पिकाचे उत्पादन कसे वाढवू शकतो?",
    q5: "मी रोगास कशा प्रकारे रोखू शकतो?",
    chatbot_placeholder: "मला शेतीबद्दल काहीही विचारा..."
  }
};

export const TranslationProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('av_locale');
    if (saved && ['en', 'hi', 'mr'].includes(saved)) {
      setLocale(saved);
    }
  }, []);

  const changeLocale = (loc) => {
    setLocale(loc);
    localStorage.setItem('av_locale', loc);
  };

  const t = (key) => {
    return translations[locale]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
export default TranslationContext;
