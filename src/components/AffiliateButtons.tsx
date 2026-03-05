import React from 'react';
import { Locale } from '../i18n';

interface AffiliateButtonsProps {
  locale: Locale;
  affiliateLinks?: {
    amazon?: string;
    jd?: string;
    books?: string;
  };
}

export default function AffiliateButtons({ locale, affiliateLinks }: AffiliateButtonsProps) {
  // 多语言文字配置
  const getText = React.useCallback((key: string) => {
    const texts: Record<string, Record<Locale, string>> = {
      amazon: {
        'en': 'Amazon',
        'ja': 'Amazon',
        'zh-CN': '亚马逊',
        'zh-TW': 'Amazon'
      },
      jd: {
        'en': 'JD.com',
        'ja': '京東',
        'zh-CN': '京东',
        'zh-TW': '京東'
      },
      books: {
        'en': 'Books.com.tw',
        'ja': '博客來',
        'zh-CN': '博客来',
        'zh-TW': '博客來'
      },
      disclaimer: {
        'en': 'Thank you for supporting Inkrupt through these trusted retailer links. Your purchase helps keep our independent book reviews running.',
        'ja': 'これらの信頼できる書店リンクから、Inkruptをご支援いただきありがとうございます。ご購入により、独立した書評サイトの運営が支えられます。',
        'zh-CN': '感谢您通过这些可信的书店链接支持Inkrupt。您的购买将帮助我们持续提供独立的书评内容。',
        'zh-TW': '感謝您透過這些可信的書店連結支持Inkrupt。您的購買將幫助我們持續提供獨立的書評內容。'
      }
    };
    return texts[key][locale];
  }, [locale]);

  // 规范化处理affiliate_links数据，确保一致性
  const normalizedLinks = React.useMemo(() => {
    if (!affiliateLinks) return {};
    
    return {
      amazon: affiliateLinks.amazon || undefined,
      jd: affiliateLinks.jd || undefined,
      books: affiliateLinks.books || undefined
    };
  }, [affiliateLinks]);

  // 按钮配置
  const buttons = React.useMemo(() => [
    {
      key: 'amazon',
      url: normalizedLinks.amazon,
      text: getText('amazon'),
      color: '#ff9900'
    },
    {
      key: 'jd',
      url: normalizedLinks.jd,
      text: getText('jd'),
      color: '#e1251b'
    },
    {
      key: 'books',
      url: normalizedLinks.books,
      text: getText('books'),
      color: '#0066cc'
    }
  ], [normalizedLinks, getText]);

  // 过滤掉没有链接的按钮，使用useMemo确保稳定性
  const availableButtons = React.useMemo(
    () => buttons.filter(button => button.url && button.url.trim() !== ''),
    [buttons]
  );

  // 根据按钮数量生成CSS类名，使用useMemo确保稳定性
  const containerClass = React.useMemo(() => {
    const count = availableButtons.length;
    return `affiliate-buttons-container affiliate-buttons-count-${count}`;
  }, [availableButtons.length]);

  if (availableButtons.length === 0) {
    return null;
  }

  return (
    <div className="affiliate-buttons-wrapper">
      <div className={containerClass}>
        {availableButtons.map(button => (
          <a 
            key={button.key}
            href={button.url}
            target="_blank"
            rel="noopener noreferrer"
            className="affiliate-button"
            style={{ '--button-color': button.color } as React.CSSProperties}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            {button.text}
          </a>
        ))}
      </div>
      <span className="affiliate-disclaimer">
        {getText('disclaimer')}
      </span>
    </div>
  );
}