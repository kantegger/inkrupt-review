# Contributing to Inkrupt Review

Thank you for your interest in contributing to Inkrupt Review! This document provides guidelines and instructions for contributing.

## 🌐 Available Languages

This document is available in multiple languages:
- [English](#english)
- [简体中文](#简体中文)

---

## English

### 🎯 Ways to Contribute

1. **Report Bugs**: Open an issue with detailed reproduction steps
2. **Suggest Features**: Open an issue describing your idea
3. **Add Book Reviews**: Contribute reviews in any supported language
4. **Improve Documentation**: Fix typos, clarify instructions
5. **Code Contributions**: Bug fixes, new features, optimizations

### 📋 Before You Start

- Check existing issues to avoid duplicates
- For major changes, open an issue first to discuss
- Follow the existing code style

### 📝 Adding Book Reviews

#### File Naming Convention

Use kebab-case: `the-great-gatsby.md`, `one-hundred-years-of-solitude.md`

#### Front Matter Template

```yaml
---
title: "Book Title"
author: "Author Name"
originalTitle: "Original Title (if translated)"
isbn: "9781234567890"  # Optional but recommended
cover: "/images/covers/your-slug.jpg"
score: 8.5  # 1-10, supports decimals
year: "2023"
tags: ["Fiction", "Literary Fiction"]  # 3-6 tags recommended
summary: "A brief one-sentence summary (100 chars max recommended)"
language: "en"  # en, zh-CN, zh-TW, or ja
relatedReviews: []  # Other language versions: ["zh-CN/slug", "ja/slug"]
---
```

#### Content Guidelines

- **Length**: 500-3000 words recommended
- **Tone**: Personal but respectful
- **Spoilers**: Mark major spoilers with `> **Spoiler**: ...`
- **Format**: Use markdown headers (`##`, `###`) for structure

#### Example Review Structure

```markdown
---
[front matter]
---

Opening hook - one compelling sentence about the book.

## First Section

Your analysis here...

> **Spoiler**: The butler did it.

## Second Section

More thoughts...

## Final Verdict

Summary of your recommendation.
```

### 💻 Code Contributions

#### Setup Development Environment

```bash
git clone https://github.com/kantegger/inkrupt-review.git
cd inkrupt-review
npm install
npm run dev
```

#### Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Use functional components with hooks
- **Styling**: CSS Modules or inline styles (avoid styled-components)
- **Client Components**: Mark with `'use client'` when needed
- **Naming**: PascalCase for components, camelCase for utilities

#### Commit Message Format

```
<type>: <subject>

<body>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `review`: Add/modify book review
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat: add dark mode toggle animation
fix: resolve hydration mismatch in ThemeSwitcher
review: add 1984 English review
```

#### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Ensure the build passes: `npm run build`
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request with:
   - Clear title and description
   - Reference related issues
   - Screenshots if UI changes

### 🏷️ Adding a New Language

Want to add support for a new language? Here's how:

1. Add locale to `src/i18n.ts`:
```typescript
export const locales = ['zh-CN', 'zh-TW', 'ja', 'en', 'ko'] as const;
```

2. Create translation file `messages/ko.json`

3. Create content directory `content/reviews/ko/`

4. Update `middleware.ts` locale list

5. Add language name to `localeNames` in `src/i18n.ts`

### 📸 Adding Cover Images

- **Format**: JPG preferred (smaller size)
- **Dimensions**: 320x480px (2:3 ratio)
- **Quality**: High enough to look good, compressed for web
- **Naming**: Match the review slug exactly

Use the built-in resize script:
```bash
npm run covers:resize
```

---

## 简体中文

### 🎯 贡献方式

1. **报告 Bug**: 提交 issue 并详细描述复现步骤
2. **建议功能**: 提交 issue 描述你的想法
3. **添加书评**: 以任何支持的语言贡献书评
4. **改进文档**: 修正错别字、澄清说明
5. **代码贡献**: Bug 修复、新功能、性能优化

### 📋 开始前

- 检查现有 issue 避免重复
- 重大变更前先开 issue 讨论
- 遵循现有代码风格

### 📝 添加书评

#### 文件命名规范

使用短横线连接的小写格式：`the-great-gatsby.md`、`one-hundred-years-of-solitude.md`

#### 前置元数据模板

```yaml
---
title: "书名"
author: "作者名"
originalTitle: "原书名（如果是翻译作品）"
isbn: "9781234567890"  # 可选但推荐
cover: "/images/covers/your-slug.jpg"
score: 8.5  # 1-10，支持小数
year: "2023"
tags: ["小说", "文学"]  # 推荐 3-6 个标签
summary: "简短的一句话总结（建议 100 字以内）"
language: "zh-CN"  # en, zh-CN, zh-TW, 或 ja
relatedReviews: []  # 其他语言版本：["en/slug", "ja/slug"]
---
```

#### 内容指南

- **长度**：建议 500-3000 字
- **语气**：个人化但保持尊重
- **剧透**：重大剧透用 `> **剧透**：...` 标记
- **格式**：使用 markdown 标题 (`##`, `###`) 组织内容

#### 书评结构示例

```markdown
---
[元数据]
---

开场白 - 关于这本书的一句引人深思的话。

## 第一部分标题

你的分析...

> **剧透**：凶手是管家。

## 第二部分标题

更多想法...

## 最终评价

推荐总结。
```

### 💻 代码贡献

#### 设置开发环境

```bash
git clone https://github.com/kantegger/inkrupt-review.git
cd inkrupt-review
npm install
npm run dev
```

#### 代码风格

- **TypeScript**: 启用严格模式
- **组件**: 使用函数组件和 hooks
- **样式**: CSS Modules 或内联样式（避免 styled-components）
- **客户端组件**: 需要时标记 `'use client'`
- **命名**: 组件用 PascalCase，工具函数用 camelCase

#### 提交信息格式

```
<类型>: <主题>

<正文>
```

类型：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档变更
- `style`: 代码格式调整
- `refactor`: 代码重构
- `review`: 添加/修改书评
- `chore`: 构建流程或辅助工具变更

示例：
```
feat: 添加深色模式切换动画
fix: 修复 ThemeSwitcher 的水合不匹配问题
review: 添加 1984 中文书评
```

#### Pull Request 流程

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/my-feature`
3. 进行更改
4. 确保构建通过：`npm run build`
5. 提交清晰的 commit 信息
6. 推送到你的 fork
7. 打开 Pull Request，包含：
   - 清晰的标题和描述
   - 引用相关 issue
   - UI 变更请附截图

### 🏷️ 添加新语言

想要添加新语言支持？按以下步骤：

1. 在 `src/i18n.ts` 添加语言代码：
```typescript
export const locales = ['zh-CN', 'zh-TW', 'ja', 'en', 'ko'] as const;
```

2. 创建翻译文件 `messages/ko.json`

3. 创建内容目录 `content/reviews/ko/`

4. 更新 `middleware.ts` 的语言列表

5. 在 `src/i18n.ts` 的 `localeNames` 中添加语言名称

### 📸 添加封面图片

- **格式**: JPG 优先（文件更小）
- **尺寸**: 320x480px（2:3 比例）
- **质量**: 清晰但压缩适合网页
- **命名**: 与书评 slug 完全一致

使用内置调整尺寸脚本：
```bash
npm run covers:resize
```

---

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

Feel free to open an issue for any questions about contributing.

---

Thank you for making Inkrupt Review better! 🎉
