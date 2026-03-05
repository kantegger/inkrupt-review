#!/usr/bin/env node
/**
 * 调整单个封面尺寸
 * 用法: node scripts/resize-cover.js <slug> [locale]
 * 示例: 
 *   node scripts/resize-cover.js babel           # 调整所有语言版本
 *   node scripts/resize-cover.js babel zh-CN     # 只调整简中版
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const COVERS_DIR = path.join(process.cwd(), 'public', 'images', 'covers');
const TARGET_WIDTH = 320;
const TARGET_HEIGHT = 480;

const LOCALE_SUFFIX = {
  'zh-CN': '-sc',
  'zh-TW': '-tc',
  'ja': '-ja',
  'en': ''
};

async function resizeCover(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, { 
        fit: 'cover', 
        position: 'centre' 
      })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`错误: ${error.message}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法: node scripts/resize-cover.js <slug> [locale]');
    console.log('');
    console.log('示例:');
    console.log('  node scripts/resize-cover.js babel        # 调整所有语言版本');
    console.log('  node scripts/resize-cover.js babel zh-CN  # 只调整简中版');
    process.exit(1);
  }
  
  const slug = args[0];
  const locale = args[1];
  
  const localesToProcess = locale ? [locale] : Object.keys(LOCALE_SUFFIX);
  
  console.log(`📐 调整封面尺寸: ${slug}\n`);
  
  for (const loc of localesToProcess) {
    const suffix = LOCALE_SUFFIX[loc];
    const coverName = `${slug}${suffix}.jpg`;
    const inputPath = path.join(COVERS_DIR, coverName);
    const tempPath = path.join(COVERS_DIR, `.temp-${coverName}`);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`  ⚠️  ${loc}: 文件不存在 (${coverName})`);
      continue;
    }
    
    try {
      const success = await resizeCover(inputPath, tempPath);
      if (success) {
        fs.renameSync(tempPath, inputPath);
        console.log(`  ✅ ${loc}: ${coverName}`);
      }
    } catch (error) {
      console.log(`  ❌ ${loc}: ${error.message}`);
    }
  }
  
  console.log('\n完成!');
}

main().catch(console.error);
