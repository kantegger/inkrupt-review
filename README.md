# 📚 Inkrupt Review

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-inkrupt.xyz-green)](https://inkrupt.xyz)

> A minimalist multilingual book review website template. Write your thoughts, let them flow like ink.

**🔗 Live Demo: [inkrupt.xyz](https://inkrupt.xyz)**

[中文](#中文说明) | [English](#english-readme) | [日本語](#日本語) | [繁體中文](#繁體中文)

---

## English README

### ✨ Features

- **🌍 Multilingual Support**: English, Simplified Chinese (zh-CN), Traditional Chinese (zh-TW), and Japanese (ja)
- **⚡ Zero Backend**: Pure static site, no database required
- **🎨 Minimalist Design**: Clean, typography-focused layout
- **📱 Responsive**: Works perfectly on desktop and mobile
- **🌙 Dark/Light Theme**: Automatic theme switching
- **🔍 SEO Optimized**: JSON-LD structured data, Open Graph, Twitter Cards
- **⚙️ Zero Config Deployment**: Works with Cloudflare Pages, Vercel, Netlify, GitHub Pages

### 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/kantegger/inkrupt-review.git
cd inkrupt-review

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### 📁 Project Structure

```
inkrupt-review/
├── content/reviews/          # Book reviews (markdown)
│   ├── zh-CN/               # Simplified Chinese reviews
│   ├── zh-TW/               # Traditional Chinese reviews
│   ├── ja/                  # Japanese reviews
│   └── en/                  # English reviews
├── messages/                 # i18n translations (JSON)
├── public/images/covers/     # Book cover images
├── src/
│   ├── app/[locale]/         # Next.js App Router
│   ├── components/           # React components
│   └── lib/                  # Utilities
└── scripts/                  # Build tools
```

### 📝 Adding a Book Review

1. Create a markdown file in `content/reviews/{locale}/`:

```markdown
---
title: "1984"
author: "George Orwell"
originalTitle: "Nineteen Eighty-Four"
isbn: "9780451524935"
cover: "/images/covers/1984.jpg"
score: 10
year: "1949"
tags: ["Dystopian", "Classic", "Political"]
summary: "It is an iron plaque nailed to the wall of memory."
language: "en"
relatedReviews: ["zh-CN/1984", "ja/1984"]
---

Your review content here...
```

2. Add cover image to `public/images/covers/1984.jpg` (recommended: 320x480px)

3. Run `npm run covers:resize` to optimize the image

4. Run `npm run build` to generate static site

### 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build static site for production |
| `npm run covers:resize` | Optimize all cover images |
| `npm run covers:fetch` | Fetch book covers from online sources |
| `npm run book:add` | Interactive tool to add new book reviews |
| `npm run inventory` | Generate book inventory list |
| `npm run covers:fetch` | Fetch book covers from online sources |

### 🚢 Deployment

#### Cloudflare Pages (Recommended)

1. Connect your GitHub repository to Cloudflare Pages
2. Build command: `npm run build`
3. Build output directory: `out`
4. Done!

#### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kantegger/inkrupt-review)

#### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/kantegger/inkrupt-review)

### 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 中文说明

**🔗 在线演示: [inkrupt.xyz](https://inkrupt.xyz)**

### ✨ 特性

- **🌍 多语言支持**：简体中文、繁体中文、日语、英语
- **⚡ 零后端**：纯静态站点，无需数据库
- **🎨 极简设计**：干净、以排版为核心的布局
- **📱 响应式**：桌面和移动设备完美适配
- **🌙 深色/浅色主题**：自动主题切换
- **🔍 SEO 优化**：JSON-LD 结构化数据、Open Graph、Twitter Cards
- **⚙️ 零配置部署**：支持 Cloudflare Pages、Vercel、Netlify、GitHub Pages

### 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/kantegger/inkrupt-review.git
cd inkrupt-review

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 📝 添加书评

1. 在 `content/reviews/{语言代码}/` 目录创建 markdown 文件：

```markdown
---
title: "1984"
author: "George Orwell"
originalTitle: "Nineteen Eighty-Four"
isbn: "9780451524935"
cover: "/images/covers/1984.jpg"
score: 10
year: "1949"
tags: ["反乌托邦", "经典", "政治"]
summary: "它是一块钉在记忆之墙上的铁牌，上面写着：别说没人警告过你。"
language: "zh-CN"
relatedReviews: ["en/1984", "ja/1984"]
---

你的书评内容...
```

2. 添加封面图片到 `public/images/covers/1984.jpg`（推荐尺寸：320x480px）

3. 运行 `npm run covers:resize` 优化图片

4. 运行 `npm run build` 生成静态站点

---

## 日本語

最小主義の多言語書評ウェブサイトテンプレート。Next.js 15 + 静的エクスポートで構築。

**主な機能**:
- 4言語対応（英語、簡体字中国語、繁体字中国語、日本語）
- バックエンド不要の純粋な静的サイト
- ダーク/ライトテーマ切り替え
- SEO最適化

クイックスタート:
```bash
npm install
npm run dev
```

---

## 繁體中文

極簡主義的多語言書評網站模板。支援簡體中文、繁體中文、日語、英語四種語言。

**主要功能**:
- 零後端依賴，純靜態網站
- 自動深淺色主題切換
- 響應式設計
- SEO 優化

---

## 📋 Changelog

### 2025-03

- ✅ Fixed 8 security vulnerabilities (Next.js, Playwright, etc.)
- ✅ Updated all dependencies to latest stable versions

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Gray Matter](https://github.com/jonschlinkert/gray-matter) - Front matter parser
- [Remark](https://remark.js.org/) - Markdown processor

---

<p align="center">
  Made with ❤️ for book lovers
</p>
