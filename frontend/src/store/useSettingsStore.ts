'use client';

import { create } from 'zustand';

// ── Types ──────────────────────────────────────────
export type Theme = 'dark' | 'light';
export type FontSize = 'sm' | 'md' | 'lg';
export type Language = 'en' | 'ta' | 'hi' | 'fr' | 'de' | 'ja' | 'zh';

export const LANGUAGES = [
  { code: 'en' as Language, label: 'English',  nativeLabel: 'English',    flag: '🇬🇧' },
  { code: 'ta' as Language, label: 'Tamil',    nativeLabel: 'தமிழ்',      flag: '🇮🇳' },
  { code: 'hi' as Language, label: 'Hindi',    nativeLabel: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'fr' as Language, label: 'French',   nativeLabel: 'Français',   flag: '🇫🇷' },
  { code: 'de' as Language, label: 'German',   nativeLabel: 'Deutsch',    flag: '🇩🇪' },
  { code: 'ja' as Language, label: 'Japanese', nativeLabel: '日本語',      flag: '🇯🇵' },
  { code: 'zh' as Language, label: 'Chinese',  nativeLabel: '中文',        flag: '🇨🇳' },
];

export const FONT_SIZES = [
  { code: 'sm' as FontSize, label: 'Small',  px: '12px' },
  { code: 'md' as FontSize, label: 'Medium', px: '14px' },
  { code: 'lg' as FontSize, label: 'Large',  px: '16px' },
];

// ── Translations ────────────────────────────────────
export const translations: Record<Language, Record<string, string>> = {
  en: { dashboard: 'Dashboard', search: 'Search...', notifications: 'Notifications', settings: 'Settings', logout: 'Logout', profile: 'Profile', tasks: 'Tasks', documents: 'Documents', chat: 'Chat', call: 'Call', theme: 'Theme', language: 'Language', fontSize: 'Font Size' },
  ta: { dashboard: 'டாஷ்போர்டு', search: 'தேடவும்...', notifications: 'அறிவிப்புகள்', settings: 'அமைப்புகள்', logout: 'வெளியேறு', profile: 'சுயவிவரம்', tasks: 'பணிகள்', documents: 'ஆவணங்கள்', chat: 'அரட்டை', call: 'அழைப்பு', theme: 'தீம்', language: 'மொழி', fontSize: 'எழுத்து அளவு' },
  hi: { dashboard: 'डैशबोर्ड', search: 'खोजें...', notifications: 'सूचनाएं', settings: 'सेटिंग्स', logout: 'लॉग आउट', profile: 'प्रोफ़ाइल', tasks: 'कार्य', documents: 'दस्तावेज़', chat: 'चैट', call: 'कॉल', theme: 'थीम', language: 'भाषा', fontSize: 'फ़ॉन्ट साइज़' },
  fr: { dashboard: 'Tableau de bord', search: 'Rechercher...', notifications: 'Notifications', settings: 'Paramètres', logout: 'Déconnexion', profile: 'Profil', tasks: 'Tâches', documents: 'Documents', chat: 'Discussion', call: 'Appel', theme: 'Thème', language: 'Langue', fontSize: 'Taille de Police' },
  de: { dashboard: 'Dashboard', search: 'Suchen...', notifications: 'Benachrichtigungen', settings: 'Einstellungen', logout: 'Abmelden', profile: 'Profil', tasks: 'Aufgaben', documents: 'Dokumente', chat: 'Chat', call: 'Anruf', theme: 'Thema', language: 'Sprache', fontSize: 'Schriftgröße' },
  ja: { dashboard: 'ダッシュボード', search: '検索...', notifications: '通知', settings: '設定', logout: 'ログアウト', profile: 'プロフィール', tasks: 'タスク', documents: '文書', chat: 'チャット', call: '通話', theme: 'テーマ', language: '言語', fontSize: 'フォントサイズ' },
  zh: { dashboard: '仪表板', search: '搜索...', notifications: '通知', settings: '设置', logout: '登出', profile: '个人资料', tasks: '任务', documents: '文档', chat: '聊天', call: '通话', theme: '主题', language: '语言', fontSize: '字体大小' },
};

// ── Helper: safe localStorage ───────────────────────
const get = (key: string) => {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch { return null; }
};
const set = (key: string, val: string) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, val); } catch {}
};

// ── Store ───────────────────────────────────────────
interface SettingsState {
  theme: Theme;
  fontSize: FontSize;
  language: Language;
  setTheme: (theme: Theme) => void;
  setFontSize: (fontSize: FontSize) => void;
  setLanguage: (language: Language) => void;
  hydrate: () => void;
  t: (key: string) => string;
}

export const useSettingsStore = create<SettingsState>((setState, getState) => ({
  theme: 'dark',
  fontSize: 'md',
  language: 'en',

  hydrate: () => {
    const theme = (get('dtms-theme') as Theme) || 'dark';
    const fontSize = (get('dtms-fontsize') as FontSize) || 'md';
    const language = (get('dtms-language') as Language) || 'en';
    setState({ theme, fontSize, language });
    
    // Apply to DOM
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }
    const sizes = { sm: '12px', md: '14px', lg: '16px' };
    root.style.setProperty('--base-font-size', sizes[fontSize]);
  },

  setTheme: (theme) => {
    set('dtms-theme', theme);
    setState({ theme });
    // Apply immediately to DOM
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.remove('light-theme');
      root.classList.add('dark-theme');
    }
  },

  setFontSize: (fontSize) => {
    set('dtms-fontsize', fontSize);
    setState({ fontSize });
    const sizes = { sm: '12px', md: '14px', lg: '16px' };
    document.documentElement.style.setProperty('--base-font-size', sizes[fontSize]);
  },

  setLanguage: (language) => {
    set('dtms-language', language);
    setState({ language });
  },

  t: (key: string) => {
    const lang = getState().language;
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  },
}));
