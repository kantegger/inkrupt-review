#!/usr/bin/env node
/**
 * 自动启动服务器并生成截图
 * 用法: node scripts/screenshot-with-server.js <slug>
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const slug = process.argv[2];
if (!slug) {
  console.log('用法: node scripts/screenshot-with-server.js <slug>');
  process.exit(1);
}

const LOCALES = ['zh-CN', 'zh-TW', 'ja', 'en'];
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  screenshotDir: path.join(process.cwd(), 'public', 'screenshots'),
  viewport: { width: 1400, height: 1000, deviceScaleFactor: 2 }
};

// 检查服务器是否就绪
async function waitForServer(url, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // 继续等待
    }
    process.stdout.write(`\r   等待服务器启动... (${i + 1}/${maxAttempts})`);
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function generateScreenshot(browser, locale, slug, retryCount = 0) {
  const url = `${CONFIG.baseUrl}/${locale}/review/${slug}`;
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
    // 增加超时时间
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // 隐藏不需要的元素
    await page.evaluate(() => {
      const header = document.querySelector('.header, header');
      if (header) header.style.display = 'none';
      const actionButtons = document.querySelector('.action-buttons');
      if (actionButtons) actionButtons.style.display = 'none';
      const footer = document.querySelector('.footer, footer');
      if (footer) footer.style.display = 'none';
      
      const style = document.createElement('style');
      style.textContent = `
        .prose, .prose p { font-size: 1.3rem !important; line-height: 1.75 !important; }
        .prose h2 { font-size: 1.9rem !important; }
        .prose h3 { font-size: 1.6rem !important; }
      `;
      document.head.appendChild(style);
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
    
    // 重试一次
    if (retryCount < 1) {
      console.log(`     🔄 重试...`);
      await new Promise(r => setTimeout(r, 2000));
      return generateScreenshot(browser, locale, slug, retryCount + 1);
    }
    
    return false;
  }
}

async function main() {
  console.log(`🎬 为 ${slug} 生成截图\n`);
  
  // 检查是否已有截图
  let existingCount = 0;
  for (const locale of LOCALES) {
    const outputPath = path.join(CONFIG.screenshotDir, locale, `${slug}.png`);
    if (fs.existsSync(outputPath)) {
      existingCount++;
    }
  }
  
  if (existingCount === LOCALES.length) {
    console.log('所有截图已存在，跳过生成\n');
    return;
  }
  
  console.log(`需要生成: ${LOCALES.length - existingCount} 个截图\n`);
  
  // 启动开发服务器
  console.log('🚀 启动开发服务器...');
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true,
    detached: false
  });
  
  // 等待服务器就绪
  const ready = await waitForServer(CONFIG.baseUrl);
  console.log('');
  
  if (!ready) {
    console.error('❌ 服务器启动超时');
    server.kill();
    process.exit(1);
  }
  
  console.log('   ✅ 服务器已就绪\n');
  
  // 生成截图
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  } catch (error) {
    console.error('❌ 浏览器启动失败:', error.message);
    server.kill();
    process.exit(1);
  }
  
  let success = 0;
  let failed = 0;
  
  for (const locale of LOCALES) {
    const result = await generateScreenshot(browser, locale, slug);
    if (result) success++;
    else failed++;
  }
  
  await browser.close();
  
  // 关闭服务器
  console.log('\n🛑 关闭服务器...');
  server.kill('SIGTERM');
  
  // 等待服务器关闭
  await new Promise(r => setTimeout(r, 2000));
  
  console.log(`\n📊 完成: ${success} 成功, ${failed} 失败, ${existingCount} 已存在`);
  
  if (failed > 0) process.exit(1);
}

main().catch(error => {
  console.error('错误:', error.message);
  process.exit(1);
});
