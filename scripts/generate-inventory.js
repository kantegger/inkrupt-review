#!/usr/bin/env node
/**
 * 生成现有书籍清单 Markdown 文件
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(process.cwd(), 'content', 'reviews');
const LOCALES = ['zh-CN', 'zh-TW', 'ja', 'en'];
const LOCALE_NAMES = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'ja': '日本語',
  'en': 'English'
};

function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  
  const fm = match[1];
  const data = {};
  
  const extract = (field) => {
    const m = fm.match(new RegExp('^' + field + ':\\s*["\']?(.+?)["\']?\\s*$', 'm'));
    return m ? m[1].trim().replace(/["\']$/, '') : null;
  };
  
  data.title = extract('title');
  data.author = extract('author');
  data.originalTitle = extract('originalTitle');
  data.isbn = extract('isbn');
  data.year = extract('year');
  data.score = extract('score');
  data.cover = extract('cover');
  data.summary = extract('summary');
  
  // 提取 tags
  const tagsMatch = fm.match(/^tags:\s*\[([^\]]*)\]/m);
  if (tagsMatch) {
    data.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/["']/g, '')).filter(Boolean);
  } else {
    data.tags = [];
  }
  
  return data;
}

function hasCover(coverPath) {
  if (!coverPath) return false;
  const fullPath = path.join(process.cwd(), 'public', coverPath.replace(/^\//, ''));
  return fs.existsSync(fullPath);
}

// 收集所有书籍数据
const books = [];

for (const locale of LOCALES) {
  const dir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(dir)) continue;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const data = parseFrontMatter(content);
    
    if (data.title) {
      books.push({
        slug: file.replace('.md', ''),
        locale,
        ...data
      });
    }
  }
}

// 按 slug 分组
const grouped = {};
for (const book of books) {
  if (!grouped[book.slug]) {
    grouped[book.slug] = {
      slug: book.slug,
      locales: {},
      coverPath: book.cover,
      hasCover: hasCover(book.cover)
    };
  }
  grouped[book.slug].locales[book.locale] = book;
  // 如果当前语言版本有封面信息，更新封面路径
  if (book.cover && !grouped[book.slug].coverPath) {
    grouped[book.slug].coverPath = book.cover;
  }
}

// 计算统计信息
const totalUnique = Object.keys(grouped).length;
const withCover = Object.values(grouped).filter(g => g.hasCover).length;
const withoutCover = totalUnique - withCover;

const byLocale = {};
for (const locale of LOCALES) {
  byLocale[locale] = books.filter(b => b.locale === locale).length;
}

// 生成 Markdown
let md = `# Inkrupt 书评库清单\n\n`;
md += `> 自动生成于 ${new Date().toISOString().split('T')[0]}\n\n`;

// 统计概览
md += `## 📊 统计概览\n\n`;
md += `- **独立书籍总数**: ${totalUnique} 本\n`;
md += `- **有封面**: ${withCover} 本 ✅\n`;
md += `- **缺失封面**: ${withoutCover} 本 ❌\n`;
md += `- **书评总篇数**: ${books.length} 篇（含多语言）\n\n`;
md += `### 按语言分布\n\n`;
for (const [locale, count] of Object.entries(byLocale)) {
  md += `- ${LOCALE_NAMES[locale]} (${locale}): ${count} 篇\n`;
}
md += `\n`;

// 书籍列表
md += `## 📚 书籍清单\n\n`;
md += `按字母顺序排列，共 ${totalUnique} 本书\n\n`;

// 排序 slug
const sortedSlugs = Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

for (const slug of sortedSlugs) {
  const book = grouped[slug];
  const firstLocale = Object.keys(book.locales)[0];
  const firstData = book.locales[firstLocale];
  
  md += `### ${firstData.title}\n\n`;
  md += `- **Slug**: \`${slug}\`\n`;
  md += `- **封面**: ${book.hasCover ? '✅' : '❌'}`;
  if (book.coverPath) {
    md += ` (\`${book.coverPath}\`)`;
  }
  md += `\n`;
  
  // 多语言标题
  md += `- **多语言版本**:\n`;
  for (const locale of LOCALES) {
    if (book.locales[locale]) {
      const data = book.locales[locale];
      md += `  - ${LOCALE_NAMES[locale]}: *${data.title}* - ${data.author}\n`;
      if (data.score) md += `    - 评分: ${data.score}/10\n`;
      if (data.year) md += `    - 出版: ${data.year}\n`;
      if (data.isbn) md += `    - ISBN: \`${data.isbn}\`\n`;
    }
  }
  
  md += `\n`;
}

// 缺失封面的列表
if (withoutCover > 0) {
  md += `## ❌ 缺失封面的书籍\n\n`;
  md += `需要运行 \`npm run cover:fetch\` 下载以下封面：\n\n`;
  
  const missingCovers = Object.values(grouped).filter(g => !g.hasCover);
  for (const book of missingCovers) {
    const firstLocale = Object.keys(book.locales)[0];
    const firstData = book.locales[firstLocale];
    const coverInfo = book.coverPath ? `(期望路径: ${book.coverPath})` : '(未指定封面路径)';
    md += `- \`${book.slug}\` - ${firstData.title} by ${firstData.author} ${coverInfo}\n`;
  }
  md += `\n`;
}

// 快速命令参考
md += `## 🔧 快速命令\n\n`;
md += `\`\`\`bash\n`;
md += `# 下载单本封面\nnpm run cover:fetch "书名" "作者" "${sortedSlugs[0]}"\n\n`;
md += `# 检查缺失封面\nnpm run covers:missing\n\n`;
md += `# 批量下载所有缺失封面\nnpm run covers:fetch-all\n`;
md += `\`\`\`\n`;

// 写入文件
const outputPath = path.join(process.cwd(), 'BOOK_INVENTORY.md');
fs.writeFileSync(outputPath, md, 'utf8');

console.log(`✅ 清单已生成: ${outputPath}`);
console.log(`   总计: ${totalUnique} 本书, ${books.length} 篇书评`);
console.log(`   有封面: ${withCover}, 缺失: ${withoutCover}`);
