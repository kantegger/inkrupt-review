import { Locale, locales } from '../../../../i18n';
import { getReview, getAllReviews } from '../../../../lib/markdown';
import { notFound } from 'next/navigation';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import BrandFooter from '../../../../components/BrandFooter';
import AffiliateButtons from '../../../../components/AffiliateButtons';
import { Metadata } from 'next';
import { getTranslationsSync, getNestedTranslation } from '../../../../lib/translations';
import { buildPostMetadata, getLocaleFromPath, buildBookReviewJsonLd } from '../../../../lib/seo';

// 懒加载ActionButtons组件，因为它包含重型依赖（html2canvas）
const ActionButtons = dynamic(() => import('../../../../components/BackButton'), {
  loading: () => <div style={{ height: '60px' }} />
});

export function generateStaticParams() {
  const params: { locale: Locale; slug: string }[] = [];
  
  locales.forEach((locale) => {
    const reviews = getAllReviews(locale);
    reviews.forEach((review) => {
      params.push({
        locale: locale,
        slug: review.slug,
      });
    });
  });
  
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale, slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const review = getReview(locale, slug);
  
  if (!review) {
    return {
      title: 'Book Review Not Found | Inkrupt',
      description: 'The requested book review could not be found.',
    };
  }

  const baseUrl = 'https://inkrupt.xyz';
  const path = `/${locale}/review/${slug}`;
  const title = `${review.title} - ${review.author}`;
  const ogLocale = getLocaleFromPath(path);
  
  // 对于Twitter Cards，使用书籍封面图片（Twitter会自动调整尺寸）
  const socialImageUrl = `${baseUrl}${review.cover}`;
  
  const metadata = buildPostMetadata({
    base: baseUrl,
    path,
    title,
    description: review.summary,
    image: socialImageUrl, // 使用动态生成的分享图
    locale: ogLocale,
    author: 'Inkrupt',
    publishedTime: review.year,
    keywords: [...review.tags, review.author, review.title, review.originalTitle, '书评', '读书笔记'],
  });

  // Add alternative language links
  if (review.relatedReviews && review.relatedReviews.length > 0) {
    const languages = review.relatedReviews.reduce((acc, relatedReview) => {
      const [lang] = relatedReview.split('/');
      acc[lang] = `${baseUrl}/${relatedReview}`;
      return acc;
    }, {} as Record<string, string>);
    
    // Add current page to alternatives
    languages[locale] = `${baseUrl}${path}`;
    
    metadata.alternates = {
      ...metadata.alternates,
      languages,
    };
  }

  return metadata;
}

export default async function ReviewPage({ params }: { params: Promise<{ locale: Locale, slug: string }> }) {
  const { locale, slug } = await params;
  const review = getReview(locale, slug);
  
  // 如果当前语言没有这个书评，检查其他语言是否有
  if (!review) {
    const availableLanguages: string[] = [];
    
    // 检查所有语言是否有这个书评
    for (const lang of locales) {
      if (lang !== locale && getReview(lang, slug)) {
        availableLanguages.push(lang);
      }
    }
    
    // 如果其他语言有这个书评，显示友好提示
    if (availableLanguages.length > 0) {
      const languageNames: { [key: string]: string } = {
        'zh-CN': '简体中文',
        'zh-TW': '繁体中文',
        'ja': '日本語',
        'en': 'English'
      };
      
      return (
        <div className="not-available">
          <h1>该语言版本暂无此书评</h1>
          <p>抱歉，《{slug}》的书评暂时没有{languageNames[locale]}版本。</p>
          <p>您可以查看以下语言版本：</p>
          <ul className="language-links">
            {availableLanguages.map(lang => (
              <li key={lang}>
                <a href={`/${lang}/review/${slug}`} className="language-link">
                  {languageNames[lang]}
                </a>
              </li>
            ))}
          </ul>
          <p>
            <a href={`/${locale}`} className="back-link">← 返回首页</a>
          </p>
        </div>
      );
    }
    
    // 如果完全没有这个书评，返回404
    return notFound();
  }

  const processedContent = await remark().use(remarkHtml).process(review.content);
  const contentHtml = processedContent.toString();
  
  // 获取翻译
  const translations = getTranslationsSync(locale);
  const scoreLabel = getNestedTranslation(translations, 'review.score') as string;

  // Generate structured data for SEO
  const baseUrl = 'https://inkrupt.xyz';
  const reviewUrl = `${baseUrl}/${locale}/review/${slug}`;
  
  const bookReviewJsonLd = buildBookReviewJsonLd({
    name: review.title,
    author: review.author,
    reviewBody: review.summary,
    datePublished: `${review.year}-01-01`,
    reviewRating: review.score,
    reviewUrl,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookReviewJsonLd) }}
      />
      <article className="article">
        <ActionButtons locale={locale} reviewTitle={review.title} reviewSlug={slug} />
        <div className="article-header">
          <Image src={review.cover} alt={review.title} width={160} height={240} className="article-cover" crossOrigin="anonymous" />
          <div className="article-meta">
            <h1>{review.title}</h1>
            <div className="author">{review.author}</div>
            <div className="score">{scoreLabel}：{review.score}</div>
            <div className="date">{review.year}</div>
            <div className="tags">
              {review.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <div className="summary">{review.summary}</div>
          </div>
        </div>
        <AffiliateButtons locale={locale} affiliateLinks={review.affiliate_links} />
        <div className="prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        <BrandFooter locale={locale} />
      </article>
    </>
  );
}
