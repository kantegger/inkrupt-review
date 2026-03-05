# 🚀 Inkrupt - 极简多语言书评网站

一个现代化的多语言个人书评网站，支持简体中文、繁体中文、日语、英语四种语言，采用极简技术栈，实现零成本维护（除域名费用）。

## ✨ 特性

- 📚 **多语言支持** - 完整的国际化支持（简中/繁中/日语/英语）
- ⚡ **极速性能** - 静态生成 + CDN，闪电般访问速度
- 🎨 **现代设计** - 深色主题 + 橙红渐变，优雅的视觉体验
- ✏️ **简单管理** - Markdown 编写，Git 版本控制
- 📱 **响应式** - 移动优先设计，完美适配各种设备
- 🔍 **强大搜索** - 实时搜索 + 标签筛选 + 多种排序
- 💰 **零成本** - 除域名外完全免费运行
- 🛠️ **易维护** - 最简技术栈，一次搭建终身使用

## 🏗️ 技术栈

- **前端框架**: Next.js 15.5 (App Router + Static Export)
- **样式系统**: Tailwind CSS v4
- **国际化**: next-intl
- **内容格式**: Markdown + Gray Matter
- **开发语言**: TypeScript
- **部署平台**: Cloudflare Pages
- **存储方案**: GitHub Repository

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Git
- 代码编辑器（推荐 VS Code）

### 安装步骤

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd inkrupt

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问网站
# 在浏览器中打开 http://localhost:3000
```

### 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 预览生产版本
npm run lint         # 代码检查
npm run type-check   # TypeScript 类型检查
npm run covers:fetch # 获取书籍封面
```

## 📁 项目结构

```
inkrupt/
├── 📂 content/                   # 内容目录
│   └── 📂 reviews/              # 书评文件
│       ├── 📂 zh-CN/           # 简体中文书评
│       ├── 📂 zh-TW/           # 繁体中文书评
│       ├── 📂 ja/              # 日语书评
│       └── 📂 en/              # 英语书评
├── 📂 messages/                 # 国际化文本
│   ├── 📄 zh-CN.json
│   ├── 📄 zh-TW.json
│   ├── 📄 ja.json
│   └── 📄 en.json
├── 📂 public/                   # 静态资源
│   ├── 📂 images/
│   │   └── 📂 covers/          # 书籍封面图片
│   └── 📄 favicon.ico
├── 📂 src/                      # 源代码
│   ├── 📄 i18n.ts              # 国际化配置
│   ├── 📂 app/                 # Next.js 应用路由
│   ├── 📂 components/          # React 组件
│   └── 📂 lib/                 # 工具函数和库
├── 📄 middleware.ts             # 语言路由中间件
├── 📄 next.config.js           # Next.js 配置
├── 📄 tailwind.config.js       # Tailwind CSS 配置
└── 📄 tsconfig.json            # TypeScript 配置
```

## 📝 内容管理

### 添加新书评

1. 在 `content/reviews/{语言}/` 目录下创建新的 `.md` 文件
2. 按照以下格式编写书评：

```markdown
---
title: "书名"
author: "作者"
originalTitle: "原书名"
score: 9
tags: ["标签1", "标签2", "标签3"]
cover: "/images/covers/book-cover.jpg"
summary: "书评摘要，简要介绍这本书的内容和你的观点..."
publishDate: "2024-01-15"
language: "zh-CN"
relatedReviews: ["ja/book-slug", "en/book-slug"]
---

# 书评正文

这里写你的书评内容...

## 主要观点

- 观点一
- 观点二

> 这是一个引用

**重点内容**会被加粗显示。
```

3. 将书籍封面图片放入 `public/images/covers/` 目录
4. 提交到 Git 仓库，自动部署

### 多语言内容管理

- 每种语言的内容独立管理
- 通过 `relatedReviews` 字段关联不同语言版本
- 支持灵活的翻译策略，不强制所有语言都有相同内容

## 🌐 多语言支持

### 支持的语言

- 🇨🇳 **简体中文** (`zh-CN`) - 默认语言
- 🇹🇼 **繁体中文** (`zh-TW`)
- 🇯🇵 **日本語** (`ja`)
- 🇺🇸 **English** (`en`)

### 语言路由

- `inkrupt.com/zh-CN/` - 简体中文
- `inkrupt.com/zh-TW/` - 繁体中文
- `inkrupt.com/ja/` - 日语
- `inkrupt.com/en/` - 英语

### 语言检测

1. URL 路径优先（如 `/zh-CN/`）
2. 浏览器语言设置
3. 默认语言（简体中文）

## 🚀 部署指南

### Cloudflare Pages 部署

1. **创建 GitHub 仓库**并推送代码
2. **登录 Cloudflare Pages**
3. **连接 GitHub 仓库**
4. **配置构建设置**：
   - 构建命令: `npm run build`
   - 输出目录: `out`
   - Node.js 版本: 18+
5. **部署完成**！

### 自定义域名

1. 在 Cloudflare Pages 中添加自定义域名
2. 配置 DNS 解析
3. 自动获得 SSL 证书

### 成本分析

| 服务 | 费用 | 说明 |
|------|------|------|
| 域名 | $10-15/年 | 唯一费用 |
| GitHub | 免费 | 私有仓库 |
| Cloudflare Pages | 免费 | 无限带宽 |
| SSL 证书 | 免费 | 自动配置 |
| **总计** | **$10-15/年** | 极低成本 |

## 🎨 设计系统

### 色彩方案

- **主色调**: Orange-500 (#f97316) → Red-500 (#ef4444)
- **背景色**: Gray-950 (#030712)
- **文字色**: White, Gray-300, Gray-400
- **强调色**: Yellow-400 (高亮), Green-400 (高分)

### 字体配置

针对不同语言优化的字体堆栈：

- **中文**: PingFang SC, Noto Sans SC, Source Han Sans SC
- **日语**: Hiragino Sans, Yu Gothic, Noto Sans JP
- **英语**: System fonts (San Francisco, Segoe UI, Roboto)

## 🔧 自定义配置

### 修改网站信息

编辑 `messages/{语言}.json` 文件中的 `site` 部分：

```json
{
  "site": {
    "title": "你的网站名",
    "description": "你的网站描述",
    "tagline": "你的标语"
  }
}
```

### 添加新语言

1. 在 `src/i18n.ts` 中添加新语言代码
2. 创建对应的 `messages/{语言}.json` 文件
3. 在 `content/reviews/` 中创建语言目录
4. 更新 `middleware.ts` 配置

### 样式自定义

编辑 `tailwind.config.js` 和 `src/app/globals.css` 文件来自定义样式。

## 📊 功能特性

### 核心功能

- ✅ 多语言书评展示
- ✅ 实时搜索和筛选
- ✅ 标签分类系统
- ✅ 评分和排序
- ✅ 响应式设计
- ✅ SEO 优化
- ✅ 语言切换器

### 高级功能

- 📖 阅读时间估算
- 🔗 相关书评推荐
- 🏷️ 智能标签系统
- 📱 移动端优化
- 🌓 深色主题

## 🛠️ 开发指南

### 项目规范

- **代码风格**: 使用 ESLint 和 Prettier
- **提交规范**: 使用 Conventional Commits
- **分支策略**: main 分支用于生产，feature 分支用于开发

### 性能优化

- 静态生成所有页面
- 图片自动优化
- CSS 按需加载
- 代码分割和懒加载

### SEO 优化

- 每页独立的 Meta 标签
- 结构化数据支持
- 多语言 hreflang 标签
- 自动生成 sitemap

## 🔮 扩展计划

### 即将推出

- 🔍 全文搜索增强
- 📊 阅读统计仪表板
- 💬 评论系统集成
- 📱 PWA 支持

### 长期规划

- 🤖 AI 辅助写作
- 📈 高级分析功能
- 🌐 更多语言支持
- 🎯 个性化推荐

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

## 📋 最近更新

- ✅ 修复 8 个安全漏洞（包括 Next.js、Playwright 等依赖）
- ✅ 更新依赖版本至最新稳定版
- ✅ 优化静态生成性能

## 🙏 致谢

感谢所有开源项目的贡献者，特别是：

- [Next.js](https://nextjs.org) - React 框架
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
- [next-intl](https://next-intl-docs.vercel.app) - 国际化库
- [Cloudflare Pages](https://pages.cloudflare.com) - 部署平台

---

**让阅读的思考如墨水般喷涌而出！** 🚀