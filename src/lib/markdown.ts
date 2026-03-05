import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ReviewMeta {
  slug: string;
  title: string;
  author: string;
  originalTitle: string;
  score: number;
  tags: string[];
  cover: string;
  summary: string;
  year: string;
  language: string;
  relatedReviews?: string[];
  affiliate_links?: {
    amazon?: string;
    jd?: string;
    books?: string;
  };
}

export interface Review extends ReviewMeta {
  content: string;
}

export function getAllReviews(locale: string): ReviewMeta[] {
  const dir = path.join(process.cwd(), 'content', 'reviews', locale);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const filePath = path.join(dir, filename);
      const file = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(file);
      return {
        slug: filename.replace(/\.md$/, ''),
        ...data
      } as ReviewMeta;
    });
}

export function getReview(locale: string, slug: string): Review | null {
  const filePath = path.join(process.cwd(), 'content', 'reviews', locale, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const file = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(file);
  
  // 规范化affiliate_links数据
  const normalizedData = {
    ...data,
    affiliate_links: data.affiliate_links ? {
      amazon: data.affiliate_links.amazon || undefined,
      jd: data.affiliate_links.jd || undefined,
      books: data.affiliate_links.books || undefined
    } : undefined
  };
  
  return {
    slug,
    ...normalizedData,
    content
  } as Review;
}
