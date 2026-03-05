#!/usr/bin/env node

/**
 * 增量截图生成脚本
 * 只为缺失的截图文件生成新截图，不覆盖已存在的文件
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  baseUrl: process.env.SCREENSHOT_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  screenshotDir: path.join(process.cwd(), 'public', 'screenshots'),
  contentDir: path.join(process.cwd(), 'content', 'reviews'),
  // 统一截图配置（高清）
  viewport: { width: 1400, height: 1000, deviceScaleFactor: 2 }
};

// 语言配置
const LOCALES = ['en', 'ja', 'zh-CN', 'zh-TW'];

/**
 * 获取所有需要处理的书评文件
 */
function getAllReviewFiles() {
  const reviews = [];
  
  for (const locale of LOCALES) {
    const localeDir = path.join(CONFIG.contentDir, locale);
    if (!fs.existsSync(localeDir)) continue;
    
    const files = fs.readdirSync(localeDir)
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        locale,
        slug: file.replace('.md', ''),
        filePath: path.join(localeDir, file),
        url: `${CONFIG.baseUrl}/${locale}/review/${file.replace('.md', '')}`,
        outputPath: path.join(CONFIG.screenshotDir, locale, `${file.replace('.md', '')}.png`)
      }));
    
    reviews.push(...files);
  }
  
  return reviews;
}

/**
 * 获取缺失截图的文件列表
 */
function getMissingScreenshots(reviews) {
  return reviews.filter(review => !fs.existsSync(review.outputPath));
}

/**
 * 确保目录存在
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 等待页面完全加载
 */
async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle');
  // 额外等待确保图片和字体加载完成
  await page.waitForTimeout(2000);
}

/**
 * 为单个页面生成截图
 */
async function generateScreenshotForPage(page, review) {
  try {
    console.log(`📸 Generating screenshot for: ${review.locale}/${review.slug}`);
    
    // 设置高清视口
    await page.setViewportSize(CONFIG.viewport);
    
    // 导航到页面
    await page.goto(review.url, { waitUntil: 'networkidle' });
    
    // 等待页面完全加载
    await waitForPageLoad(page);
    
    // 隐藏不需要在截图中显示的元素并调整样式
    await page.evaluate(() => {
      // 隐藏菜单栏
      const header = document.querySelector('.header');
      if (header) {
        header.style.display = 'none';
      }
      
      // 隐藏操作按钮
      const actionButtons = document.querySelector('.action-buttons');
      if (actionButtons) {
        actionButtons.style.display = 'none';
      }
      
      // 调整article容器样式
      const article = document.querySelector('.article');
      if (article) {
        article.style.paddingTop = '2rem';
      }
      
      // 临时调整文字大小以提高截图清晰度
      const style = document.createElement('style');
      style.textContent = `
        /* 正文内容字体放大 */
        .article .prose {
          font-size: 1.3rem !important;
          line-height: 1.75 !important;
        }
        .article .prose h2 {
          font-size: 1.9rem !important;
        }
        .article .prose h3 {
          font-size: 1.6rem !important;
        }
        .article .prose p {
          font-size: 1.3rem !important;
          line-height: 1.75 !important;
        }
        /* 封面区域保持合适大小 */
        .article h1 {
          font-size: 2.2rem !important;
        }
        .article .author {
          font-size: 1.05rem !important;
        }
        .article .score {
          font-size: 1.05rem !important;
        }
        .article .tags .tag {
          font-size: 0.85rem !important;
        }
        .article .summary {
          font-size: 1rem !important;
        }
        .affiliate-buttons .affiliate-button {
          font-size: 0.9rem !important;
        }
        .affiliate-disclaimer {
          font-size: 0.85rem !important;
        }
      `;
      document.head.appendChild(style);
      
      // 隐藏页脚
      const footer = document.querySelector('.footer');
      if (footer) {
        footer.style.display = 'none';
      }
    });
    
    // 等待样式生效
    await page.waitForTimeout(500);
    
    // 查找文章容器
    const articleElement = page.locator('.article');
    if (await articleElement.count() === 0) {
      throw new Error('Article element not found');
    }
    
    // 生成高清截图
    ensureDirectoryExists(path.dirname(review.outputPath));
    
    await articleElement.screenshot({
      path: review.outputPath,
      type: 'png'
    });
    
    console.log(`✓ Screenshot saved: ${review.outputPath}`);
    return true;
    
  } catch (error) {
    console.error(`✗ Failed to generate screenshot for ${review.locale}/${review.slug}:`, error.message);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  const startTime = Date.now();
  
  console.log('🎬 Starting incremental screenshot generation...');
  
  // 获取所有书评文件
  const allReviews = getAllReviewFiles();
  console.log(`Found ${allReviews.length} review files`);
  
  // 检查哪些截图缺失
  const missingReviews = getMissingScreenshots(allReviews);
  
  if (missingReviews.length === 0) {
    console.log('✅ All screenshots already exist! No new screenshots needed.');
    return;
  }
  
  console.log(`📸 Need to generate ${missingReviews.length} missing screenshots:`);
  missingReviews.forEach(review => {
    console.log(`  - ${review.locale}/${review.slug}`);
  });
  
  // 启动浏览器
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // 设置默认字体以确保一致性
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
      `;
      document.head.appendChild(style);
    });
    
    let successCount = 0;
    let failCount = 0;
    
    // 处理缺失的截图
    for (const review of missingReviews) {
      try {
        const success = await generateScreenshotForPage(page, review);
        
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
        
      } catch (error) {
        console.error(`Error processing ${review.locale}/${review.slug}:`, error.message);
        failCount++;
      }
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎉 Incremental screenshot generation completed in ${elapsed}s`);
    console.log(`✓ Success: ${successCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log(`📊 Total screenshots now: ${allReviews.length - missingReviews.length + successCount}/${allReviews.length}`);
    
  } finally {
    await browser.close();
  }
}

/**
 * 单独生成指定书评的截图
 */
async function generateSingle(locale, slug) {
  const startTime = Date.now();
  
  console.log(`🎬 Generating screenshot for: ${locale}/${slug}`);
  
  const review = {
    locale,
    slug,
    url: `${CONFIG.baseUrl}/${locale}/review/${slug}`,
    outputPath: path.join(CONFIG.screenshotDir, locale, `${slug}.png`)
  };
  
  // 启动浏览器
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // 设置默认字体以确保一致性
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
      `;
      document.head.appendChild(style);
    });
    
    const success = await generateScreenshotForPage(page, review);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (success) {
      console.log(`🎉 Screenshot generated successfully in ${elapsed}s`);
    } else {
      console.log(`❌ Screenshot generation failed in ${elapsed}s`);
    }
    
  } finally {
    await browser.close();
  }
}

// 检查是否需要安装依赖
function checkDependencies() {
  try {
    require('playwright');
  } catch (error) {
    console.error('❌ Playwright is not installed. Please run: npm install playwright');
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  checkDependencies();
  
  // 支持单个文件生成：node script.js locale slug
  if (process.argv.length === 4) {
    const locale = process.argv[2];
    const slug = process.argv[3];
    generateSingle(locale, slug).catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
  } else {
    main().catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
  }
}

module.exports = { main, generateSingle, getAllReviewFiles, getMissingScreenshots };