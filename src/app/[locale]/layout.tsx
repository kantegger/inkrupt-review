import '../globals.css';
import { locales, Locale } from '../../i18n';
import { notFound } from 'next/navigation';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import dynamic from 'next/dynamic';
import Footer from '../../components/Footer';

// 懒加载这些交互式组件，因为它们在初始加载时是隐藏的
const ThemeSwitcher = dynamic(() => import('../../components/ThemeSwitcher'), {
  loading: () => (
    <div className="theme-switcher" style={{ opacity: 0, pointerEvents: 'none' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    </div>
  )
});

const RatingToggle = dynamic(() => import('../../components/RatingToggle'), {
  loading: () => (
    <div className="rating-toggle" style={{ opacity: 0, pointerEvents: 'none' }}>
      <span className="toggle-label">评分</span>
      <div className="toggle-switch">
        <div className="toggle-slider"></div>
      </div>
    </div>
  )
});

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode, params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  return (
    <div lang={locale}>
      <header className="header">
        <a href={`/${locale}`} className="logo">Inkrupt</a>
        <nav className="nav">
          <RatingToggle locale={locale as Locale} />
          <ThemeSwitcher />
          <LanguageSwitcher locale={locale} />
        </nav>
      </header>
      <main className="main">
        {children}
      </main>
      <Footer locale={locale as Locale} />
    </div>
  );
}
