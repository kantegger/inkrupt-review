# 截图生成系统

这是一个服务器端截图预生成系统，用于为所有书评页面自动生成高质量的截图。

## 🎯 优势

- **性能优化**: 用户点击下载时直接获取预生成的图片，无需等待
- **跨平台兼容**: 避免了客户端浏览器的兼容性问题
- **高质量**: 服务器端渲染确保截图质量一致
- **智能更新**: 只有当markdown文件更改时才重新生成

## 📁 文件结构

```
/public/screenshots/
├── en/
│   ├── 1984.png          # 桌面版截图
│   ├── 1984-mobile.png   # 移动版截图
│   └── ...
├── ja/
├── zh-CN/
└── zh-TW/
```

## 🔧 使用方法

### 开发环境
```bash
# 生成所有截图（只生成有变更的）
npm run screenshots:generate

# 强制重新生成所有截图
npm run screenshots:force
```

### 生产环境
截图会在构建时自动生成：
```bash
npm run build  # 会自动运行 screenshots:generate
```

## ⚙️ 工作原理

1. **文件变更检测**: 使用MD5哈希检测markdown文件是否有变更
2. **浏览器渲染**: 使用Playwright启动Chromium浏览器
3. **截图生成**: 为每个页面生成桌面版和移动版截图
4. **哈希存储**: 保存文件哈希到 `.screenshot-hashes.json`

## 📱 前端集成

新的截图按钮会：
1. 检查预生成的截图是否存在
2. 直接触发下载，无需实时渲染
3. 在移动设备上提供额外的移动版截图选项

## 🛠️ 配置

主要配置在 `scripts/generate-screenshots.js` 中：

```javascript
const CONFIG = {
  baseUrl: 'http://localhost:3000',     // 开发服务器地址
  viewport: { width: 1200, height: 800 }, // 桌面版视口
  mobileViewport: { width: 375, height: 812 } // 移动版视口
};
```

## 🔍 故障排除

### 截图生成失败
1. 确保开发服务器在运行 (`npm run dev`)
2. 检查Playwright是否正确安装 (`npm install playwright`)
3. 查看控制台错误信息

### 下载失败
1. 检查 `/public/screenshots/` 目录是否存在相应文件
2. 确保构建时运行了截图生成
3. 检查浏览器开发者工具的网络面板

## 📝 注意事项

- 首次运行会为所有160个文件生成截图，需要一些时间
- 确保在构建前运行开发服务器，以便截图脚本能访问页面
- `.screenshot-hashes.json` 文件应添加到 `.gitignore` 中