const translations: Record<string, Record<string, string>> = {
  en: {
    'app.title': 'Plant Disease Identification',
    'app.tagline': 'AI-Powered Diagnosis',
    'auth.login': 'Sign in',
    'auth.logout': 'Sign out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'predict.upload': 'Upload leaf image',
    'predict.analyzing': 'Analyzing...',
    'predict.result': 'Result',
    'predict.confidence': 'Confidence',
    'predict.severity': 'Severity',
    'predict.remedies': 'Remedies',
    'dashboard.history': 'Prediction History',
    'dashboard.noHistory': 'No predictions yet.',
    'dashboard.downloadReport': 'Download PDF Report',
    'admin.analytics': 'Analytics',
    'admin.totalPredictions': 'Total Predictions',
    'admin.uniqueUsers': 'Unique Users',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
  },
  hi: {
    'app.title': 'पौधे की बीमारी पहचान',
    'app.tagline': 'AI-संचालित निदान',
    'auth.login': 'साइन इन',
    'auth.logout': 'साइन आउट',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'predict.upload': 'पत्ते की तस्वीर अपलोड करें',
    'predict.analyzing': 'विश्लेषण हो रहा है...',
    'predict.result': 'परिणाम',
    'predict.confidence': 'विश्वास',
    'predict.severity': 'गंभीरता',
    'predict.remedies': 'उपचार',
    'dashboard.history': 'पूर्वानुमान इतिहास',
    'dashboard.noHistory': 'अभी तक कोई पूर्वानुमान नहीं।',
    'dashboard.downloadReport': 'PDF रिपोर्ट डाउनलोड करें',
    'admin.analytics': 'विश्लेषण',
    'admin.totalPredictions': 'कुल पूर्वानुमान',
    'admin.uniqueUsers': 'अद्वितीय उपयोगकर्ता',
    'theme.light': 'हल्का',
    'theme.dark': 'गहरा',
  },
};

export type Locale = 'en' | 'hi';

export function t(key: string, locale: Locale = 'en'): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}
