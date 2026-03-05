'use client';

import { useState, useLayoutEffect } from 'react';

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    // 使用useLayoutEffect确保在DOM更新前同步执行
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark' || !savedTheme;
    setIsDark(isDarkMode);
    
    // 使用body类名而不是html属性来避免水合不匹配
    if (typeof window !== 'undefined') {
      document.body.className = savedTheme === 'light' ? 'theme-light' : 'theme-dark';
    }
    
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    const newTheme = newIsDark ? 'dark' : 'light';
    document.body.className = newTheme === 'light' ? 'theme-light' : 'theme-dark';
    localStorage.setItem('theme', newTheme);
  };

  // 防止水合不匹配，在组件完全挂载前不显示
  if (!mounted) {
    return (
      <div className="theme-switcher" style={{ opacity: 0, pointerEvents: 'none' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-switcher"
      aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
      title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
    >
      {isDark ? (
        // 太阳图标 (切换到亮色)
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        // 月亮图标 (切换到暗色)
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}
