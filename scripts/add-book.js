#!/usr/bin/env node
/**
 * 一键添加新书到书评库
 * 
 * 使用方法:
 *   node scripts/add-book.js <input-file>
 *   node scripts/add-book.js <input-file> --yes  # 跳过确认
 *   
 * 输入文件格式: Markdown 格式，包含多语言书评内容
 * 示例见: scripts/examples/book-template.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

const CONTENT_DIR = path.join(process.cwd(), 'content', 'reviews');
const COVERS_DIR = path.join(process.cwd(), 'public', 'images', 'covers');
const SCREENSHOTS_DIR = path.join(process.cwd(), 'public', 'screenshots');

// 语言配置
const LOCALE_CONFIG = {
  'zh-CN': { name: '简体中文', suffix: '-sc' },
  'zh-TW': { name: '繁體中文', suffix: '-tc' },
  'ja': { name: '日本語', suffix: '-ja' },
  'en': { name: 'English', suffix: '' }
};

const TARGET_WIDTH = 320;
const TARGET_HEIGHT = 480;

/**
 * 解析输入文件
 */
function parseInputFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 提取基本信息（从第一行）
  const titleMatch = content.match(/《(.+?)》\s*\(([^,]+),\s*(\d{4})\)\s*-\s*(.+)/);
  if (!titleMatch) {
    throw new Error('无法解析标题行，格式应为: 《书名》(English Title, Year) - Author');
  }
  
  const [, chineseTitle, englishTitle, year, author] = titleMatch;
  
  // 提取评分
  const scoreMatch = content.match(/评分[：:]\s*(\d+\.?\d*)\/10/);
  const score = scoreMatch ? scoreMatch[1] : '';
  
  // 提取原书名
  const originalMatch = content.match(/原书名[：:]\s*(.+)/);
  const originalTitle = originalMatch ? originalMatch[1].trim() : englishTitle;
  
  // 生成 slug
  const slug = generateSlug(englishTitle);
  
  // 解析各语言版本
  const versions = {};
  
  // 简中版
  const zhCNMatch = content.match(/简中版 \(zh-CN\)([\s\S]*?)(?=繁中版|日语版|英语版|$)/);
  if (zhCNMatch) {
    versions['zh-CN'] = parseVersion(zhCNMatch[1], 'zh-CN');
  }
  
  // 繁中版
  const zhTWMatch = content.match(/繁中版 \(zh-TW\)([\s\S]*?)(?=简中版|日语版|英语版|$)/);
  if (zhTWMatch) {
    versions['zh-TW'] = parseVersion(zhTWMatch[1], 'zh-TW');
  }
  
  // 日语版
  const jaMatch = content.match(/日语版 \(ja\)([\s\S]*?)(?=简中版|繁中版|英语版|$)/);
  if (jaMatch) {
    versions['ja'] = parseVersion(jaMatch[1], 'ja');
  }
  
  // 英语版
  const enMatch = content.match(/英语版 \(en\)([\s\S]*?)(?=简中版|繁中版|日语版|$)/);
  if (enMatch) {
    versions['en'] = parseVersion(enMatch[1], 'en');
  }
  
  return {
    slug,
    englishTitle,
    chineseTitle,
    author,
    year,
    score,
    originalTitle,
    versions
  };
}

/**
 * 解析单个语言版本
 */
function parseVersion(content, locale) {
  const lines = content.trim().split('\n');
  const data = { content: [] };
  
  let inContent = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // 提取字段
    if (trimmed.startsWith('书名:') || trimmed.startsWith('書名:') || trimmed.startsWith('タイトル:') || trimmed.startsWith('Title:')) {
      data.title = trimmed.split(':')[1].trim();
    } else if (trimmed.startsWith('作者:') || trimmed.startsWith('著者:') || trimmed.startsWith('Author:')) {
      data.author = trimmed.split(':')[1].trim();
    } else if (trimmed.startsWith('原书名:') || trimmed.startsWith('原題:') || trimmed.startsWith('Original Title:')) {
      data.originalTitle = trimmed.split(':')[1].trim();
    } else if (trimmed.startsWith('评分:') || trimmed.startsWith('評分:') || trimmed.startsWith('評点:') || trimmed.startsWith('Score:')) {
      data.score = trimmed.match(/(\d+\.?\d*)/)?.[1] || '';
    } else if (trimmed.startsWith('出版年:') || trimmed.startsWith('出版年:') || trimmed.startsWith('出版年:') || trimmed.startsWith('Publish Year:')) {
      data.year = trimmed.match(/(\d{4})/)?.[1] || '';
    } else if (trimmed.startsWith('标签:') || trimmed.startsWith('標籤:') || trimmed.startsWith('タグ:') || trimmed.startsWith('Tags:')) {
      const tagsMatch = trimmed.match(/:\s*(.+)/);
      if (tagsMatch) {
        try {
          data.tags = JSON.parse(tagsMatch[1]);
        } catch {
          data.tags = tagsMatch[1].split(/[,，、]/).map(t => t.trim()).filter(Boolean);
        }
      }
    } else {
      // 开始正文内容（非元数据行）
      inContent = true;
      data.content.push(line);
    }
  }
  
  data.body = data.content.join('\n').trim();
  return data;
}

/**
 * 生成 slug
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
    .replace(/-+$/, '');
}

/**
 * 生成 Markdown 文件内容
 */
function generateMarkdown(baseInfo, version, locale) {
  const config = LOCALE_CONFIG[locale];
  const coverPath = `/images/covers/${baseInfo.slug}${config.suffix}.jpg`;
  
  // 构建 related reviews
  const related = Object.keys(LOCALE_CONFIG)
    .filter(l => l !== locale)
    .map(l => `${l}/${baseInfo.slug}`);
  
  const frontMatter = {
    title: version.title || baseInfo.englishTitle,
    author: version.author || baseInfo.author,
    originalTitle: version.originalTitle || baseInfo.originalTitle,
    cover: coverPath,
    score: version.score || baseInfo.score,
    year: version.year || baseInfo.year,
    tags: version.tags || [],
    summary: '',
    language: locale,
    relatedReviews: related
  };
  
  // 清理正文内容，移除会破坏 YAML front matter 的 --- 分隔线
  const cleanBody = version.body.replace(/^---$/gm, '').replace(/\n\n+/g, '\n\n').trim();
  
  // 提取 summary（第一段，限制150字符）
  const paragraphs = cleanBody.split('\n\n').filter(p => p.trim());
  if (paragraphs.length > 0) {
    const firstPara = paragraphs[0].replace(/[#*`]/g, '').trim();
    frontMatter.summary = firstPara.substring(0, 150) + (firstPara.length > 150 ? '...' : '');
  }
  
  // 构建 YAML front matter
  let yaml = '---\n';
  yaml += `title: "${frontMatter.title}"\n`;
  yaml += `author: "${frontMatter.author}"\n`;
  yaml += `originalTitle: "${frontMatter.originalTitle}"\n`;
  yaml += `cover: "${frontMatter.cover}"\n`;
  yaml += `score: ${frontMatter.score}\n`;
  yaml += `year: "${frontMatter.year}"\n`;
  yaml += `tags: ${JSON.stringify(frontMatter.tags)}\n`;
  yaml += `summary: "${frontMatter.summary.replace(/"/g, '\\"')}"\n`;
  yaml += `language: "${frontMatter.language}"\n`;
  yaml += `relatedReviews:\n`;
  for (const r of frontMatter.relatedReviews) {
    yaml += `  - "${r}"\n`;
  }
  yaml += '---\n\n';
  
  return yaml + cleanBody;
}

/**
 * 下载封面
 */
async function downloadCover(title, author, slug, locale) {
  const suffix = LOCALE_CONFIG[locale].suffix;
  const coverName = `${slug}${suffix}`;
  
  console.log(`  📥 下载 ${LOCALE_CONFIG[locale].name} 封面...`);
  
  try {
    const command = `node scripts/fetch-cover.js "${title.replace(/"/g, '\\"')}" "${author.replace(/"/g, '\\"')}" "${coverName}"`;
    execSync(command, { stdio: 'pipe', timeout: 60000 });
    console.log(`     ✅ 成功`);
    return true;
  } catch (error) {
    console.log(`     ⚠️  失败: ${error.message}`);
    return false;
  }
}

/**
 * 调整单个封面尺寸
 */
async function resizeCover(slug, locale) {
  const suffix = LOCALE_CONFIG[locale].suffix;
  const coverName = `${slug}${suffix}`;
  const inputPath = path.join(COVERS_DIR, `${coverName}.jpg`);
  const tempPath = path.join(COVERS_DIR, `.temp-${coverName}.jpg`);
  
  if (!fs.existsSync(inputPath)) {
    return false;
  }
  
  try {
    await sharp(inputPath)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(tempPath);
    
    fs.renameSync(tempPath, inputPath);
    return true;
  } catch (error) {
    console.error(`     调整尺寸失败: ${error.message}`);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法: node scripts/add-book.js <input-file> [--yes]');
    console.log('');
    console.log('输入文件示例格式:');
    console.log('《巴别塔》(Babel, 2022) - R.F. Kuang');
    console.log('评分：9.2/10');
    console.log('');
    console.log('简中版 (zh-CN)');
    console.log('书名: 巴别塔');
    console.log('...');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const skipConfirm = args.includes('--yes');
  
  if (!fs.existsSync(inputFile)) {
    console.error(`错误: 文件不存在 ${inputFile}`);
    process.exit(1);
  }
  
  console.log('📚 解析输入文件...\n');
  const bookData = parseInputFile(inputFile);
  
  console.log('📖 书籍信息:');
  console.log(`   书名: ${bookData.chineseTitle} / ${bookData.englishTitle}`);
  console.log(`   作者: ${bookData.author}`);
  console.log(`   年份: ${bookData.year}`);
  console.log(`   评分: ${bookData.score}/10`);
  console.log(`   Slug: ${bookData.slug}`);
  console.log(`   语言版本: ${Object.keys(bookData.versions).join(', ')}\n`);
  
  // 确认
  if (!skipConfirm) {
    console.log('按 Enter 继续，或 Ctrl+C 取消...');
    try {
      execSync('pause', { stdio: 'inherit' });
    } catch {
      process.exit(0);
    }
  }
  
  // 1. 创建 Markdown 文件
  console.log('\n📝 创建 Markdown 文件...');
  for (const [locale, version] of Object.entries(bookData.versions)) {
    const outputPath = path.join(CONTENT_DIR, locale, `${bookData.slug}.md`);
    
    // 确保目录存在
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const content = generateMarkdown(bookData, version, locale);
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`   ✅ ${LOCALE_CONFIG[locale].name}: content/reviews/${locale}/${bookData.slug}.md`);
  }
  
  // 2. 下载封面
  console.log('\n🖼️  下载封面...');
  let downloadedCount = 0;
  for (const [locale, version] of Object.entries(bookData.versions)) {
    const success = await downloadCover(
      version.title || bookData.englishTitle, 
      version.author || bookData.author, 
      bookData.slug, 
      locale
    );
    if (success) downloadedCount++;
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // 3. 调整封面尺寸
  if (downloadedCount > 0) {
    console.log('\n📐 调整封面尺寸...');
    for (const [locale] of Object.entries(bookData.versions)) {
      const success = await resizeCover(bookData.slug, locale);
      if (success) {
        console.log(`   ✅ ${LOCALE_CONFIG[locale].name}`);
      }
    }
  }
  
  // 4. 生成截图（必需步骤）
  console.log('\n📸 生成截图...');
  try {
    execSync(`node scripts/screenshot-with-server.js ${bookData.slug}`, { stdio: 'inherit' });
    console.log('   ✅ 截图生成完成');
  } catch (error) {
    console.log('   ⚠️  截图生成失败');
    console.log('   请手动运行: npm run screenshots:one ' + bookData.slug);
  }
  
  // 5. 更新清单
  console.log('\n📋 更新书籍清单...');
  try {
    execSync('npm run inventory', { stdio: 'pipe' });
    console.log('   ✅ 完成');
  } catch (error) {
    console.log('   ⚠️  更新清单失败');
  }
  
  console.log('\n✨ 全部完成!');
  console.log(`\n新书评已添加:`);
  for (const locale of Object.keys(bookData.versions)) {
    console.log(`  - http://localhost:3000/${locale}/review/${bookData.slug}`);
  }
  
  console.log('\n下一步:');
  console.log('  1. 运行 npm run dev 启动开发服务器');
  console.log('  2. 运行 npm run screenshots:generate 生成截图');
}

main().catch(error => {
  console.error('错误:', error.message);
  console.error(error.stack);
  process.exit(1);
});
