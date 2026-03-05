#!/usr/bin/env node
/**
 * 完整构建工作流
 * 运行所有必要的构建步骤
 * 
 * 用法: node scripts/build-all.js
 */

const { execSync } = require('child_process');

const steps = [
  {
    name: '📐 调整封面尺寸',
    command: 'npm run covers:resize'
  },
  {
    name: '📋 更新书籍清单',
    command: 'npm run inventory'
  },
  {
    name: '🏗️  构建站点',
    command: 'npm run build'
  }
];

console.log('🚀 开始完整构建流程\n');

let hasError = false;

for (const step of steps) {
  console.log(`${step.name}...`);
  try {
    execSync(step.command, { stdio: 'inherit' });
    console.log('   ✅ 完成\n');
  } catch (error) {
    console.log('   ❌ 失败\n');
    hasError = true;
    break;
  }
}

if (hasError) {
  console.log('⚠️  构建过程中出现错误');
  process.exit(1);
} else {
  console.log('✨ 全部完成！');
  console.log('输出目录: out/');
}
