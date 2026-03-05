# Inkrupt 一键工作流

> 只需一个命令，完成从原始内容到完整书评页面的所有工作。

## 快速开始

### 1. 准备输入文件

创建一个文本文件（如 `new-book.md`），格式如下：

```markdown
《书名》(English Title, Year) - Author
评分：9.2/10

简中版 (zh-CN)
书名: 中文书名
作者: 作者名
原书名: Original Title
评分: 9.2/10
出版年: 2022
标签: ["标签1", "标签2", "标签3"]

这是书评正文...
可以有多段。

繁中版 (zh-TW)
書名: 繁體書名
作者: 作者名
原書名: Original Title
評分: 9.2/10
出版年: 2022
標籤: ["標籤1", "標籤2", "標籤3"]

這是書評正文...

日语版 (ja)
タイトル: 日本語タイトル
著者: 著者名
原題: Original Title
評点: 9.2/10
出版年: 2022
タグ: ["タグ1", "タグ2", "タグ3"]

日本語の書評本文...

英语版 (en)
Title: English Title
Author: Author Name
Original Title: Original Title
Score: 9.2/10
Publish Year: 2022
Tags: ["tag1", "tag2", "tag3"]

English review content...
```

### 2. 运行命令

```bash
npm run book:add new-book.md
```

或跳过确认快速添加：

```bash
npm run book:add:fast new-book.md
```

### 3. 完成！

脚本会自动完成：
- ✅ 创建 4 个 Markdown 文件（zh-CN, zh-TW, ja, en）
- ✅ 自动关联 relatedReviews
- ✅ 从 Amazon.sg 下载 4 个语言版本的封面
- ✅ 调整封面尺寸为 320x480（使用 sharp）
- ✅ 更新书籍清单
- 📝 提示生成截图命令

## 可用命令速查

### 书籍管理

| 命令 | 功能 | 示例 |
|------|------|------|
| `npm run book:add <file>` | 一键添加新书 | `npm run book:add book.md` |
| `npm run book:add:fast <file>` | 跳过确认快速添加 | `npm run book:add:fast book.md` |
| `npm run inventory` | 更新书籍清单 | - |

### 封面管理

| 命令 | 功能 | 示例 |
|------|------|------|
| `npm run cover:fetch "书名" "作者" "文件名" [ISBN]` | 下载单本封面 | `npm run cover:fetch "1984" "Orwell" "1984"` |
| `npm run covers:missing` | 检查缺失封面 | - |
| `npm run covers:fetch-all` | 批量下载缺失封面 | - |
| `npm run covers:resize` | 调整所有封面尺寸 | - |
| `npm run covers:resize:one <slug> [locale]` | 调整单个封面 | `npm run covers:resize:one babel` |
| `npm run covers:watch` | 监听新封面自动调整 | - |

### 截图生成

| 命令 | 功能 |
|------|------|
| `npm run screenshots:one <slug>` | 为单本书生成截图（自动启动服务器） |
| `npm run screenshots:generate` | 生成所有书评截图 |
| `npm run screenshots:incremental` | 只生成新增/修改的截图 |
| `npm run screenshots:force` | 强制重新生成所有截图 |

### 构建

| 命令 | 功能 |
|------|------|
| `npm run dev` | 启动开发服务器（含封面监听） |
| `npm run build` | 构建生产版本 |
| `npm run build:all` | 完整构建（调整封面+清单+构建） |

## 实际示例

### 添加新书《巴别塔》

```bash
# 1. 创建输入文件
cat > babel.md << 'EOF'
《巴别塔》(Babel, 2022) - R.F. Kuang
评分：9.2/10

简中版 (zh-CN)
书名: 巴别塔
作者: R.F. Kuang
原书名: Babel: Or the Necessity of Violence
评分: 9.2/10
出版年: 2022
标签: ["翻译即背叛", "帝国语言学", "白银魔法", "殖民暴力", "学术小说"]

这不是一部关于翻译的小说...

繁中版 (zh-TW)
...

日语版 (ja)
...

英语版 (en)
...
EOF

# 2. 一键添加
npm run book:add babel.md

# 3. 完成！
```

### 修复封面尺寸

```bash
# 调整单个书籍的所有封面
npm run covers:resize:one babel

# 只调整简中版
npm run covers:resize:one babel zh-CN

# 调整所有封面
npm run covers:resize
```

### 完整构建流程

```bash
# 一键完成所有构建步骤
npm run build:all

# 或分步执行
npm run covers:resize    # 1. 调整封面
npm run inventory        # 2. 更新清单
npm run build           # 3. 构建站点
```

## 封面命名规则

封面文件自动命名为：

```
{slug}{suffix}.jpg

后缀规则:
- 简体中文 (zh-CN): -sc
- 繁體中文 (zh-TW): -tc  
- 日本語 (ja): -ja
- English (en): (无后缀)

例如:
- babel-sc.jpg    # 简中
- babel-tc.jpg    # 繁中
- babel-ja.jpg    # 日语
- babel.jpg       # 英语
```

## 注意事项

1. **输入文件格式**
   - 第一行必须是：《书名》(English, Year) - Author
   - 标签使用 JSON 数组格式：["标签1", "标签2"]
   - 正文不需要标题，直接从内容开始

2. **封面下载**
   - 依赖 Amazon.sg，偶尔可能需要重试
   - 自动下载 4 个语言版本（使用不同搜索词）

3. **截图生成**
   - `npm run screenshots:one <slug>` 会自动启动服务器并生成截图
   - 使用 Playwright，首次运行可能需要安装浏览器（`npx playwright install chromium`）

4. **Sharp 图片处理**
   - 自动调整封面为 320x480px
   - 使用高质量 JPEG 压缩（quality: 85）

## 模板文件

参考完整模板：

```bash
cp scripts/examples/book-template.md my-new-book.md
# 编辑 my-new-book.md
npm run book:add my-new-book.md
```

## 故障排除

### 封面下载失败

```bash
# 手动下载单张封面
npm run cover:fetch "书名" "作者" "文件名"

# 或批量重试所有缺失
npm run covers:fetch-all
```

### 截图生成失败

```bash
# 确保开发服务器在运行
npm run dev

# 在新终端中运行
npm run screenshots:incremental
```

### Sharp 安装问题

```bash
# 如果 sharp 安装失败，尝试重新安装
npm install

# 或在 Windows 上可能需要 Python 和 Visual Studio Build Tools
```
