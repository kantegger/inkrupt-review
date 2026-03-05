import { readFileSync } from 'fs';
import path from 'path';
import { Locale } from '../i18n';

export function getMessages(locale: Locale): Record<string, string> {
  try {
    const messagesPath = path.join(process.cwd(), 'messages', `${locale}.json`);
    const messages = JSON.parse(readFileSync(messagesPath, 'utf8'));
    return messages;
  } catch (error) {
    console.warn(`Failed to load messages for locale ${locale}:`, error);
    return {};
  }
}

export function t(messages: Record<string, string>, key: string, fallback?: string): string {
  return messages[key] || fallback || key;
}
