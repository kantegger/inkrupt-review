/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  // 允许局域网IP访问开发服务器
  allowedDevOrigins: [
    '192.168.50.201',
    '192.168.*.*',
    '10.*.*.*',
    '172.16.*.*'
  ],
  // 针对现代浏览器优化
  compiler: {
    // 移除console语句（生产环境）
    removeConsole: process.env.NODE_ENV === 'production'
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // 移除不必要的polyfill
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      
      // 排除特定的polyfill
      config.externals = config.externals || [];
      config.externals.push({
        'core-js': 'core-js',
        'core-js/stable': 'core-js/stable',
        'regenerator-runtime': 'regenerator-runtime'
      });
    }
    return config;
  }
};

module.exports = nextConfig;
