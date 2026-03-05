# Inkrupt Project - Master Prompt for AI Agents

> 将此prompt提供给任何AI Agent，使其能够为Inkrupt项目生成符合规范的代码。

---

## IDENTITY & CONTEXT

你是一个为 **Inkrupt** 项目生成代码的AI助手。

**Inkrupt** 是一个多语言个人书评网站，特点：
- 4种语言：简体中文(zh-CN)、繁体中文(zh-TW)、日语(ja)、英语(en)
- 技术栈：Next.js 15 + React 19 + TypeScript + Static Export
- 内容管理：Markdown + Front Matter
- 部署：Cloudflare Pages (静态站点)
- 架构：纯SSG，无API路由，无数据库

---

## CRITICAL RULES (必须遵守)

### 1. 文件操作规则

```
✅ 可以读取/修改：
   - content/reviews/{locale}/*.md
   - messages/*.json
   - src/components/*.tsx
   - src/app/**/*.tsx
   - src/lib/*.ts
   - scripts/*.js
   - public/images/covers/*

❌ 禁止修改：
   - 不要修改 next.config.js
   - 不要修改 middleware.ts
   - 不要修改 tsconfig.json
   - 不要创建 API routes
   - 不要添加数据库相关代码
   - 不要添加需要服务端运行的代码
```

### 2. 客户端组件规则

**任何使用以下功能的组件必须是客户端组件：**

```typescript
'use client';  // 必须放在文件第一行

import { useState, useEffect, useLayoutEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
```

**必须防止水合不匹配：**

```typescript
export default function ClientComponent() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 服务端渲染时显示占位符
  if (!isClient) {
    return <div suppressHydrationWarning>...</div>;
  }
  
  // 客户端渲染时显示实际内容
  return <div>...</div>;
}
```

### 3. 主题系统规则

**始终使用CSS变量，不要硬编码颜色：**

```css
/* ✅ 正确 */
color: var(--text-primary);
background: var(--bg-secondary);
border-color: var(--border-color);

/* ❌ 错误 */
color: #ffffff;
background: #111827;
```

**可用CSS变量：**
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary` - 背景色
- `--text-primary`, `--text-secondary`, `--text-muted` - 文字色
- `--border-color` - 边框色
- `--accent-color`, `--accent-hover` - 强调色（橙色系）
- `--shadow-color`, `--shadow-accent` - 阴影色

### 4. 国际化规则

**翻译文件位置：** `messages/{locale}.json`

**获取翻译（服务端组件）：**

```typescript
import { getTranslationsSync, getNestedTranslation } from '../../../lib/translations';

const t = getTranslationsSync(locale);
const text = getNestedTranslation(t, 'review.score') as string;
```

**支持的语言代码：** `zh-CN`, `zh-TW`, `ja`, `en`

**默认语言：** `en`

### 5. Markdown内容规则

**Front Matter 必需字段：**

```yaml
---
title: "书名"
author: "作者名"
originalTitle: "原书名"
cover: "/images/covers/{slug}.jpg"
score: 9                    # 1-10的整数
year: "2024"
tags: ["标签1", "标签2"]
summary: "简短摘要，一两句话"
language: "en"              # 当前语言代码
relatedReviews:             # 其他语言版本
  - "zh-CN/{slug}"
  - "ja/{slug}"
---
```

**可选字段：** `isbn`

### 6. 图片规则

**封面图片：**
- 路径: `public/images/covers/{slug}.jpg`
- 尺寸: 320x480px (2:3比例)
- 格式: JPG优先
- 引用: `/images/covers/{slug}.jpg`

**使用Next.js Image组件：**

```typescript
import Image from 'next/image';

<Image 
  src={review.cover}
  alt={review.title}
  width={128}
  height={192}
  className="book-cover"
/>
```

### 7. 路由规则

**URL结构：**
```
/{locale}/                    # 首页（书评网格）
/{locale}/review/{slug}       # 书评详情页
```

**页面参数获取：**

```typescript
// 所有页面组件都是async函数
export default async function Page({ 
  params 
}: { 
  params: Promise<{ locale: Locale; slug: string }> 
}) {
  const { locale, slug } = await params;
  // ...
}
```

**链接使用：**

```typescript
import Link from 'next/link';

// ✅ 正确 - 使用Next.js Link
<Link href={`/${locale}/review/${slug}`}>...</Link>

// ✅ 正确 - 使用a标签跳转到外部
<a href="https://example.com">...</a>
```

### 8. 懒加载规则

**重型组件使用动态导入：**

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <div style={{ height: '60px' }} />,
  ssr: false  // 如果组件完全不需要SSR
});
```

---

## CODE TEMPLATES

### 模板1：新页面组件

```typescript
import { Locale } from '../../../i18n';
import { getTranslationsSync, getNestedTranslation } from '../../../lib/translations';

// 如果是客户端交互，添加：
// 'use client';

// 如果需要静态生成参数：
// export function generateStaticParams() {
//   return locales.map(locale => ({ locale }));
// }

export default async function NewPage({ 
  params 
}: { 
  params: Promise<{ locale: Locale }> 
}) {
  const { locale } = await params;
  const t = getTranslationsSync(locale);
  
  return (
    <div className="your-class">
      {/* 内容 */}
    </div>
  );
}
```

### 模板2：新客户端组件

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Locale } from '../i18n';

interface Props {
  locale: Locale;
  // 其他props
}

export default function NewComponent({ locale }: Props) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div suppressHydrationWarning>
        {/* 占位符 */}
      </div>
    );
  }
  
  return (
    <div>
      {/* 实际内容 */}
    </div>
  );
}
```

### 模板3：新书评Markdown

```markdown
---
title: "书名"
author: "作者名"
originalTitle: "Original Title"
cover: "/images/covers/{slug}.jpg"
score: 8
year: "2024"
tags: ["标签1", "标签2", "标签3"]
summary: "这是一段简短的书评摘要..."
language: "zh-CN"
relatedReviews:
  - "en/{slug}"
  - "ja/{slug}"
---

## 第一部分

书评正文内容...

## 第二部分

更多内容...
```

### 模板4：SEO Metadata生成

```typescript
import { Metadata } from 'next';
import { buildPostMetadata, getLocaleFromPath } from '../../../lib/seo';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: Locale; slug: string }> 
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const review = getReview(locale, slug);
  
  if (!review) {
    return {
      title: 'Not Found | Inkrupt',
      description: 'Page not found',
    };
  }
  
  return buildPostMetadata({
    base: 'https://inkrupt.xyz',
    path: `/${locale}/review/${slug}`,
    title: `${review.title} - ${review.author}`,
    description: review.summary,
    image: review.cover,
    locale: getLocaleFromPath(`/${locale}`),
    keywords: [...review.tags, review.author, review.title],
  });
}
```

---

## COMMON TASKS

### 任务：添加一篇新书评

**步骤：**
1. 为每种语言创建 `{slug}.md` 文件于 `content/reviews/{locale}/`
2. 确保 `relatedReviews` 字段包含所有其他语言版本
3. 添加封面图片到 `public/images/covers/{slug}.jpg`
4. 运行 `npm run covers:resize` 处理封面

### 任务：添加新语言

**步骤：**
1. 在 `src/i18n.ts` 中添加语言代码和名称
2. 创建 `messages/{new-locale}.json` 翻译文件
3. 创建 `content/reviews/{new-locale}/` 目录
4. 复制已有书评并翻译

### 任务：修改首页布局

**文件：** `src/app/[locale]/page.tsx`

**注意：**
- 保持 `generateStaticParams()` 函数
- 使用 `getAllReviews(locale)` 获取书评列表
- 评分图标逻辑：
  - 9.0+ = 🔥
  - 8.0-8.9 = 👍
  - 6.0-7.9 = 💭
  - <6.0 = 👎

### 任务：添加新组件

**文件位置：** `src/components/{ComponentName}.tsx`

**命名规范：**
- PascalCase 命名
- 如果包含客户端交互，添加 `'use client'`
- 导出默认组件
- Props 使用 TypeScript 接口定义

---

## STYLE GUIDE

### CSS类名规范

```
.book-{name}        # 书籍相关元素
.article-{name}     # 文章页面元素
.action-{name}      # 操作按钮
.{name}-toggle      # 切换开关
.{name}-switcher    # 切换器（语言/主题）
```

### TypeScript规范

```typescript
// ✅ 显式返回类型（页面组件）
export default async function Page({ params }: Props): Promise<JSX.Element>

// ✅ 接口命名
interface ReviewMeta { ... }
interface Props { ... }

// ✅ 类型导入
import type { Locale } from '../../i18n';

// ✅ 使用as const
export const locales = ['zh-CN', 'zh-TW', 'ja', 'en'] as const;
```

### 错误处理规范

```typescript
// 文件读取错误
if (!fs.existsSync(filePath)) return null;

// 数据缺失处理
if (!review) return notFound();  // 使用Next.js的notFound

// try-catch用于可能失败的API
```

---

## FORBIDDEN PATTERNS (禁止模式)

```typescript
// ❌ 不要在服务端组件中使用浏览器API
const width = window.innerWidth;  // 错误！

// ❌ 不要直接修改DOM
// 在React组件中直接使用 document.querySelector

// ❌ 不要硬编码颜色
<div style={{ color: '#ffffff' }}>  // 错误！

// ❌ 不要忽略TypeScript错误
// @ts-ignore  // 尽量避免使用

// ❌ 不要使用未定义的CSS类
// 确保类名在 globals.css 中定义

// ❌ 不要创建需要服务端运行的代码
// 如数据库连接、文件上传服务器等
```

---

## DEPENDENCIES

**核心依赖（已安装）：**
- next, react, react-dom
- typescript
- remark, remark-html
- gray-matter
- sharp (图片处理)
- playwright (截图生成)

**如需新依赖，先检查是否已有替代方案。**

---

## FILE REFERENCE

**关键文件位置速查：**

| 功能 | 文件路径 |
|------|----------|
| 语言配置 | `src/i18n.ts` |
| 翻译加载 | `src/lib/translations.ts` |
| Markdown处理 | `src/lib/markdown.ts` |
| SEO工具 | `src/lib/seo.ts` |
| 首页 | `src/app/[locale]/page.tsx` |
| 书评详情页 | `src/app/[locale]/review/[slug]/page.tsx` |
| 布局 | `src/app/[locale]/layout.tsx` |
| 全局样式 | `src/app/globals.css` |
| 中间件 | `middleware.ts` |

---

## QUESTIONS?

如果不确定，请：
1. 查看 `AGENTS.md` 获取详细架构说明
2. 参考现有代码（如 `src/components/LanguageSwitcher.tsx`）
3. 保持与现有代码风格一致
4. 优先使用简单方案

---

**Version:** 1.0  
**Last Updated:** 2026-02-25
