'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

const TranslationContext = createContext({});

const translations = {
  "en": {
    "brand": "Agrovision AI",
    "tagline": "AI-Powered Smart Farming Intelligence Platform",
    "dashboard": "Dashboard",
    "predict": "Predict Crop",
    "disease": "Disease Scanner",
    "advisor": "AI Advisor",
    "logout": "Logout",
    "login": "Login",
    "register": "Register",
    "total_predictions": "Total Predictions",
    "active_farms": "Active Farms",
    "average_ph": "Average pH",
    "weather_score": "Weather Score",
    "farm_score": "Farm Health Score",
    "recommended_crops": "Recommended Crops",
    "yield_projections": "Yield Forecast",
    "profit_forecast": "Profit Forecast",
    "disease_alerts": "Disease Alerts",
    "run_predictor": "Analyze Farm",
    "leaf_scan": "Scan Leaf",
    "nitrogen": "Nitrogen",
    "phosphorus": "Phosphorus",
    "potassium": "Potassium",
    "ph": "Soil pH",
    "state": "State",
    "district": "District",
    "season": "Sowing Season",
    "calculate": "Execute AI Recommendation",
    "chatbot": "AI Chatbot",
    "q1": "Which crop should I grow?",
    "q2": "How much fertilizer do I need?",
    "q3": "Will rain affect my crop?",
    "q4": "How can I increase yield?",
    "q5": "How can I prevent disease?",
    "chatbot_placeholder": "Ask me anything about farming..."
  },
  "hi": {
    "brand": "एग्रोविजन AI",
    "tagline": "एआई-संचालित स्मार्ट खेती सूचना प्रणाली",
    "dashboard": "डैशबोर्ड",
    "predict": "फसल भविष्यवाणी",
    "disease": "रोग स्कैनर",
    "advisor": "एआई सलाहकार",
    "logout": "लॉगआउट",
    "login": "लॉगिन",
    "register": "पंजीकरण",
    "total_predictions": "कुल भविष्यवाणियां",
    "active_farms": "सक्रिय खेत",
    "average_ph": "औसत पीएच",
    "weather_score": "मौसम स्कोर",
    "farm_score": "खेत स्वास्थ्य स्कोर",
    "recommended_crops": "अनुशंसित फसलें",
    "yield_projections": "पैदावार पूर्वानुमान",
    "profit_forecast": "लाभ पूर्वानुमान",
    "disease_alerts": "रोग चेतावनी",
    "run_predictor": "खेत विश्लेषण करें",
    "leaf_scan": "पत्ती स्कैन करें",
    "nitrogen": "नाइट्रोजन",
    "phosphorus": "फास्फोरस",
    "potassium": "पोटेशियम",
    "ph": "मिट्टी पीएच",
    "state": "राज्य",
    "district": "जिला",
    "season": "बोने का मौसम",
    "calculate": "एआई अनुशंसा चलाएं",
    "chatbot": "एआई चैटबॉट",
    "q1": "मुझे कौन सी फसल उगानी चाहिए?",
    "q2": "मुझे कितने उर्वरक की आवश्यकता है?",
    "q3": "क्या बारिश मेरी फसल को प्रभावित करेगी?",
    "q4": "मैं पैदावार कैसे बढ़ा सकता हूँ?",
    "q5": "मैं बीमारी को कैसे रोक सकता हूँ?",
    "chatbot_placeholder": "मुझसे खेती के बारे में कुछ भी पूछें..."
  },
  "mr": {
    "brand": "एग्रोविजन AI",
    "tagline": "एआय-संचलित स्मार्ट शेती माहिती प्रणाली",
    "dashboard": "डॅशबोर्ड",
    "predict": "पीक अंदाज",
    "disease": "रोग स्कॅनर",
    "advisor": "एआय सल्लागार",
    "logout": "लॉगआउट",
    "login": "लॉगिन",
    "register": "नोंदणी",
    "total_predictions": "एकूण अंदाज",
    "active_farms": "सक्रिय शेत",
    "average_ph": "औसत पीएच",
    "weather_score": "हवामान स्कोर",
    "farm_score": "शेत आरोग्य स्कोर",
    "recommended_crops": "शिफारस केलेली पिके",
    "yield_projections": "उत्पादन अंदाज",
    "profit_forecast": "नफा अंदाज",
    "disease_alerts": "रोग सतर्कता",
    "run_predictor": "शेत विश्लेषण करा",
    "leaf_scan": "पान स्कॅन करा",
    "nitrogen": "नायट्रोजन",
    "phosphorus": "फॉस्फरस",
    "potassium": "पोटॅशियम",
    "ph": "माती पीएच",
    "state": "राज्य",
    "district": "जिल्हा",
    "season": "पेरणीचा हंगाम",
    "calculate": "एआय सल्ला मिळवा",
    "chatbot": "एआय चॅटबॉट",
    "q1": "मी कोणते पीक घेतले पाहिजे?",
    "q2": "मला किती खताची गरज आहे?",
    "q3": "पावसामुळे माझ्या पिकावर परिणाम होईल का?",
    "q4": "मी पिकाचे उत्पादन कसे वाढवू शकतो?",
    "q5": "मी रोगास कशा प्रकारे रोखू शकतो?",
    "chatbot_placeholder": "मला शेतीबद्दल काहीही विचारा..."
  },
  "kn": {
    "brand": "ಅಗ್ರೋವಿಷನ್ AI",
    "tagline": "AI-ಚಾಲಿತ ಸ್ಮಾರ್ಟ್ ಫಾರ್ಮಿಂಗ್ ಇಂಟೆಲಿಜೆನ್ಸ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್",
    "dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "predict": "ಬೆಳೆಯನ್ನು ಊಹಿಸಿ",
    "disease": "ರೋಗ ಸ್ಕ್ಯಾನರ್",
    "advisor": "AI ಸಲಹೆಗಾರ",
    "logout": "ಲಾಗ್ಔಟ್",
    "login": "ಲಾಗಿನ್ ಮಾಡಿ",
    "register": "ನೋಂದಾಯಿಸಿ",
    "total_predictions": "ಒಟ್ಟು ಭವಿಷ್ಯವಾಣಿಗಳು",
    "active_farms": "ಸಕ್ರಿಯ ಫಾರ್ಮ್ಗಳು",
    "average_ph": "ಸರಾಸರಿ pH",
    "weather_score": "ಹವಾಮಾನ ಸ್ಕೋರ್",
    "farm_score": "ಫಾರ್ಮ್ ಹೆಲ್ತ್ ಸ್ಕೋರ್",
    "recommended_crops": "ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು",
    "yield_projections": "ಇಳುವರಿ ಮುನ್ಸೂಚನೆ",
    "profit_forecast": "ಲಾಭದ ಮುನ್ಸೂಚನೆ",
    "disease_alerts": "ರೋಗ ಎಚ್ಚರಿಕೆಗಳು",
    "run_predictor": "ಫಾರ್ಮ್ ಅನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    "leaf_scan": "ಎಲೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    "nitrogen": "ಸಾರಜನಕ",
    "phosphorus": "ರಂಜಕ",
    "potassium": "ಪೊಟ್ಯಾಸಿಯಮ್",
    "ph": "ಮಣ್ಣಿನ pH",
    "state": "ರಾಜ್ಯ",
    "district": "ಜಿಲ್ಲೆ",
    "season": "ಬಿತ್ತನೆ ಸೀಸನ್",
    "calculate": "AI ಶಿಫಾರಸು ಕಾರ್ಯಗತಗೊಳಿಸಿ",
    "chatbot": "AI ಚಾಟ್‌ಬಾಟ್",
    "q1": "ನಾನು ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?",
    "q2": "ನನಗೆ ಎಷ್ಟು ಗೊಬ್ಬರ ಬೇಕು?",
    "q3": "ಮಳೆ ನನ್ನ ಬೆಳೆಗೆ ಪರಿಣಾಮ ಬೀರುವುದೇ?",
    "q4": "ನಾನು ಇಳುವರಿಯನ್ನು ಹೇಗೆ ಹೆಚ್ಚಿಸಬಹುದು?",
    "q5": "ನಾನು ರೋಗವನ್ನು ಹೇಗೆ ತಡೆಯಬಹುದು?",
    "chatbot_placeholder": "ಬೇಸಾಯದ ಬಗ್ಗೆ ಏನಾದ್ರೂ ಕೇಳಿ..."
  },
  "te": {
    "brand": "ఆగ్రోమైండ్ AI",
    "tagline": "AI-ఆధారిత స్మార్ట్ ఫార్మింగ్ ఇంటెలిజెన్స్ ప్లాట్‌ఫారమ్",
    "dashboard": "డాష్‌బోర్డ్",
    "predict": "పంటను అంచనా వేయండి",
    "disease": "వ్యాధి స్కానర్",
    "advisor": "AI సలహాదారు",
    "logout": "లాగ్అవుట్",
    "login": "లాగిన్ చేయండి",
    "register": "నమోదు చేసుకోండి",
    "total_predictions": "మొత్తం అంచనాలు",
    "active_farms": "క్రియాశీల పొలాలు",
    "average_ph": "సగటు pH",
    "weather_score": "వాతావరణ స్కోర్",
    "farm_score": "ఫార్మ్ హెల్త్ స్కోర్",
    "recommended_crops": "సిఫార్సు చేయబడిన పంటలు",
    "yield_projections": "దిగుబడి సూచన",
    "profit_forecast": "లాభాల సూచన",
    "disease_alerts": "వ్యాధి హెచ్చరికలు",
    "run_predictor": "వ్యవసాయ క్షేత్రాన్ని విశ్లేషించండి",
    "leaf_scan": "స్కాన్ లీఫ్",
    "nitrogen": "నైట్రోజన్",
    "phosphorus": "భాస్వరం",
    "potassium": "పొటాషియం",
    "ph": "నేల pH",
    "state": "రాష్ట్రం",
    "district": "జిల్లా",
    "season": "విత్తనాలు సీజన్",
    "calculate": "AI సిఫార్సును అమలు చేయండి",
    "chatbot": "AI చాట్‌బాట్",
    "q1": "నేను ఏ పంట వేయాలి?",
    "q2": "నాకు ఎంత ఎరువులు కావాలి?",
    "q3": "వర్షం నా పంటపై ప్రభావం చూపుతుందా?",
    "q4": "నేను దిగుబడిని ఎలా పెంచగలను?",
    "q5": "నేను వ్యాధిని ఎలా నివారించగలను?",
    "chatbot_placeholder": "వ్యవసాయం గురించి ఏమైనా అడగండి..."
  },
  "gu": {
    "brand": "Agrovision AI",
    "tagline": "AI-સંચાલિત સ્માર્ટ ફાર્મિંગ ઇન્ટેલિજન્સ પ્લેટફોર્મ",
    "dashboard": "ડેશબોર્ડ",
    "predict": "પાકની આગાહી કરો",
    "disease": "રોગ સ્કેનર",
    "advisor": "એઆઈ સલાહકાર",
    "logout": "લોગઆઉટ",
    "login": "લૉગિન કરો",
    "register": "નોંધણી કરો",
    "total_predictions": "કુલ અનુમાનો",
    "active_farms": "સક્રિય ખેતરો",
    "average_ph": "સરેરાશ pH",
    "weather_score": "હવામાન સ્કોર",
    "farm_score": "ફાર્મ હેલ્થ સ્કોર",
    "recommended_crops": "ભલામણ કરેલ પાક",
    "yield_projections": "ઉપજની આગાહી",
    "profit_forecast": "નફાની આગાહી",
    "disease_alerts": "રોગ ચેતવણીઓ",
    "run_predictor": "ફાર્મનું વિશ્લેષણ કરો",
    "leaf_scan": "સ્કેન લીફ",
    "nitrogen": "નાઈટ્રોજન",
    "phosphorus": "ફોસ્ફરસ",
    "potassium": "પોટેશિયમ",
    "ph": "માટી pH",
    "state": "રાજ્ય",
    "district": "જિલ્લો",
    "season": "વાવણી ઋતુ",
    "calculate": "AI ભલામણનો અમલ કરો",
    "chatbot": "AI ચેટબોટ",
    "q1": "મારે કયો પાક ઉગાડવો જોઈએ?",
    "q2": "મારે કેટલા ખાતરની જરૂર છે?",
    "q3": "શું વરસાદ મારા પાકને અસર કરશે?",
    "q4": "હું ઉપજ કેવી રીતે વધારી શકું?",
    "q5": "હું રોગને કેવી રીતે અટકાવી શકું?",
    "chatbot_placeholder": "મને ખેતી વિશે કંઈ પૂછો..."
  }
};;

export const TranslationProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('av_locale');
    if (saved && ['en', 'hi', 'mr', 'kn', 'te', 'gu'].includes(saved)) {
      setLocale(saved);
    }
  }, []);

  const changeLocale = (loc) => {
    setLocale(loc);
    localStorage.setItem('av_locale', loc);
  };

  
  const translateDynamic = async (text, targetLocale) => {
    const loc = targetLocale || locale;
    if (!text) return '';
    if (loc === 'en') return text;
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${loc}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      return data[0].map(item => item[0]).join('');
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const t = (key) => {
    return translations[locale]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale: changeLocale, t, translateDynamic }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
export default TranslationContext;
