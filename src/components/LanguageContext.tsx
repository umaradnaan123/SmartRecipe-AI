'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode =
  | 'en' | 'te' | 'hi' | 'ur' | 'ta' | 'kn' | 'ml' | 'bn' | 'mr' | 'gu'
  | 'pa' | 'or' | 'as' | 'sa' | 'es' | 'fr' | 'de' | 'pt' | 'ar' | 'ja';

interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  speechLocale: string;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', speechLocale: 'en-US' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr', speechLocale: 'te-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', speechLocale: 'hi-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', speechLocale: 'ur-PK' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', speechLocale: 'ta-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr', speechLocale: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr', speechLocale: 'ml-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', speechLocale: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr', speechLocale: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr', speechLocale: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr', speechLocale: 'pa-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', dir: 'ltr', speechLocale: 'or-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', dir: 'ltr', speechLocale: 'as-IN' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृत', dir: 'ltr', speechLocale: 'sa-IN' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', speechLocale: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', speechLocale: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr', speechLocale: 'de-DE' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr', speechLocale: 'pt-PT' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', speechLocale: 'ar-SA' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', speechLocale: 'ja-JP' },
];

const TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  appName: {
    en: 'Smart Recommender', te: 'స్మార్ట్ సిఫార్సుదారు', hi: 'स्मार्ट अनुशंसाकर्ता', ur: 'اسمارٹ ریکو مینڈر',
    ta: 'స్మార్ట్ రెகமండர்', kn: 'స్మార్ట్ శిఫారసుಗಾರ', ml: 'స్మార్ട്ട് റെക്കമെൻഡർ', bn: 'স্মার্ট সুপারিশকারী',
    mr: 'स्मार्ट शिफारसकर्ता', gu: 'સ્માર્ટ ભલાमણકાર', pa: 'ਸਮਾਰਟ ਸਿਫਾਰਸ਼ਕਰਤਾ', or: 'ସ୍ମାର୍ଟ ସୁପାରିଶକାରୀ',
    as: 'স্মাৰ্ট পৰামৰ্শদাতা', sa: 'स्मार्ट अनुशंसक', es: 'Recomendador Inteligente', fr: 'Recommandeur Intelligent',
    de: 'Intelligenter Empfehler', pt: 'Recomendador Inteligente', ar: 'الموصي الذكي', ja: 'スマートレコメンダー'
  },
  home: {
    en: 'Home', te: 'హోమ్', hi: 'होम', ur: 'ہوم', ta: 'முகப்பு', kn: 'ಹోಮ್', ml: 'ഹോം', bn: 'হোম',
    mr: 'होम', gu: 'હોમ', pa: 'ਹੋਮ', or: 'ହୋମ', as: 'হোম', sa: 'गृहम्', es: 'Inicio', fr: 'Accueil',
    de: 'Startseite', pt: 'Início', ar: 'الرئيسية', ja: 'ホーム'
  },
  generateSmartRecipes: {
    en: 'Generate Smart Recipes', te: 'స్మార్ట్ వంటకాలను సృష్టించండి', hi: 'स्मार्ट रेसिपी उत्पन्न करें', ur: 'اسمارٹ ریسیپیز بنائیں',
    ta: 'స్మార్ట్ రెసిபிகளை உருவாக்கு', kn: 'స్మార్ట్ పాಕವಿಧಾನಗಳನ್ನು ರಚಿಸಿ', ml: 'സ്మార్ട്ട് പാചകക്കുറിപ്പുകൾ ഉണ്ടാക്കുക', bn: 'স্মার্ট রেসিپی তৈরি করুন',
    mr: 'स्मार्ट रेसिपी तयार करा', gu: 'સ્માર્ટ વાનગીઓ બનાવો', pa: 'ਸਮਾਰਟ ਰੈਸਿਪੀ ਬਣਾਓ', or: 'ସ୍ମାର୍ଟ ରେସିପି ପ୍ରସ୍ତୁତ କରନ୍ତុ',
    as: 'স্মাৰ্ট ৰেচিপি প্ৰস্তুত কৰক', sa: 'स्मार्ट व्यञ्जनानि जनयन्तु', es: 'Generar Recetas Inteligentes', fr: 'Générer des Recettes Intelligentes',
    de: 'Intelligente Rezepte generieren', pt: 'Gerar Receitas Inteligentes', ar: 'إنشاء وصفات ذكية', ja: 'スマートレシピを生成'
  },
  scanning: {
    en: 'Scanning Image...', te: 'చిత్రాన్ని స్కాన్ చేస్తోంది...', hi: 'छवि स्कैन की जा रही है...', ur: 'تصویر اسکین ہو رہی ہے...',
    ta: '画像をスキャン中...', kn: 'ಚಿತ್ರವನ್ನು స్కాన్ చేయబడుతోంది...', ml: 'ചിത്രം സ്കാൻ ചെയ്യുന്നു...', bn: 'ছবি স্ক্যান করা হচ্ছে...',
    mr: 'चित्र स्कॅन करत आहे...', gu: 'છબી સ્કેન થઈ રહી છે...', pa: 'ਤਸਵੀਰ ਸਕੈਨ ਹੋ ਰਹੀ ਹੈ...', or: 'ଛବି ସ୍କାନ ହେଉଛି...',
    as: 'ছবি স্কেন হৈ আছে...', sa: 'चित्रं स्कैन क्रियते...', es: 'Escaneando Imagen...', fr: 'Numérisation de l\'Image...',
    de: 'Bild wird gescannt...', pt: 'Escaneando Imagem...', ar: 'جاري فحص الصورة...', ja: '画像をスキャン中...'
  },
  availableIngredients: {
    en: 'Available Ingredients', te: 'అందుబాటులో ఉన్న పదార్థాలు', hi: 'उपलब्ध सामग्री', ur: 'دستیاب اجزاء',
    ta: 'கிடைக்கக்கூடிய பொருட்கள்', kn: 'ಲಭ್ಯವಿರುವ ಪದಾರ್ಥಗಳು', ml: 'ലഭ്യമായ ചേരുവകൾ', bn: 'উপলব্ধ উপাদান',
    mr: 'उपलब्ध साहित्य', gu: 'ઉપલબ્ધ સામગ્રી', pa: 'ਉਪਲਬਧ ਸਮੱਗਰੀ', or: 'ଉପଲବ୍ଧ ସାମଗ୍ରୀ',
    as: 'উপলব্ধ উপাদানসমূহ', sa: 'उपलब्ध सामग्री', es: 'Ingredientes Disponibles', fr: 'Ingrédients Disponibles',
    de: 'Verfügbare Zutaten', pt: 'Ingredientes Disponíveis', ar: 'المكونات المتاحة', ja: '利用可能な食材'
  },
  additionalRequired: {
    en: 'Additional Required', te: 'అదనంగా అవసరమైనవి', hi: 'अतिरिक्त आवश्यक', ur: 'اضافی مطلوبہ اجزاء',
    ta: 'கூடுதல் தேவை', kn: 'ಹೆಚ್ಚುವರಿ ಅಗತ್ಯವಿದೆ', ml: 'കൂടുതലായി വേണ്ടവ', bn: 'অতিরিক্ত প্রয়োজনীয়',
    mr: 'अतिरिक्त आवश्यक', gu: 'વધારાની જરૂરિયાત', pa: 'ਵਾਧੂ ਲੋੜੀਂਦਾ', or: 'ଅତିରିକ୍ତ ଆବଶ୍ୟକ',
    as: 'বৰ্ধিত প্ৰয়োজনীয়', sa: 'अतिरिक्त आवश्यकम्', es: 'Ingredientes Adicionales', fr: 'Ingrédients Supplémentaires',
    de: 'Zusätzlich benötigt', pt: 'Adicionais Necessários', ar: 'مكونات إضافية مطلوبة', ja: '他に必要な食材'
  },
  cookInstructions: {
    en: 'Cooking Instructions', te: 'వంట సూచనలు', hi: 'पकाने के निर्देश', ur: 'پکانے کی ہدایات',
    ta: 'சமையல் வழிமுறைகள்', kn: 'ಅಡುಗೆ ಸೂಚನೆಗಳು', ml: 'പാചക നിർദ്ദേശങ്ങൾ', bn: 'রান্নার নির্দেশাবলী',
    mr: 'स्वयंपाकाच्या सूचना', gu: 'રસોઈની સૂચનાઓ', pa: 'ਪਕਾਉਣ ਦੀਆਂ ਹਦਾਇਤਾਂ', or: 'ରନ୍ଧା ନିର୍ଦ୍ଦେଶାବଳী',
    as: 'ৰন্ধন প্ৰণালী', sa: 'पाकनिर्देशाः', es: 'Instrucciones de Cocina', fr: 'Instructions de Cuisine',
    de: 'Kochanleitungen', pt: 'Instruções de Cozinha', ar: 'تعليمات الطبخ', ja: '調理手順'
  },
  moreVideos: {
    en: 'More Recipe Videos', te: 'మరిన్ని వంట వీడియోలు', hi: 'अधिक रेसिपी वीडियो', ur: 'مزید ریسیپی ویڈیوز',
    ta: 'கூடுதல் ரெசிபி வீடியோக்கள்', kn: 'ಹೆಚ್ಚಿನ ಪಾಕವಿಧಾನ ವೀಡಿಯೊಗಳು', ml: 'കൂടുതൽ പാചക വീഡിയോകൾ', bn: 'আরও রেসিপি ভিডিও',
    mr: 'अधिक रेसिपी व्हिडिओ', gu: 'વધુ રેસીપી વિડિઓઝ', pa: 'ਹੋਰ ਰੈਸਿਪੀ ਵੀਡੀਓ', or: 'ଅଧିକ ରେସિପિ ଭିଡିଓ',
    as: 'অধিক ৰেচিপি ভিডিঅ’', sa: 'अतिरिक्ताः पाक-चित्रपटमुद्रिकाः', es: 'Más Videos de Recetas', fr: 'Plus de Vidéos de Recettes',
    de: 'Mehr Rezeptvideos', pt: 'Mais Vídeos de Receitas', ar: 'المزيد من فيديوهات الوصفات', ja: '他のレシピ動画'
  },
  googleResources: {
    en: 'Google Resources', te: 'గూగుల్ వనరులు', hi: 'गूगल संसाधन', ur: 'گوگل وسائل',
    ta: 'கூகுள் ஆதாரங்கள்', kn: 'ಗೂಗಲ್ ಸಂಪನ್ಮೂಲಗಳು', ml: 'ഗൂഗിൾ ഉറവിടങ്ങൾ', bn: 'গুগল রিসোর্স',
    mr: 'गूगल संसाधने', gu: 'ગૂગલ સંસાધનો', pa: 'ਗੂਗਲ ਸਰੋਤ', or: 'ଗୁଗଲ୍ ସମ୍ବଳ',
    as: 'গুগল সমলসমূহ', sa: 'गूगल संसाधनानि', es: 'Recursos de Google', fr: 'Ressources Google',
    de: 'Google-Ressourcen', pt: 'Recursos do Google', ar: 'مصادر جوجل', ja: 'Googleリソース'
  },
  toastSuccess: {
    en: 'Successfully Identified!', te: 'విజయవంతంగా గుర్తించబడింది!', hi: 'सफलतापूर्वक पहचान लिया गया!', ur: 'کامیابی سے شناخت ہو گئی!',
    ta: 'வெற்றிகரமாக அடையாளம் காணப்பட்டது!', kn: 'ಯಶಸ್వಿಯಾಗಿ ಗುರುतಿಸಲಾಗಿದೆ!', ml: 'വിജയകരമായി തിരിച്ചറിഞ്ഞു!', bn: 'সফলভাবে চিহ্নিত করা হয়েছে!',
    mr: 'यशस्वीरित्या ओळखले!', gu: 'સફળતાપૂર્વક ઓળખાયેલ!', pa: 'ਸਫਲਤਾਪੂਰਵਕ ਪਛਾਣ ਕੀਤੀ ਗਈ!', or: 'ସଫଳତାର ସହ ଚିହ୍ନଟ ହେଲା!',
    as: 'সফলভাৱে চিনাক্ত কৰা হ’ল!', sa: 'सफलतापूर्वकं परिज्ञातम्!', es: '¡Identificado con Éxito!', fr: 'Identifié avec Succès !',
    de: 'Erfolgreich identifiziert!', pt: 'Identificado com Sucesso!', ar: 'تم التعرف بنجاح!', ja: '識別成功！'
  },
  ttsSpeak: {
    en: 'Listen to Recipe', te: 'వంటకాన్ని వినండి', hi: 'रेसिपी सुनें', ur: 'ریسیپی سنیں',
    ta: 'ரெசிபியைக் கேளுங்கள்', kn: 'ಪಾಕವಿಧಾನವನ್ನು ಕೇಳಿ', ml: 'പാചകക്കുറിപ്പ് കേൾക്കുക', bn: 'রেসিপি শুনুন',
    mr: 'रेसिपी ऐका', gu: 'રેસીપી સાંભળો', pa: 'ਰੈਸਿਪੀ ਸੁਣੋ', or: 'ରେସିପି ଶୁଣନ୍ତୁ',
    as: 'ৰেচিপি শুনক', sa: 'व्यञ्जनं शृणोतु', es: 'Escuchar Receta', fr: 'Écouter la Recette',
    de: 'Rezept anhören', pt: 'Ouvir Receita', ar: 'استمع إلى الوصفة', ja: 'レシピを聞く'
  },
  sttSpeak: {
    en: 'Voice Command', te: 'వాయిస్ కమాండ్', hi: 'आवाज कमान', ur: 'وائస کمانڈ',
    ta: 'குரல் கட்டளை', kn: 'ಧ್ವನಿ ಆಜ್ಞೆ', ml: 'ശബ്ദ നിർദ്ദേശം', bn: 'ভয়েস কমান্ড',
    mr: 'व्हॉइस कमांड', gu: 'વોઇસ કમાન્ડ', pa: 'ਆਵਾਜ਼ ਕਮਾਂਡ', or: 'ସ୍ୱର ନିର୍ද୍දେଶ',
    as: 'কণ্ঠস্বৰ নিৰ্দেশ', sa: 'वाणी-आदेशः', es: 'Comando de Voz', fr: 'Commande Vocale',
    de: 'Sprachbefehl', pt: 'Comando de Voz', ar: 'أمر صوتي', ja: '音声コマンド'
  }
};

interface LanguageContextProps {
  currentLang: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  isRtl: boolean;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  startVoiceListening: (onResult: (text: string) => void) => void;
  isListening: boolean;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLang, setCurrentLangState] = useState<LanguageCode>('en');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app-language') as LanguageCode;
    if (saved && LANGUAGES.some(l => l.code === saved)) {
      setCurrentLangState(saved);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLangState(lang);
    localStorage.setItem('app-language', lang);
  };

  const currentConfig = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  const isRtl = currentConfig.dir === 'rtl';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = currentConfig.dir;
      document.documentElement.lang = currentLang;
    }
  }, [currentConfig, currentLang]);

  const t = (key: string): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[currentLang] || entry['en'] || key;
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentConfig.speechLocale;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  };

  // Speech to Text (Speech Recognition)
  const startVoiceListening = (onResult: (resultText: string) => void) => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Chrome.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = currentConfig.speechLocale;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    rec.onresult = (e: any) => {
      const textResult = e.results[0][0].transcript;
      onResult(textResult);
    };

    rec.start();
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        setLanguage,
        t,
        isRtl,
        speakText,
        stopSpeaking,
        startVoiceListening,
        isListening
      }}
    >
      <div dir={currentConfig.dir}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
