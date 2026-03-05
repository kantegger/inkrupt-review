import { Locale } from '../i18n';
import { getTranslationsSync } from '../lib/translations';

interface FooterProps {
  locale: Locale;
}

export default function Footer({ locale }: FooterProps) {
  const t = getTranslationsSync(locale);

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>{t.footer.copyright}</p>
        </div>
        <div className="footer-center">
          <p>{t.footer.madeWith}</p>
        </div>
        <div className="footer-right">
          <p>{t.footer.poweredBy}</p>
        </div>
      </div>
    </footer>
  );
}
