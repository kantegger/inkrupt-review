#!/usr/bin/env node
/**
 * 使用静态文件生成截图
 * 用法: node scripts/screenshot-static.js <slug>
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const slug = process.argv[2];
if (!slug) {
  console.log('用法: node scripts/screenshot-static.js <slug>');
  process.exit(1);
}

const LOCALES = ['zh-CN', 'zh-TW', 'ja', 'en'];
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  screenshotDir: path.join(process.cwd(), 'public', 'screenshots'),
  viewport: { width: 1400, height: 1000, deviceScaleFactor: 2 }
};

async function generateScreenshot(browser, locale, slug) {
  const url = `${CONFIG.baseUrl}/${locale}/review/${slug}.html`;
  const outputPath = path.join(CONFIG.screenshotDir, locale, `${slug}.png`);
  
  console.log(`  📸 [${locale}] ${slug}`);
  
  // 检查是否已存在
  if (fs.existsSync(outputPath)) {
    console.log(`     ✅ 已存在`);
    return true;
  }
  
  const context = await browser.newContext({ viewport: CONFIG.viewport });
  const page = await context.newPage();
  
  try {
    // 直接读取文件
    const filePath = path.join(process.cwd(), 'out', locale, 'review', `${slug}.html`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const fileUrl = 'file://' + filePath.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    
    // 隐藏不需要的元素
    await page.evaluate(() => {
      const header = document.querySelector('.header, header');
      if (header) header.style.display = 'none';
      const actionButtons = document.querySelector('.action-buttons');
      if (actionButtons) actionButtons.style.display = 'none';
      const footer = document.querySelector('.footer, footer');
      if (footer) footer.style.display = 'none';
    });
    
    await page.waitForTimeout(500);
    
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    // 尝试多种选择器
    let element = await page.$('article');
    if (!element) element = await page.$('.article');
    if (!element) element = await page.$('main');
    if (!element) element = await page.$('body');
    
    if (!element) {
      throw new Error('No suitable element found');
    }
    
    await element.screenshot({ path: outputPath, type: 'png' });
    console.log(`     ✅ 保存: public/screenshots/${locale}/${slug}.png`);
    
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
  
  if (failed > 0) process.exit(1);
}

main().catch(error => {
  console.error('错误:', error.message);
  process.exit(1);
});
