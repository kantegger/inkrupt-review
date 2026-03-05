#!/usr/bin/env node
/**
 * 为单个书籍生成截图（独立运行，不依赖外部服务器）
 * 用法: node scripts/screenshot-one.js <slug>
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const slug = process.argv[2];

if (!slug) {
  console.log('用法: node scripts/screenshot-one.js <slug>');
  process.exit(1);
}

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  screenshotDir: path.join(process.cwd(), 'public', 'screenshots'),
  viewport: { width: 1400, height: 1000, deviceScaleFactor: 2 }
};

const LOCALES = ['zh-CN', 'zh-TW', 'ja', 'en'];

async function generateScreenshot(browser, locale, slug) {
  const url = `${CONFIG.baseUrl}/${locale}/review/${slug}`;
  const outputPath = path.join(CONFIG.screenshotDir, locale, `${slug}.png`);
  
  console.log(`  📸 [${locale}] ${url}`);
  
  const context = await browser.newContext({
    viewport: CONFIG.viewport
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // 隐藏不需要的元素
    await page.evaluate(() => {
      const header = document.querySelector('.header');
      if (header) header.style.display = 'none';
      const actionButtons = document.querySelector('.action-buttons');
      if (actionButtons) actionButtons.style.display = 'none';
      const footer = document.querySelector('.footer');
      if (footer) footer.style.display = 'none';
    });
    
    // 确保目录存在
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const article = await page.locator('.article');
    if (await article.count() === 0) {
      throw new Error('Article element not found');
    }
    
    await article.screenshot({ path: outputPath, type: 'png' });
    console.log(`     ✅ 保存: ${outputPath}`);
    
    await context.close();
    return true;
  } catch (error) {
    console.log(`     ❌ 失败: ${error.message}`);
    await context.close();
    return false;
  }
}

async function main() {
  console.log(`🎬 为 ${slug} 生成截图\n`);
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  let success = 0;
  let failed = 0;
  
  for (const locale of LOCALES) {
    const result = await generateScreenshot(browser, locale, slug);
    if (result) success++;
    else failed++;
  }
  
  await browser.close();
  
  console.log(`\n📊 完成: ${success} 成功, ${failed} 失败`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('错误:', error.message);
  process.exit(1);
});
