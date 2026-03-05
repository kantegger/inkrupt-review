import { getTranslationsSync, getNestedTranslation } from '../lib/translations';
import { Locale } from '../i18n';

interface BrandFooterProps {
  locale: Locale;
}

export default function BrandFooter({ locale }: BrandFooterProps) {
  const translations = getTranslationsSync(locale);
  
  return (
    <div className="brand-footer">
      <div className="brand-divider"></div>
      <div className="brand-content">
        <div className="brand-logo">Inkrupt</div>
        <div className="brand-subtitle">{getNestedTranslation(translations, 'brand.poweredBy') as string}</div>
      </div>
    </div>
  );
}
