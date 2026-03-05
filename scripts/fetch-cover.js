#!/usr/bin/env node
/**
 * 从 Amazon.sg 或 Open Library 获取图书封面
 * 优先使用 Amazon.sg（图片质量更高），如果失败则使用 Open Library
 * 
 * 使用方法:
 *   node scripts/fetch-cover.js "1984" "George Orwell" "1984"
 *   node scripts/fetch-cover.js "百年孤独" "加西亚·马尔克斯" "bai-nian-gu-du"
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const COVERS_DIR = path.join(process.cwd(), 'public', 'images', 'covers');
const TARGET_WIDTH = 320;
const TARGET_HEIGHT = 480;

// 确保目录存在
if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
}

/**
 * 发送 HTTP 请求
 */
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : require('http');
    const request = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        ...options.headers
      },
      timeout: 15000,
      ...options
    }, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve({ status: response.statusCode, data, headers: response.headers }));
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * 下载图片并保存
 */
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : require('http');
    const file = fs.createWriteStream(outputPath);
    
    const request = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://www.amazon.sg/'
      },
      timeout: 30000
    }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
    });
    
    request.on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
    
    request.on('timeout', () => {
      request.destroy();
      fs.unlink(outputPath, () => {});
      reject(new Error('Download timeout'));
    });
  });
}

/**
 * 从 Amazon.sg 搜索图书封面
 */
async function fetchFromAmazon(title, author) {
  console.log(`[Amazon.sg] 搜索: ${title} by ${author}`);
  
  try {
    const searchQuery = encodeURIComponent(`${title} ${author}`);
    const searchUrl = `https://www.amazon.sg/s?k=${searchQuery}`;
    
    const response = await fetch(searchUrl);
    
    if (response.status !== 200) {
      throw new Error(`Search failed with status ${response.status}`);
    }
    
    const html = response.data;
    
    // 查找 s-image 类的图片（Amazon 搜索结果中的产品图片）
    const imageMatches = [...html.matchAll(/class="s-image"[^>]*src="([^"]+)"/g)];
    
    if (imageMatches.length === 0) {
      throw new Error('No images found in search results');
    }
    
    // 获取第一个结果（通常是最佳匹配）
    let imageUrl = imageMatches[0][1];
    
    // 转换为高清版本（移除尺寸限制后缀）
    // 例如: ..._AC_UL320_.jpg -> ...jpg
    imageUrl = imageUrl.replace(/\._AC_UL\d+_\./, '.');
    imageUrl = imageUrl.replace(/\._SL\d+_\./, '.');
    
    console.log(`[Amazon.sg] 找到封面: ${imageUrl.substring(0, 80)}...`);
    
    return imageUrl;
    
  } catch (error) {
    console.error(`[Amazon.sg] 错误: ${error.message}`);
    return null;
  }
}

/**
 * 从 Open Library 获取封面（通过 ISBN）
 */
async function fetchFromOpenLibrary(isbn) {
  if (!isbn) return null;
  
  console.log(`[Open Library] 尝试 ISBN: ${isbn}`);
  
  try {
    // 尝试直接通过 ISBN 获取封面
    const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    
    // 检查图片是否存在（Open Library 对于不存在的封面会返回 1x1 像素的占位图）
    const response = await fetch(coverUrl);
    
    if (response.status === 200) {
      // 检查内容长度（占位图通常非常小）
      const contentLength = parseInt(response.headers['content-length'] || '0');
      if (contentLength > 1000) {
        console.log(`[Open Library] 找到封面: ${coverUrl}`);
        return coverUrl;
      }
    }
    
    throw new Error('Cover not found or too small');
    
  } catch (error) {
    console.error(`[Open Library] 错误: ${error.message}`);
    return null;
  }
}

/**
 * 从 Open Library 搜索图书信息
 */
async function searchOpenLibrary(title, author) {
  console.log(`[Open Library] 搜索: ${title} by ${author}`);
  
  try {
    const searchQuery = encodeURIComponent(`${title} ${author}`);
    const apiUrl = `https://openlibrary.org/search.json?q=${searchQuery}&limit=5`;
    
    const response = await fetch(apiUrl);
    
    if (response.status !== 200) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = JSON.parse(response.data);
    
    if (!data.docs || data.docs.length === 0) {
      throw new Error('No results found');
    }
    
    // 查找有封面的结果
    const resultWithCover = data.docs.find(doc => doc.cover_i);
    
    if (!resultWithCover) {
      throw new Error('No cover found in search results');
    }
    
    const coverId = resultWithCover.cover_i;
    const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    
    console.log(`[Open Library] 找到封面: ${coverUrl}`);
    
    return {
      coverUrl,
      isbn: resultWithCover.isbn?.[0],
      publishYear: resultWithCover.first_publish_year,
      publisher: resultWithCover.publisher?.[0]
    };
    
  } catch (error) {
    console.error(`[Open Library] 搜索错误: ${error.message}`);
    return null;
  }
}

/**
 * 调整图片尺寸为 320x480
 */
async function resizeImage(inputPath, outputPath) {
  try {
    const sharp = require('sharp');
    
    await sharp(inputPath)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, { 
        fit: 'cover', 
        position: 'centre' 
      })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(outputPath);
    
    return true;
  } catch (error) {
    console.error(`[Resize] 错误: ${error.message}`);
    // 如果 sharp 不可用，直接复制原图
    fs.copyFileSync(inputPath, outputPath);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('用法: node scripts/fetch-cover.js "书名" "作者" "文件名(slug)" [ISBN]');
    console.log('');
    console.log('示例:');
    console.log('  node scripts/fetch-cover.js "1984" "George Orwell" "1984" "9780451524935"');
    console.log('  node scripts/fetch-cover.js "百年孤独" "马尔克斯" "bai-nian-gu-du"');
    process.exit(1);
  }
  
  const [title, author, slug, isbn] = args;
  const outputPath = path.join(COVERS_DIR, `${slug}.jpg`);
  
  console.log(`\n📚 获取封面: ${title}`);
  console.log(`   作者: ${author}`);
  console.log(`   保存为: ${slug}.jpg\n`);
  
  // 检查是否已存在
  if (fs.existsSync(outputPath)) {
    console.log(`⚠️  封面已存在: ${outputPath}`);
    console.log('   使用 --force 覆盖或先删除现有文件');
    process.exit(0);
  }
  
  let imageUrl = null;
  let metadata = null;
  
  // 策略 1: 如果有 ISBN，先尝试 Open Library
  if (isbn) {
    imageUrl = await fetchFromOpenLibrary(isbn);
  }
  
  // 策略 2: 尝试 Amazon.sg
  if (!imageUrl) {
    imageUrl = await fetchFromAmazon(title, author);
  }
  
  // 策略 3: 尝试搜索 Open Library 获取更多信息
  if (!imageUrl) {
    metadata = await searchOpenLibrary(title, author);
    if (metadata) {
      imageUrl = metadata.coverUrl;
    }
  }
  
  if (!imageUrl) {
    console.error('\n❌ 无法找到封面图片');
    process.exit(1);
  }
  
  // 下载图片
  console.log(`\n⬇️  下载图片...`);
  const tempPath = path.join(COVERS_DIR, `.temp-${slug}.jpg`);
  
  try {
    await downloadImage(imageUrl, tempPath);
    console.log(`✅ 下载成功`);
    
    // 获取文件大小
    const stats = fs.statSync(tempPath);
    console.log(`   大小: ${(stats.size / 1024).toFixed(1)} KB`);
    
    // 调整尺寸
    console.log(`📐 调整尺寸为 ${TARGET_WIDTH}x${TARGET_HEIGHT}...`);
    await resizeImage(tempPath, outputPath);
    
    // 删除临时文件
    fs.unlinkSync(tempPath);
    
    console.log(`\n✅ 完成! 封面已保存: public/images/covers/${slug}.jpg`);
    
    // 输出获取到的元数据
    if (metadata) {
      console.log('\n📋 获取到的额外信息:');
      if (metadata.isbn) console.log(`   ISBN: ${metadata.isbn}`);
      if (metadata.publishYear) console.log(`   出版年份: ${metadata.publishYear}`);
      if (metadata.publisher) console.log(`   出版社: ${metadata.publisher}`);
    }
    
  } catch (error) {
    console.error(`\n❌ 下载失败: ${error.message}`);
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error('错误:', error.message);
  process.exit(1);
});
