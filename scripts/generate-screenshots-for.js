#!/usr/bin/env node
/**
 * 为指定书籍生成截图
 * 用法: node scripts/generate-screenshots-for.js <slug>
 * 示例: node scripts/generate-screenshots-for.js babel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const slug = process.argv[2];

if (!slug) {
  console.log('用法: node scripts/generate-screenshots-for.js <slug>');
  console.log('示例: node scripts/generate-screenshots-for.js babel');
  process.exit(1);
}

// 检查服务器是否在运行
function isServerRunning() {
  try {
    execSync('curl -s http://localhost:3000 > /dev/null 2>&1 || exit 1', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Windows 兼容的检查
function checkServerWindows() {
  try {
    const result = execSync('powershell -Command "try { Invoke-RestMethod -Uri http://localhost:3000 -TimeoutSec 2 -ErrorAction Stop; exit 0 } catch { exit 1 }"', { stdio: 'pipe' });
    return result.toString().trim() !== '';
  } catch {
    return false;
  }
}

const isWindows = process.platform === 'win32';
const serverRunning = isWindows ? checkServerWindows() : isServerRunning();

if (!serverRunning) {
  console.log('❌ 开发服务器未运行');
  console.log('');
  console.log('请先启动服务器:');
  console.log('  npm run dev');
  console.log('');
  console.log('然后在新终端中运行:');
  console.log(`  node scripts/generate-screenshots-for.js ${slug}`);
  process.exit(1);
}

console.log(`📸 为 ${slug} 生成截图...\n`);

const locales = ['zh-CN', 'zh-TW', 'ja', 'en'];
const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');

// 确保截图目录存在
for (const locale of locales) {
  const dir = path.join(screenshotsDir, locale);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 使用 generate-screenshots.js 的增量功能
// 通过创建临时哈希文件来只生成指定书籍的截图
const hashFile = path.join(process.cwd(), '.screenshot-hashes.json');
let hashes = {};

// 读取现有哈希
if (fs.existsSync(hashFile)) {
  hashes = JSON.parse(fs.readFileSync(hashFile, 'utf8'));
}

// 修改哈希，使指定书籍看起来需要重新生成
for (const locale of locales) {
  const filePath = path.join(process.cwd(), 'content', 'reviews', locale, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    // 删除该文件的哈希记录，触发重新生成
    delete hashes[filePath];
  }
}

// 保存修改后的哈希
fs.writeFileSync(hashFile, JSON.stringify(hashes, null, 2));

// 运行截图生成（增量模式）
try {
  execSync('npm run screenshots:incremental', { stdio: 'inherit' });
  console.log('\n✅ 截图生成完成！');
} catch (error) {
  console.error('\n❌ 截图生成失败:', error.message);
  process.exit(1);
}
