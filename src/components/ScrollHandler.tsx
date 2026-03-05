'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // 检查是否需要恢复滚动位置
    const handleRouteChange = () => {
      // 如果是主页路径
      if (pathname.match(/^\/[^/]+\/?$/)) {
        // 检查 URL hash 是否包含恢复滚动位置的指令
        const hash = window.location.hash;
        const restoreMatch = hash.match(/^#restore-(\d+)$/);
        
        if (restoreMatch) {
          const position = parseInt(restoreMatch[1], 10);
          // 立即恢复滚动位置，无延迟
          window.scrollTo({
            top: position,
            behavior: 'auto'
          });
          // 清理 URL hash，避免影响后续导航
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          // 清理已使用的滚动位置
          sessionStorage.removeItem('homeScrollPosition');
        }
      }
    };

    handleRouteChange();
  }, [pathname]);

  useEffect(() => {
    // 保存滚动位置的函数
    const saveScrollPosition = () => {
      sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
    };

    // 监听点击书评链接事件
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href*="/review/"]');
      if (link) {
        saveScrollPosition();
      }
    };

    // 添加事件监听器
    document.addEventListener('click', handleLinkClick);

    // 清理函数
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  return null; // 这个组件不渲染任何内容
}