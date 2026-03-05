#!/usr/bin/env node
/**
 * 批量获取所有缺失的图书封面
 * 扫描 content/reviews 下的所有书评，为缺失封面的书籍自动下载
 * 
 * 使用方法:
 *   node scripts/fetch-all-covers.js
 *   node scripts/fetch-all-covers.js --dry-run    # 只检查，不下载
 *   node scripts/fetch-all-covers.js --lang=zh-CN # 只处理指定语言
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONTENT_DIR = path.join(process.cwd(), 'content', 'reviews');
const COVERS_DIR = path.join(process.cwd(), 'public', 'images', 'covers');
const LOCALES = ['zh-CN', 'zh-TW', 'ja', 'en'];

// 解析命令行参数
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const langFilter = args.find(arg => arg.startsWith('--lang='))?.split('=')[1];

/**
 * 获取所有书评文件
 */
function getAllReviews() {
  const reviews = [];
  
  const locales = langFilter ? [langFilter] : LOCALES;
  
  for (const locale of locales) {
    const localeDir = path.join(CONTENT_DIR, locale);
    if (!fs.existsSync(localeDir)) continue;
    
    const files = fs.readdirSync(localeDir)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        locale,
        slug: f.replace('.md', ''),
        filePath: path.join(localeDir, f)
      }));
    
    reviews.push(...files);
  }
  
  return reviews;
}

/**
 * 检查封面是否存在
 */
function hasCover(coverPath) {
  if (!coverPath) return false;
  const fullPath = path.join(process.cwd(), 'public', coverPath.replace(/^\//, ''));
  return fs.existsSync(fullPath);
}

/**
 * 从书评文件中提取元数据（简单版，不依赖 gray-matter）
 */
function getReviewMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 简单解析 front matter
  const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontMatterMatch) return {};
  
  const frontMatter = frontMatterMatch[1];
  const data = {};
  
  // 提取字段 - 支持带引号和不带引号的值
  const titleMatch = frontMatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const authorMatch = frontMatter.match(/^author:\s*["']?(.+?)["']?\s*$/m);
  const isbnMatch = frontMatter.match(/^isbn:\s*["']?(.+?)["']?\s*$/m);
  const coverMatch = frontMatter.match(/^cover:\s*["']?(.+?)["']?\s*$/m);
  
  if (titleMatch) data.title = titleMatch[1].trim().replace(/["']$/, '');
  if (authorMatch) data.author = authorMatch[1].trim().replace(/["']$/, '');
  if (isbnMatch) data.isbn = isbnMatch[1].trim().replace(/["']$/, '');
  if (coverMatch) data.cover = coverMatch[1].trim().replace(/["']$/, '');
  
  return data;
}

/**
 * 下载单个封面
 */
async function fetchCover(title, author, slug, isbn) {
  return new Promise((resolve, reject) => {
    const command = `node scripts/fetch-cover.js "${title.replace(/"/g, '\\"')}" "${author.replace(/"/g, '\\"')}" "${slug}" ${isbn ? `"${isbn}"` : ''}`;
    
    try {
      execSync(command, { 
        stdio: 'pipe',
        timeout: 60000 
      });
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('📚 批量获取图书封面\n');
  
  if (isDryRun) {
    console.log('⚠️  干运行模式：只检查，不下载\n');
  }
  
  const reviews = getAllReviews();
  console.log(`找到 ${reviews.length} 篇书评\n`);
  
  const missingCovers = [];
  const existingCovers = [];
  
  // 检查每个书评
  for (const review of reviews) {
    const meta = getReviewMetadata(review.filePath);
    if (hasCover(meta.cover)) {
      existingCovers.push(review);
    } else {
      missingCovers.push({ ...review, cover: meta.cover });
    }
  }
  
  console.log(`✅ 已有封面: ${existingCovers.length} 本`);
  console.log(`❌ 缺失封面: ${missingCovers.length} 本\n`);
  
  if (missingCovers.length === 0) {
    console.log('🎉 所有书籍都有封面！');
    return;
  }
  
  // 显示缺失封面的列表
  console.log('缺失封面的书籍:');
  missingCovers.forEach((review, i) => {
    const meta = getReviewMetadata(review.filePath);
    console.log(`  ${i + 1}. [${review.locale}] ${meta.title} by ${meta.author}`);
  });
  
  if (isDryRun) {
    console.log(`\n干运行完成。使用 node scripts/fetch-all-covers.js 开始下载`);
    return;
  }
  
  // 开始下载
  console.log(`\n🚀 开始下载 ${missingCovers.length} 个封面...\n`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < missingCovers.length; i++) {
    const review = missingCovers[i];
    const meta = getReviewMetadata(review.filePath);
    
    console.log(`\n[${i + 1}/${missingCovers.length}] ${meta.title}`);
    console.log(`    作者: ${meta.author}`);
    console.log(`    ISBN: ${meta.isbn || '无'}`);
    
    try {
      await fetchCover(meta.title, meta.author, review.slug, meta.isbn);
      success++;
    } catch (error) {
      console.error(`    ❌ 失败: ${error.message}`);
      failed++;
    }
    
    // 添加延迟，避免请求过快
    if (i < missingCovers.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log(`\n📊 完成!`);
  console.log(`   成功: ${success}`);
  console.log(`   失败: ${failed}`);
  
  if (failed > 0) {
    console.log(`\n💡 提示: 失败的封面可以手动搜索添加，或稍后重试`);
  }
}

main().catch(error => {
  console.error('错误:', error.message);
  process.exit(1);
});
