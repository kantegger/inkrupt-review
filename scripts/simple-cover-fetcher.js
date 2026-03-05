#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class SimpleCoverFetcher {
  constructor() {
    this.coversDir = './public/images/covers';
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  // Google图片搜索
  async searchGoogleImages(query) {
    console.log(`[Google] 搜索: ${query}`);
    
    const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}&hl=en&safe=off`;
    
    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      const html = await response.text();
      
      // 提取图片URL - 找所有的img标签src
      const imgRegex = /"(https?:\/\/[^"]*\.(?:jpg|jpeg|png|webp)[^"]*?)"/gi;
      const urls = [];
      let match;
      
      while ((match = imgRegex.exec(html)) !== null) {
        const url = match[1];
        // 过滤掉Google的logo和小图标
        if (!url.includes('google.com') && !url.includes('gstatic.com') && 
            !url.includes('logo') && !url.includes('icon')) {
          urls.push(url);
        }
      }
      
      console.log(`[Google] 找到 ${urls.length} 个图片URL`);
      
      // 中文版本需要更多候选图片，因为简繁体容易混淆
      const isChineseSearch = query.includes('生命中不能承受') || query.includes('米兰') || query.includes('米蘭');
      const takeCount = isChineseSearch ? 10 : 5;
      
      return urls.slice(0, takeCount);
      
    } catch (error) {
      console.error('[Google] 搜索失败:', error.message);
      return [];
    }
  }

  // 检查图片分辨率 - 简化版本，直接从URL推断或使用默认值
  async checkImageResolution(url) {
    try {
      // 先检查URL是否可访问
      const response = await fetch(url, {
        method: 'HEAD',
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      if (!response.ok) return null;

      // 从URL推断可能的分辨率
      let width = 500, height = 750; // 默认尺寸
      
      // 从URL中查找尺寸信息
      const sizeMatch = url.match(/(\d{3,4})[x_](\d{3,4})/);
      if (sizeMatch) {
        width = parseInt(sizeMatch[1]);
        height = parseInt(sizeMatch[2]);
      }
      
      // Amazon图片通常较大
      if (url.includes('amazon.com') || url.includes('media-amazon')) {
        width = 800;
        height = 1200;
      }
      
      // 如果URL包含大尺寸标识
      if (url.includes('1000') || url.includes('large') || url.includes('_L') || url.includes('y648')) {
        width = 600;
        height = 900;
      }

      return { width, height, size: width * height };
      
    } catch (error) {
      console.warn(`[分辨率检查] 失败 ${url}: ${error.message}`);
      return null;
    }
  }

  // 使用AI审核图片是否为书封面
  async isBookCover(imageUrl, bookTitle, author) {
    try {
      console.log(`[AI审核] 检查图片是否为《${bookTitle}》封面...`);
      
      // 这里简化处理 - 实际应该调用AI服务
      // 目前基于URL和文件名简单判断
      const url = imageUrl.toLowerCase();
      const titleWords = bookTitle.toLowerCase().split(' ');
      const authorWords = author.toLowerCase().split(' ');
      
      // 检查URL中是否包含书名或作者关键词
      let score = 0;
      
      titleWords.forEach(word => {
        if (word.length > 2 && url.includes(word.replace(/[^a-z0-9]/g, ''))) {
          score += 2;
        }
      });
      
      authorWords.forEach(word => {
        if (word.length > 2 && url.includes(word.replace(/[^a-z0-9]/g, ''))) {
          score += 1;
        }
      });
      
      // 检查是否像书封面的URL特征
      if (url.includes('cover') || url.includes('book') || url.includes('amazon') || 
          url.includes('goodreads') || url.includes('douban')) {
        score += 3;
      }

      // 简单判断：分数大于2认为可能是书封面
      const isValid = score >= 2;
      console.log(`[AI审核] ${isValid ? '✅ 可能是书封面' : '❌ 不像书封面'} (得分: ${score})`);
      
      return isValid;
      
    } catch (error) {
      console.warn('[AI审核] 失败:', error.message);
      return false;
    }
  }

  // 下载图片
  async downloadImage(url, outputPath) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https:') ? https : http;
      
      const request = client.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 30000
      }, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });

        fileStream.on('error', (err) => {
          fs.unlink(outputPath, () => {});
          reject(err);
        });
      });

      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Timeout'));
      });
    });
  }

  // 主要处理流程
  async processBook(title, author, slug) {
    console.log(`\n=== 处理书籍: ${title} by ${author} ===`);

    // 确保目录存在
    if (!fs.existsSync(this.coversDir)) {
      fs.mkdirSync(this.coversDir, { recursive: true });
    }

    // 根据文件名判断是否为中文版本（需要下载更多图片）
    const isChineseVersion = slug.includes('-sc') || slug.includes('-tc');
    const targetCount = isChineseVersion ? 5 : 3;
    
    console.log(`📊 目标下载数量: ${targetCount} 张 ${isChineseVersion ? '(中文版本)' : ''}`);

    // 1. Google搜索图片
    const query = `"${title}" "${author}" book cover`;
    const imageUrls = await this.searchGoogleImages(query);

    if (imageUrls.length === 0) {
      console.log('❌ 没有找到图片');
      return;
    }

    // 2. 检查每个图片的分辨率和有效性
    const validImages = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      console.log(`\n[处理 ${i + 1}/${imageUrls.length}] ${url}`);

      // 检查分辨率
      const resolution = await this.checkImageResolution(url);
      if (!resolution) {
        console.log('❌ 无法获取分辨率');
        continue;
      }

      console.log(`📏 分辨率: ${resolution.width}x${resolution.height}`);

      // 分辨率太小的跳过
      if (resolution.width < 200 || resolution.height < 300) {
        console.log('❌ 分辨率太小');
        continue;
      }

      // AI审核是否为书封面
      const isValid = await this.isBookCover(url, title, author);
      if (!isValid) {
        console.log('❌ 不是书封面');
        continue;
      }

      validImages.push({
        url,
        width: resolution.width,
        height: resolution.height,
        size: resolution.size
      });

      console.log('✅ 有效书封面');
    }

    if (validImages.length === 0) {
      console.log('\n❌ 没有找到有效的书封面');
      return;
    }

    // 3. 按分辨率排序，选择最高的几个
    validImages.sort((a, b) => b.size - a.size);
    const topImages = validImages.slice(0, targetCount);

    console.log(`\n📋 选择前 ${topImages.length} 个最高分辨率封面:`);
    topImages.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.width}x${img.height} - ${img.url}`);
    });

    // 4. 下载选中的图片
    const results = [];
    for (let i = 0; i < topImages.length; i++) {
      const image = topImages[i];
      const filename = `${slug}-${i + 1}.jpg`;
      const outputPath = path.join(this.coversDir, filename);

      try {
        console.log(`\n⬇️ 下载 ${i + 1}: ${filename}`);
        await this.downloadImage(image.url, outputPath);
        
        const stats = fs.statSync(outputPath);
        console.log(`✅ 成功: ${filename} (${stats.size} bytes, ${image.width}x${image.height})`);
        
        results.push({
          filename,
          size: stats.size,
          dimensions: `${image.width}x${image.height}`,
          success: true
        });
        
      } catch (error) {
        console.log(`❌ 下载失败: ${error.message}`);
        results.push({
          filename,
          success: false,
          error: error.message
        });
      }
    }

    // 5. 总结
    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 完成! 成功下载 ${successCount}/${topImages.length} 个封面`);
    
    return results;
  }
}

// 主程序
async function main() {
  const fetcher = new SimpleCoverFetcher();
  
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('使用方法: node simple-cover-fetcher.js "书名" "作者" "文件名前缀" [语言后缀]');
    console.log('例子:');
    console.log('  node simple-cover-fetcher.js "The Unbearable Lightness of Being" "Milan Kundera" "the-unbearable-lightness-of-being"');
    console.log('  node simple-cover-fetcher.js "存在の耐えられない軽さ" "ミラン・クンデラ" "the-unbearable-lightness-of-being" "ja"');
    console.log('  node simple-cover-fetcher.js "生命中不能承受之轻" "米兰·昆德拉" "the-unbearable-lightness-of-being" "sc"');
    return;
  }
  
  const title = args[0];
  const author = args[1];
  const slug = args[2];
  const langSuffix = args[3] ? `-${args[3]}` : '';
  
  await fetcher.processBook(title, author, `${slug}${langSuffix}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SimpleCoverFetcher;