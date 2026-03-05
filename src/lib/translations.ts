import { Locale } from '../i18n';
// Import translation files
import zhCN from '../../messages/zh-CN.json';
import zhTW from '../../messages/zh-TW.json';
import ja from '../../messages/ja.json';
import en from '../../messages/en.json';

// 简单的翻译函数
export async function getTranslations(locale: Locale) {
  const translations = {
    'zh-CN': () => import('../../messages/zh-CN.json'),
    'zh-TW': () => import('../../messages/zh-TW.json'),
    'ja': () => import('../../messages/ja.json'),
    'en': () => import('../../messages/en.json'),
  };

  return translations[locale]();
}

// 同步版本，用于服务端组件
export function getTranslationsSync(locale: Locale) {
  const translations = {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'ja': ja,
    'en': en,
  };

  return translations[locale];
}

// 获取嵌套翻译的辅助函数
export function getNestedTranslation(translations: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce((obj: unknown, k: string) => {
    if (obj && typeof obj === 'object' && k in obj) {
      return (obj as Record<string, unknown>)[k];
    }
    return undefined;
  }, translations);
}
