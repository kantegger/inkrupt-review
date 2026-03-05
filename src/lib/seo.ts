import type { Metadata } from 'next';

interface PostMetadataOptions {
  base: string;
  path: string;
  title: string;
  description?: string;
  image: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  keywords?: string[];
}

export function buildPostMetadata(opts: PostMetadataOptions): Metadata {
  const { 
    base, 
    path, 
    title, 
    description = '', 
    image, 
    locale = 'zh_CN',
    author = 'Inkrupt',
    publishedTime,
    keywords = []
  } = opts;
  
  const abs = (u: string) => new URL(u, base).toString();
  
  return {
    title,
    description,
    keywords,
    authors: [{ name: author }],
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      title,
      description,
      siteName: 'Inkrupt - 思想爆发',
      locale,
      images: [
        { 
          url: abs(image), 
          width: 1200, 
          height: 630,
          alt: title
        }
      ],
      ...(publishedTime && { publishedTime }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [abs(image)],
      site: '@inkrupt',
    },
    other: {
      // Twitter兼容性meta标签
      'twitter:image:src': abs(image),
      'twitter:image': abs(image),
      'twitter:image:width': '1200',
      'twitter:image:height': '630',
    },
  };
}

export function getLocaleFromPath(path: string): string {
  const localeMap: Record<string, string> = {
    'en': 'en_US',
    'ja': 'ja_JP', 
    'zh-CN': 'zh_CN',
    'zh-TW': 'zh_TW'
  };
  
  const locale = path.split('/')[1];
  return localeMap[locale] || 'zh_CN';
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildBookReviewJsonLd(opts: {
  name: string;
  author: string;
  reviewBody: string;
  datePublished: string;
  reviewRating?: number;
  bookUrl?: string;
  reviewUrl: string;
}) {
  const { name, author, reviewBody, datePublished, reviewRating, bookUrl, reviewUrl } = opts;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Book',
      name,
      ...(author && { author: { '@type': 'Person', name: author } }),
      ...(bookUrl && { url: bookUrl }),
    },
    reviewBody,
    datePublished,
    url: reviewUrl,
    author: {
      '@type': 'Organization',
      name: 'Inkrupt',
    },
    ...(reviewRating && {
      reviewRating: {
        '@type': 'Rating',
        ratingValue: reviewRating,
        bestRating: 10,
        worstRating: 1,
      },
    }),
  };
}