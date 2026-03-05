# AGENTS.md - AI协作开发文档

> 本文档专为AI Agent设计，包含项目完整的技术架构、代码模式和开发指南。

## 1. 项目概述

**Inkrupt** 是一个多语言个人书评网站，支持简体中文、繁体中文、日语、英语四种语言。

### 1.1 核心特征

| 特征 | 实现方式 |
|------|----------|
| 架构模式 | Static Site Generation (SSG) |
| 路由 | 基于文件的Next.js App Router |
| 国际化 | URL路径前缀 (`/zh-CN/`, `/en/` 等) |
| 内容管理 | Markdown + Front Matter |
| 部署目标 | Cloudflare Pages |
| 内容存储 | Git仓库 |

### 1.2 技术栈版本

```json
{
  "next": "^15.4.5",
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "typescript": "5.9.2",
  "remark": "^15.0.1",
  "remark-html": "^16.0.1",
  "gray-matter": "^4.0.3",
  "sharp": "^0.32.6",
  "playwright": "^1.54.2"
}
```

---

## 2. 项目架构

### 2.1 目录结构

```
inkrupt/
├── content/reviews/          # 书评内容（多语言）
│   ├── zh-CN/               # 简体中文书评（50+本）
│   ├── zh-TW/               # 繁体中文书评
│   ├── ja/                  # 日语书评
│   └── en/                  # 英语书评
├── messages/                 # 国际化文本
│   ├── zh-CN.json
│   ├── zh-TW.json
│   ├── ja.json
│   └── en.json
├── public/
│   ├── images/covers/       # 书籍封面（320x480px）
│   └── screenshots/         # 自动生成的书评截图
├── scripts/                 # 构建工具脚本
│   ├── covers.js            # 封面图片处理
│   ├── generate-screenshots.js
│   └── simple-cover-fetcher.js
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── [locale]/        # 动态语言路由
│   │   │   ├── layout.tsx   # 语言布局
│   │   │   ├── page.tsx     # 首页（书评网格）
│   │   │   └── review/
│   │   │       └── [slug]/
│   │   │           └── page.tsx  # 书评详情页
│   │   ├── globals.css      # 全局样式（CSS变量主题）
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 根重定向页
│   │   └── not-found.tsx
│   ├── components/          # React组件
│   │   ├── LanguageSwitcher.tsx   # 语言切换（客户端）
│   │   ├── ThemeSwitcher.tsx      # 主题切换（暗/亮）
│   │   ├── RatingToggle.tsx       # 评分显示切换
│   │   ├── BackButton.tsx         # 返回/分享/截图按钮组
│   │   ├── ScreenshotButton.tsx   # html2canvas截图
│   │   ├── AffiliateButtons.tsx   # 购买链接按钮
│   │   ├── BrandFooter.tsx        # 品牌标识底部
│   │   ├── Footer.tsx             # 页脚
│   │   ├── ClientScrollWrapper.tsx # 滚动位置恢复
│   │   └── ScrollHandler.tsx
│   ├── i18n.ts              # 语言配置
│   └── lib/                 # 工具库
│       ├── i18n.ts          # 国际化工具
│       ├── markdown.ts      # Markdown处理
│       ├── translations.ts  # 翻译加载
│       └── seo.ts           # SEO/JSON-LD生成
├── middleware.ts            # Next.js中间件（语言重定向）
├── next.config.js           # Next.js配置
├── tsconfig.json
└── .screenshot-hashes.json  # 截图缓存哈希
```

### 2.2 路由架构

```
/                          → middleware重定向 → /en/ (默认)
/[locale]/                 → 书评网格首页
/[locale]/review/[slug]    → 书评详情页
```

**支持的语言代码**: `zh-CN`, `zh-TW`, `ja`, `en`
**默认语言**: `en`

---

## 3. 数据模型

### 3.1 书评Front Matter结构

```typescript
interface ReviewMeta {
  slug: string;              // URL标识（从文件名生成）
  title: string;             // 书名
  author: string;            // 作者
  originalTitle: string;     // 原书名
  score: number;             // 评分 (1-10)
  tags: string[];            // 标签数组
  cover: string;             // 封面路径 "/images/covers/{slug}.jpg"
  summary: string;           // 书评摘要
  year: string;              // 出版年份
  language: string;          // 语言代码
  relatedReviews?: string[]; // 关联的其他语言版本 ["zh-CN/slug", "ja/slug"]

  isbn?: string;             // ISBN（可选）
}

interface Review extends ReviewMeta {
  content: string;           // Markdown正文内容
}
```

### 3.2 Markdown文件示例

```markdown
---
title: "1984"
author: "George Orwell"
originalTitle: "Nineteen Eighty-Four"
isbn: "9780451524935"
cover: "/images/covers/1984.jpg"
score: 10
year: "1949"
tags: ["Totalitarianism", "Political Allegory", "Dystopian"]
summary: "It is an iron plaque nailed to the wall of memory..."
language: "en"
relatedReviews: ["zh-CN/1984", "zh-TW/1984", "ja/1984"]
affiliate_links:
  amazon: "https://www.amazon.com/..."
  jd: "https://union-click.jd.com/..."
---

This is not a novel about the future...

## Section Title

Content with **bold** and *italic*...
```

### 3.3 翻译数据结构

```typescript
// messages/en.json 结构
{
  "site": { "title": "...", "description": "...", "tagline": "..." },
  "nav": { "home": "...", "reviews": "...", "about": "..." },
  "home": { "featured": "...", "latest": "..." },
  "review": { "score": "...", "author": "...", "summary": "..." },
  "reviews": { "title": "...", "searchPlaceholder": "..." },
  "rating": { "toggle": "...", "show": "...", "hide": "..." },
  "language": { "switch": "...", "zhCN": "..." },
  "footer": { "copyright": "..." },
  "share": { "text": "...", "success": "..." },
  "screenshot": { "guide": {...}, "error": "..." },
  "close": { "button": { "aria": "...", "title": "..." } }
}
```

---

## 4. 核心功能实现

### 4.1 国际化系统

**配置文件**: `src/i18n.ts`

```typescript
export const locales = ['zh-CN', 'zh-TW', 'ja', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'ja': '日本語',
  'en': 'English',
};
```

**中间件重定向**: `middleware.ts`

```typescript
// 逻辑：如果URL不包含语言前缀，重定向到默认语言
const pathnameIsMissingLocale = SUPPORTED_LOCALES.every(
  (locale) => !pathname.startsWith(`/${locale}`)
);

if (pathnameIsMissingLocale) {
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.redirect(url);
}
```

**翻译获取**: `src/lib/translations.ts`

```typescript
// 同步版本（服务端组件使用）
export function getTranslationsSync(locale: Locale) {
  const translations = { 'zh-CN': zhCN, 'zh-TW': zhTW, 'ja': ja, 'en': en };
  return translations[locale];
}

// 嵌套键访问：getNestedTranslation(t, 'share.text')
export function getNestedTranslation(translations: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce((obj, k) => obj?.[k], translations);
}
```

### 4.2 Markdown内容处理

**文件**: `src/lib/markdown.ts`

```typescript
// 获取所有书评列表（用于首页网格）
export function getAllReviews(locale: string): ReviewMeta[] {
  const dir = path.join(process.cwd(), 'content', 'reviews', locale);
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(filename => {
      const file = fs.readFileSync(path.join(dir, filename), 'utf8');
      const { data } = matter(file);
      return { slug: filename.replace(/\.md$/, ''), ...data } as ReviewMeta;
    });
}

// 获取单篇书评（用于详情页）
export function getReview(locale: string, slug: string): Review | null {
  const filePath = path.join(process.cwd(), 'content', 'reviews', locale, `${slug}.md`);
  const file = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(file);
  return { slug, ...data, content } as Review;
}
```

**Markdown转HTML**: 在页面组件中使用remark

```typescript
import { remark } from 'remark';
import remarkHtml from 'remark-html';

const processedContent = await remark().use(remarkHtml).process(review.content);
const contentHtml = processedContent.toString();
// 使用 dangerouslySetInnerHTML 渲染
```

### 4.3 静态页面生成

**首页**: `src/app/[locale]/page.tsx`

```typescript
// 为所有语言生成静态参数
export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

// 服务端组件，直接读取Markdown
export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const reviews = getAllReviews(locale); // 同步读取
  return (
    <div className="grid">
      {reviews.map(review => (
        <BookCard key={review.slug} review={review} />
      ))}
    </div>
  );
}
```

**详情页**: `src/app/[locale]/review/[slug]/page.tsx`

```typescript
// 为所有书评生成静态参数
export function generateStaticParams() {
  const params: { locale: Locale; slug: string }[] = [];
  locales.forEach(locale => {
    const reviews = getAllReviews(locale);
    reviews.forEach(review => {
      params.push({ locale, slug: review.slug });
    });
  });
  return params;
}

// 动态生成Metadata（SEO）
export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const review = getReview(locale, slug);
  return buildPostMetadata({
    title: `${review.title} - ${review.author}`,
    description: review.summary,
    image: review.cover,
    // ...
  });
}
```

### 4.4 主题系统

**CSS变量定义**: `src/app/globals.css`

```css
:root, body:not(.theme-light) {
  /* 暗色主题（默认） */
  --bg-primary: #030712;
  --bg-secondary: #111827;
  --text-primary: #ffffff;
  --text-secondary: #d1d5db;
  --accent-color: #f97316;
  --border-color: #374151;
}

body.theme-light {
  /* 亮色主题 */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #0f172a;
  --accent-color: #f97316;
}
```

**主题切换组件**: `src/components/ThemeSwitcher.tsx`

```typescript
'use client';

const toggleTheme = () => {
  const newTheme = isDark ? 'light' : 'dark';
  document.body.className = newTheme === 'light' ? 'theme-light' : 'theme-dark';
  localStorage.setItem('theme', newTheme);
};

// 初始化时从localStorage读取
useLayoutEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  document.body.className = savedTheme === 'light' ? 'theme-light' : 'theme-dark';
}, []);
```

### 4.5 评分显示控制

**CSS变量控制**: 

```css
.book-rating {
  display: var(--show-ratings, none); /* 默认隐藏 */
}
```

**切换逻辑**: 

```typescript
// 开启时
document.documentElement.style.setProperty('--show-ratings', 'block');
// 关闭时
document.documentElement.style.setProperty('--show-ratings', 'none');
```

### 4.6 SEO/JSON-LD生成

**文件**: `src/lib/seo.ts`

```typescript
// Open Graph + Twitter Cards
export function buildPostMetadata(opts: PostMetadataOptions): Metadata {
  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
      // ...
    },
    twitter: {
      card: 'summary_large_image',
      images: [image],
    }
  };
}

// Schema.org BookReview结构化数据
export function buildBookReviewJsonLd(opts: {...}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Book',
      name,
      author: { '@type': 'Person', name: author }
    },
    reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue,
      bestRating: 10,
      worstRating: 1
    }
  };
}
```

---

## 5. 组件详细说明

### 5.1 客户端组件模式

所有需要客户端交互的组件都使用 `'use client'` 指令：

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function ClientComponent() {
  const [isClient, setIsClient] = useState(false);
  
  // 防止水合不匹配
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return <div suppressHydrationWarning>...</div>;
  }
  
  return <div>...</div>;
}
```

### 5.2 懒加载重型组件

```typescript
import dynamic from 'next/dynamic';

const ActionButtons = dynamic(() => import('../../../../components/BackButton'), {
  loading: () => <div style={{ height: '60px' }} />
});
```

### 5.3 滚动位置恢复

**问题**: 从详情页返回首页时，需要恢复之前的滚动位置。

**解决方案**: `src/components/ClientScrollWrapper.tsx`

```typescript
'use client';

useEffect(() => {
  // 保存滚动位置
  const handleScroll = () => {
    sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
  };
  
  window.addEventListener('scroll', handleScroll);
  
  // 恢复滚动位置
  const hash = window.location.hash;
  if (hash.startsWith('#restore-')) {
    const position = parseInt(hash.replace('#restore-', ''));
    window.scrollTo(0, position);
    history.replaceState(null, '', window.location.pathname);
  }
  
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

**返回按钮逻辑**:

```typescript
const handleClose = () => {
  const savedPosition = sessionStorage.getItem('homeScrollPosition');
  if (savedPosition) {
    router.replace(`/${locale}#restore-${savedPosition}`);
  } else {
    router.push(`/${locale}`);
  }
};
```

---

## 6. 脚本工具

### 6.1 封面图片处理

**文件**: `scripts/covers.js`

```javascript
// 开发时监听模式
npm run covers:watch

// 批量处理所有图片
npm run covers:resize

// 功能：
// - 自动将封面调整为 320x480px
// - 使用 sharp 库进行高质量压缩
// - 支持 jpg/png/webp 格式
// - 开发时自动监听新文件
```

### 6.2 截图生成

**文件**: `scripts/generate-screenshots.js`

```javascript
// 为所有书评生成高清截图
npm run screenshots:generate

// 增量生成（只处理变更的文件）
npm run screenshots:incremental

// 强制重新生成
npm run screenshots:force
```

**工作原理**:
1. 计算每个Markdown文件的MD5哈希
2. 存储在 `.screenshot-hashes.json`
3. 只处理内容变更的文件
4. 使用Playwright截取高清截图（1400x1000, DPR=2）
5. 隐藏header和action buttons
6. 放大字体提高可读性

---

## 7. 常见开发任务

### 7.1 添加新书评

1. 在 `content/reviews/{locale}/` 创建 `{slug}.md`
2. 按照Front Matter模板填写
3. 添加封面图片到 `public/images/covers/{slug}.jpg`
4. 更新 `relatedReviews` 关联其他语言版本
5. 运行 `npm run covers:resize` 处理封面

### 7.2 添加新语言支持

1. 在 `src/i18n.ts` 添加语言代码和名称
2. 创建 `messages/{locale}.json` 翻译文件
3. 创建 `content/reviews/{locale}/` 目录
4. 更新 `middleware.ts` 中的 `SUPPORTED_LOCALES`

### 7.3 修改页面布局

**首页布局**: 编辑 `src/app/[locale]/page.tsx`

**详情页布局**: 编辑 `src/app/[locale]/review/[slug]/page.tsx`

**全局布局**: 编辑 `src/app/[locale]/layout.tsx`

### 7.4 修改样式

**主题变量**: 编辑 `src/app/globals.css` 中的CSS变量

**组件样式**: 直接在组件文件中使用CSS Modules或内联样式

---

## 8. 构建与部署

### 8.1 构建配置

**next.config.js**:

```javascript
const nextConfig = {
  output: 'export',           // 静态导出
  images: {
    unoptimized: true         // 禁用Next.js图片优化（使用静态导出）
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};
```

### 8.2 构建流程

```bash
# 1. 处理封面图片
npm run covers:resize

# 2. 构建静态站点
npm run build

# 3. 输出到 out/ 目录
```

### 8.3 部署配置（Cloudflare Pages）

- **构建命令**: `npm run build`
- **输出目录**: `out`
- **Node.js版本**: 18+

---

## 9. 关键注意事项

### 9.1 水合不匹配防护

所有客户端组件必须处理水合不匹配：

```typescript
const [isClient, setIsClient] = useState(false);
useEffect(() => setIsClient(true), []);
if (!isClient) return <FallbackUI />;
```

### 9.2 服务端组件限制

- 服务端组件不能使用 `useState`, `useEffect` 等hooks
- 服务端组件可以直接读取文件系统
- 服务端组件可以返回 `dangerouslySetInnerHTML`

### 9.3 图片处理

- 封面图片必须放在 `public/images/covers/`
- 推荐使用 320x480px 尺寸
- 使用 `sharp` 进行压缩优化

### 9.4 URL规范

- 所有内部链接必须使用相对路径或完整路径
- 语言切换时保留当前路径：
  ```typescript
  const restPath = pathname.replace(/^\/(zh-CN|zh-TW|ja|en)/, '');
  const newPath = `/${nextLocale}${restPath}`;
  ```

### 9.5 多语言关联

`relatedReviews` 字段格式：

```yaml
relatedReviews: 
  - "zh-CN/book-slug"
  - "ja/book-slug"
  - "en/book-slug"
```

---

## 10. 故障排除

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 水合错误 | 客户端/服务端渲染差异 | 使用 `useEffect` + `isClient` 模式 |
| 图片不显示 | 路径错误或图片未处理 | 检查 `public/images/covers/` 路径 |
| 翻译缺失 | messages文件缺少键 | 检查所有语言的messages文件 |
| 截图失败 | Playwright未安装 | 运行 `npm install playwright` |
| 构建失败 | TypeScript错误 | 运行 `npx tsc --noEmit` 检查 |

---

## 11. 文件依赖图

```
page.tsx (首页)
  ├── getAllReviews() ← lib/markdown.ts
  ├── ClientScrollWrapper ← components/ClientScrollWrapper.tsx
  └── 渲染: BookCard网格

page.tsx (详情页)
  ├── getReview() ← lib/markdown.ts
  ├── getTranslationsSync() ← lib/translations.ts
  ├── buildPostMetadata() ← lib/seo.ts
  ├── ActionButtons ← components/BackButton.tsx (动态导入)

  └── BrandFooter ← components/BrandFooter.tsx

layout.tsx
  ├── LanguageSwitcher ← components/LanguageSwitcher.tsx
  ├── ThemeSwitcher ← components/ThemeSwitcher.tsx (动态导入)
  └── RatingToggle ← components/RatingToggle.tsx (动态导入)

middleware.ts
  └── 重定向无语言前缀的URL
```

---

## 12. 扩展点

如需扩展功能，考虑以下位置：

- **新字段**: 修改 `ReviewMeta` 接口和Front Matter
- **新页面**: 在 `src/app/[locale]/` 下创建新路由
- **新API**: 在 `src/lib/` 下创建新工具函数
- **新脚本**: 在 `scripts/` 下创建新Node脚本
- **新组件**: 在 `src/components/` 下创建新组件

---

*本文档最后更新: 2026-02-25*
