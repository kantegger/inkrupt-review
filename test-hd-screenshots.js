#!/usr/bin/env node

// 测试高清截图脚本
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testHDScreenshots() {
  console.log('🎬 Starting HD screenshot test...');
  
  // 测试3个不同语言的文件
  const testFiles = [
    {
      locale: 'en',
      slug: '1984',
      url: 'http://localhost:3000/en/review/1984',
      outputPath: '/Users/leoyu/inkrupt/public/screenshots/en/1984.png'
    },
    {
      locale: 'zh-CN',
      slug: '1984',
      url: 'http://localhost:3000/zh-CN/review/1984',
      outputPath: '/Users/leoyu/inkrupt/public/screenshots/zh-CN/1984.png'
    },
    {
      locale: 'ja',
      slug: 'the-unbearable-lightness-of-being',
      url: 'http://localhost:3000/ja/review/the-unbearable-lightness-of-being',
      outputPath: '/Users/leoyu/inkrupt/public/screenshots/ja/the-unbearable-lightness-of-being.png'
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
      
      console.log(`📸 Generating HD screenshot for: ${file.locale}/${file.slug}`);
      const success = await generateHDScreenshot(page, file);
      
      if (success) {
        successCount++;
        console.log(`✅ Successfully generated: ${file.outputPath}`);
      } else {
        failCount++;
        console.log(`❌ Failed to generate: ${file.locale}/${file.slug}`);
      }
      
    } catch (error) {
      failCount++;
      console.error(`💥 Error processing ${file.locale}/${file.slug}:`, error.message);
    }
  }
  
  await browser.close();
  
  console.log(`\\n🎉 HD screenshot test completed!`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
}

async function generateHDScreenshot(page, file) {
  try {
    // 设置高清视口 (1400x1000, 2x scale = 2800x2000 实际像素)
    await page.setViewportSize({ 
      width: 1400, 
      height: 1000, 
      deviceScaleFactor: 2 
    });
    
    // 导航到页面
    await page.goto(file.url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 隐藏不需要的元素并调整样式
    await page.evaluate(() => {
      // 隐藏菜单栏
      const header = document.querySelector('.header');
      if (header) header.style.display = 'none';
      
      // 隐藏操作按钮
      const actionButtons = document.querySelector('.action-buttons');
      if (actionButtons) actionButtons.style.display = 'none';
      
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
      if (footer) footer.style.display = 'none';
    });
    
    await page.waitForTimeout(500);
    
    // 截图
    const articleElement = page.locator('.article');
    
    if (await articleElement.count() === 0) {
      throw new Error('Article element not found');
    }
    
    await articleElement.screenshot({
      path: file.outputPath,
      type: 'png'
    });
    
    console.log(`  ✓ Saved: ${file.outputPath}`);
    return true;
    
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return false;
  }
}

testHDScreenshots().catch(console.error);