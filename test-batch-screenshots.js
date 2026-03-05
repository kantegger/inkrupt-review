#!/usr/bin/env node

// 测试批量截图脚本（限制文件数量）
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testBatchScreenshots() {
  console.log('🎬 Starting test batch screenshot generation...');
  
  // 限制只处理前3个英文文件
  const testFiles = [
    {
      locale: 'en',
      slug: '1984',
      url: 'http://localhost:3000/en/review/1984',
      outputPath: '/Users/leoyu/inkrupt/public/screenshots/en/1984.png',
      mobileOutputPath: '/Users/leoyu/inkrupt/public/screenshots/en/1984-mobile.png'
    },
    {
      locale: 'en', 
      slug: 'the-book-thief',
      url: 'http://localhost:3000/en/review/the-book-thief',
      outputPath: '/Users/leoyu/inkrupt/public/screenshots/en/the-book-thief.png',
      mobileOutputPath: '/Users/leoyu/inkrupt/public/screenshots/en/the-book-thief-mobile.png'
    },
    {
      locale: 'zh-CN',
      slug: '1984', 
      url: 'http://localhost:3000/zh-CN/review/1984',
      outputPath: '/Users/leoyu/inkrupt/public/screenshots/zh-CN/1984.png',
      mobileOutputPath: '/Users/leoyu/inkrupt/public/screenshots/zh-CN/1984-mobile.png'
    }
  ];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of testFiles) {
    try {
      // 确保目录存在
      const dir = path.dirname(file.outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // 桌面版截图
      console.log(`📸 Generating desktop screenshot for: ${file.locale}/${file.slug}`);
      const desktopSuccess = await generateScreenshot(page, file, true);
      
      // 移动版截图  
      console.log(`📱 Generating mobile screenshot for: ${file.locale}/${file.slug}`);
      const mobileSuccess = await generateScreenshot(page, file, false);
      
      if (desktopSuccess && mobileSuccess) {
        successCount++;
        console.log(`✅ Successfully generated screenshots for ${file.locale}/${file.slug}`);
      } else {
        failCount++;
        console.log(`❌ Failed to generate screenshots for ${file.locale}/${file.slug}`);
      }
      
    } catch (error) {
      failCount++;
      console.error(`💥 Error processing ${file.locale}/${file.slug}:`, error.message);
    }
  }
  
  await browser.close();
  
  console.log(`\n🎉 Test completed!`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
}

async function generateScreenshot(page, file, isDesktop) {
  try {
    // 设置视口
    const viewport = isDesktop 
      ? { width: 1200, height: 800 }
      : { width: 800, height: 812 };
    await page.setViewportSize(viewport);
    
    // 导航到页面
    await page.goto(file.url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 隐藏不需要的元素
    await page.evaluate(() => {
      // 隐藏菜单栏
      const header = document.querySelector('.header');
      if (header) header.style.display = 'none';
      
      // 隐藏操作按钮
      const actionButtons = document.querySelector('.action-buttons');
      if (actionButtons) actionButtons.style.display = 'none';
      
      // 确保article容器有足够的上边距
      const article = document.querySelector('.article');
      if (article) article.style.paddingTop = '2rem';
      
      // 隐藏页脚
      const footer = document.querySelector('.footer');
      if (footer) footer.style.display = 'none';
    });
    
    await page.waitForTimeout(500);
    
    // 截图
    const outputPath = isDesktop ? file.outputPath : file.mobileOutputPath;
    const articleElement = page.locator('.article');
    
    if (await articleElement.count() === 0) {
      throw new Error('Article element not found');
    }
    
    await articleElement.screenshot({
      path: outputPath,
      type: 'png'
    });
    
    console.log(`  ✓ Saved: ${outputPath}`);
    return true;
    
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return false;
  }
}

testBatchScreenshots().catch(console.error);