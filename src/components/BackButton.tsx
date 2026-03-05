'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getTranslationsSync, getNestedTranslation } from '../lib/translations';
import { Locale } from '../i18n';
import ScreenshotButton from './ScreenshotButton';

interface ActionButtonsProps {
  locale: Locale;
  reviewTitle: string;
  reviewSlug: string;
}

export default function ActionButtons({ locale, reviewTitle, reviewSlug }: ActionButtonsProps) {
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 确保组件只在客户端渲染，避免水合错误
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClose = () => {
    if (!isClient) return;
    
    // 获取保存的滚动位置
    const savedPosition = sessionStorage.getItem('homeScrollPosition');
    
    if (savedPosition) {
      // 使用 replace 而不是 push，避免浏览器历史记录问题
      // 通过 hash 传递滚动位置信息，实现即时恢复
      router.replace(`/${locale}#restore-${savedPosition}`);
    } else {
      router.push(`/${locale}`);
    }
  };

  const handleShare = async () => {
    if (isSharing || !isClient) return;
    
    // 获取翻译
    const t = getTranslationsSync(locale);
    const shareT = getNestedTranslation(t, 'share') as {
      text: string;
      success: string;
      linkCopied: string;
      failed: string;
      copyFailed: string;
      manualCopy: string;
    };
    
    setIsSharing(true);
    try {
      const shareData = {
        title: `${reviewTitle} - Inkrupt`,
        text: shareT.text.replace('{title}', reviewTitle),
        url: window.location.href
      };

      // 检查是否支持 Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        console.log(shareT.success);
      } else {
        // 降级到复制链接
        await navigator.clipboard.writeText(window.location.href);
        alert(shareT.linkCopied);
      }
    } catch (error) {
      console.error(shareT.failed, error);
      // 如果分享失败，尝试复制链接
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert(shareT.linkCopied);
      } catch (clipboardError) {
        console.error(shareT.copyFailed, clipboardError);
        alert(shareT.manualCopy);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // 在服务器端渲染时显示简化版本
  if (!isClient) {
    return (
      <div className="action-buttons" suppressHydrationWarning>
        <button className="action-button share-button" disabled>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
        <ScreenshotButton locale={locale} reviewSlug={reviewSlug} reviewTitle={reviewTitle} />
        <button className="action-button close-button" disabled>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="action-buttons">
      <button 
        onClick={handleShare}
        className="action-button share-button"
        aria-label={getNestedTranslation(getTranslationsSync(locale), 'share.button.aria') as string}
        title={getNestedTranslation(getTranslationsSync(locale), 'share.button.title') as string}
        disabled={isSharing}
      >
        {isSharing ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        )}
      </button>
      
      <ScreenshotButton locale={locale} reviewSlug={reviewSlug} reviewTitle={reviewTitle} />
      
      <button 
        onClick={handleClose}
        className="action-button close-button"
        aria-label={getNestedTranslation(getTranslationsSync(locale), 'close.button.aria') as string}
        title={getNestedTranslation(getTranslationsSync(locale), 'close.button.title') as string}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}