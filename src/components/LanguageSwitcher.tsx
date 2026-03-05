"use client";
import { useState, useEffect } from 'react';
import { locales, localeNames } from '../i18n';
import { useRouter, usePathname } from 'next/navigation';

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // 确保组件只在客户端渲染，避免水合错误
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    // 替换路径中的 locale 部分
    const restPath = pathname.replace(/^\/(zh-CN|zh-TW|ja|en)/, '');
    const newPath = `/${nextLocale}${restPath === '' ? '/' : restPath}`.replace(/\/\//g, '/');
    router.push(newPath);
  };

  // 在服务器端渲染时显示简化版本
  if (!isClient) {
    return (
      <select
        defaultValue={locale}
        className="language-selector"
        aria-label="Select language"
        suppressHydrationWarning
      >
        {locales.map((l) => (
          <option key={l} value={l}>{localeNames[l]}</option>
        ))}
      </select>
    );
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="language-selector"
      aria-label="Select language"
    >
      {locales.map((l) => (
        <option key={l} value={l}>{localeNames[l]}</option>
      ))}
    </select>
  );
}
