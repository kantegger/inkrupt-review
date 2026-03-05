#!/usr/bin/env node

// 测试单个截图的脚本
const { chromium } = require('playwright');

async function testSingleScreenshot() {
  const browser = await chromium.launch({ headless: false }); // 可视化调试
  const page = await browser.newPage();
  
  // 设置视口
  await page.setViewportSize({ width: 1200, height: 800 });
  
  // 导航到页面
  await page.goto('http://localhost:3000/en/review/1984');
  
  // 等待页面加载
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // 隐藏不需要的元素
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
    
    // 确保article容器有足够的上边距
    const article = document.querySelector('.article');
    if (article) {
      article.style.paddingTop = '2rem';
    }
    
    // 隐藏页脚
    const footer = document.querySelector('.footer');
    if (footer) {
      footer.style.display = 'none';
    }
  });
  
  // 等待一下让样式生效
  await page.waitForTimeout(1000);
  
  // 截取article元素
  const articleElement = page.locator('.article');
  await articleElement.screenshot({
    path: 'test-screenshot.png',
    type: 'png'
  });
  
  console.log('Test screenshot saved as test-screenshot.png');
  
  await browser.close();
}

testSingleScreenshot().catch(console.error);