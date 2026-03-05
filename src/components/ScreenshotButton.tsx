'use client';

import React, { useState, useEffect } from 'react';
import { Locale } from '../i18n';
import { getTranslationsSync, getNestedTranslation } from '../lib/translations';

interface ScreenshotButtonProps {
  locale: Locale;
  reviewSlug: string;
  reviewTitle: string;
}

export default function ScreenshotButton({ locale, reviewSlug, reviewTitle }: ScreenshotButtonProps) {
  const [isClient, setIsClient] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownload = async () => {
    if (!isClient || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      // 构建截图文件路径（统一高清版本）
      const screenshotUrl = `/screenshots/${locale}/${reviewSlug}.png`;
      
      // 检查文件是否存在
      const response = await fetch(screenshotUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error('Screenshot not found');
      }
      
      // 触发下载
      const link = document.createElement('a');
      link.href = screenshotUrl;
      link.download = `${reviewTitle}-inkrupt.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Screenshot downloaded successfully');
      
    } catch (error) {
      console.error('Failed to download screenshot:', error);
      
      // 获取翻译
      const t = getTranslationsSync(locale);
      const errorMsg = getNestedTranslation(t, 'screenshot.error') as string || 'Screenshot download failed';
      
      // 提供友好的错误信息
      let fallbackMessage = '';
      switch (locale) {
        case 'zh-CN':
          fallbackMessage = '\n\n建议：\n1. 刷新页面重试\n2. 使用浏览器的截图功能\n3. 或联系站点管理员';
          break;
        case 'zh-TW':
          fallbackMessage = '\n\n建議：\n1. 重新整理頁面重試\n2. 使用瀏覽器的截圖功能\n3. 或聯絡網站管理員';
          break;
        case 'ja':
          fallbackMessage = '\n\n提案：\n1. ページを更新して再試行\n2. ブラウザのスクリーンショット機能を使用\n3. またはサイト管理者にお問い合わせください';
          break;
        default:
          fallbackMessage = '\n\nSuggestions:\n1. Refresh page and try again\n2. Use browser screenshot feature\n3. Or contact site administrator';
      }
      
      alert(`${errorMsg}${fallbackMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const getButtonText = () => {
    const texts = {
      'en': 'Download Screenshot',
      'ja': 'スクリーンショットをダウンロード',
      'zh-CN': '下载截图',
      'zh-TW': '下載截圖'
    };
    return texts[locale];
  };

  const getAriaLabel = () => {
    const texts = {
      'en': 'Download screenshot of this book review',
      'ja': 'この書評のスクリーンショットをダウンロード',
      'zh-CN': '下载此书评的截图',
      'zh-TW': '下載此書評的截圖'
    };
    return texts[locale];
  };

  // 服务器端渲染时显示静态版本
  if (!isClient) {
    return (
      <button 
        className="action-button screenshot-button" 
        disabled
        suppressHydrationWarning
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      </button>
    );
  }

  return (
    <button 
      onClick={handleDownload}
      className="action-button screenshot-button"
      aria-label={getAriaLabel()}
      title={getButtonText()}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 3l-6 6 2 2 6-6-2-2zM14 3v4c0 1.1.9 2 2 2h4"/>
          <path d="M2 19.5V4.5c0-.3.2-.5.5-.5H8v4c0 1.1.9 2 2 2h4v9.5c0 .3-.2.5-.5.5h-11c-.3 0-.5-.2-.5-.5z"/>
          <path d="M9 15l3-3 3 3M12 12v7"/>
        </svg>
      )}
    </button>
  );
}