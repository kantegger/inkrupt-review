'use client';

import { useState, useLayoutEffect } from 'react';
import { Locale } from '../i18n';
import { getTranslationsSync } from '../lib/translations';

export default function RatingToggle({ locale }: { locale: Locale }) {
  const [showRatings, setShowRatings] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const translations = getTranslationsSync(locale);
  const t = (key: string) => {
    const keys = key.split('.');
    let value: unknown = translations;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return (value as string) || key;
  };

  useLayoutEffect(() => {
    // 从 localStorage 读取设置，默认为 false（关闭）
    const savedSetting = localStorage.getItem('showRatings');
    const shouldShow = savedSetting === 'true';
    setShowRatings(shouldShow);
    
    // 设置全局 CSS 变量来控制评分显示
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty('--show-ratings', shouldShow ? 'block' : 'none');
    }
    
    setMounted(true);
  }, []);

  const toggleRatings = () => {
    const newShowRatings = !showRatings;
    setShowRatings(newShowRatings);
    document.documentElement.style.setProperty('--show-ratings', newShowRatings ? 'block' : 'none');
    localStorage.setItem('showRatings', newShowRatings.toString());
  };

  // 防止水合不匹配，在组件完全挂载前不显示
  if (!mounted) {
    return (
      <div className="rating-toggle" style={{ opacity: 0, pointerEvents: 'none' }}>
        <span className="toggle-label">{t('rating.toggle')}</span>
        <div className="toggle-switch">
          <div className="toggle-slider"></div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleRatings}
      className="rating-toggle"
      aria-label={showRatings ? t('rating.hide') : t('rating.show')}
      title={showRatings ? t('rating.hide') : t('rating.show')}
    >
      <span className="toggle-label">{t('rating.toggle')}</span>
      <div className={`toggle-switch ${showRatings ? 'active' : ''}`}>
        <div className="toggle-slider"></div>
      </div>
    </button>
  );
}
